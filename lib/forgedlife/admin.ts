import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createChurch, requireSuperAdminActor, type ChurchActor } from "@/lib/churches/repository";
import { createGroup } from "@/lib/facilitator-groups/repository";
import { createUserInvitation } from "@/lib/user-management/repository";
import { isFacilitatorRole, ROLES } from "@/lib/rbac/roles";
import { processStoredEvent, FORGED_SOURCE } from "@/lib/forgedlife/receive";
import { FORGED_SWITCHES, isSwitchOn, setSwitch, type ForgedSwitch } from "@/lib/forgedlife/switches";

// Super Admin decisions on what ForgedLife sent (/dashboard/forgedlife). This is the only
// place ForgedLife data reaches live MJG records:
//   • an access request → an MJG invite as a participant (never a higher role), or a link to the existing account
//   • a church → linked to an existing MJG church, or created
//   • a group → imported as a DRAFT Find a Group listing under its leader's facilitator account;
//     the facilitator (or an admin) publishes it, and only groups ForgedLife marks open to the public should be

const now = () => new Date().toISOString();

export async function getForgedOverview() {
  const db = createSupabaseAdminClient();
  const [requests, churches, groups, events, sync, smsOptIn] = await Promise.all([
    db.from("forgedlife_access_requests").select("*").order("status").order("updated_at", { ascending: false }).limit(300),
    db.from("forgedlife_churches").select("*").order("updated_at", { ascending: false }).limit(300),
    db.from("forgedlife_groups").select("*").order("updated_at", { ascending: false }).limit(300),
    db.from("integration_events").select("id,mode,event_id,event_type,status,error,received_at,processed_at").eq("source", FORGED_SOURCE).order("received_at", { ascending: false }).limit(150),
    isSwitchOn(FORGED_SWITCHES.sync),
    isSwitchOn(FORGED_SWITCHES.smsOptIn),
  ]);
  const { data: mjgChurches } = await db.from("churches").select("id,name,city,state").is("deleted_at", null).eq("status", "active").order("name");
  return {
    requests: requests.data ?? [],
    churches: churches.data ?? [],
    groups: groups.data ?? [],
    events: events.data ?? [],
    mjgChurches: mjgChurches ?? [],
    switches: { sync, smsOptIn },
    configured: {
      live: Boolean(process.env.FORGEDLIFE_WEBHOOK_SECRET?.trim()),
      test: Boolean(process.env.FORGEDLIFE_TEST_WEBHOOK_SECRET?.trim()),
    },
  };
}

export type ForgedOverview = Awaited<ReturnType<typeof getForgedOverview>>;

export async function decideRequest(actor: ChurchActor, id: string, decision: "approve" | "decline") {
  requireSuperAdminActor(actor);
  const db = createSupabaseAdminClient();
  const { data: req } = await db.from("forgedlife_access_requests").select("*").eq("id", id).maybeSingle();
  if (!req) throw new Error("Request not found.");
  if (req.status !== "pending" && req.status !== "declined") throw new Error(`This request is ${req.status}.`);

  if (decision === "decline") {
    await db.from("forgedlife_access_requests").update({ status: "declined", decided_by: actor.id, decided_at: now(), updated_at: now() }).eq("id", id);
    return { status: "declined" as const };
  }

  let profileId: string | null = req.profile_id;
  if (!profileId && req.email) {
    const { data: p } = await db.from("profiles").select("id").ilike("email", req.email).maybeSingle();
    profileId = p?.id ?? null;
  }
  let invitationId: string | null = null;
  let invited = false;
  if (!profileId) {
    if (!req.email) throw new Error("No email on this request, so there's no one to invite.");
    const { data: open } = await db.from("user_invitations").select("id").ilike("email", req.email).in("invite_status", ["pending", "sent"]).maybeSingle();
    if (open) invitationId = open.id;
    else {
      const inv = await createUserInvitation({ email: req.email, role: ROLES.PARTICIPANT, inviteMethod: "email", invitedBy: actor.id });
      invitationId = (inv as { id?: string })?.id ?? null;
      invited = true;
    }
  }
  await db
    .from("forgedlife_access_requests")
    .update({ status: "approved", profile_id: profileId, invitation_id: invitationId, decided_by: actor.id, decided_at: now(), updated_at: now() })
    .eq("id", id);
  return { status: "approved" as const, existingMember: Boolean(profileId), invited };
}

export async function linkChurch(actor: ChurchActor, id: string, target: { churchId: string } | { create: true }) {
  requireSuperAdminActor(actor);
  const db = createSupabaseAdminClient();
  const { data: fc } = await db.from("forgedlife_churches").select("*").eq("id", id).maybeSingle();
  if (!fc) throw new Error("Church not found.");
  if (fc.status === "deleted") throw new Error("ForgedLife deleted this church.");

  let churchId: string;
  if ("create" in target) {
    churchId = (await createChurch(actor, { name: fc.name, city: fc.city, state: fc.state })).id;
  } else {
    const { data: c } = await db.from("churches").select("id,external_id").eq("id", target.churchId).is("deleted_at", null).maybeSingle();
    if (!c) throw new Error("MJG church not found.");
    if (c.external_id && c.external_id !== fc.forged_id) throw new Error("That MJG church is already linked to another ForgedLife church.");
    churchId = c.id;
  }
  const { error } = await db.from("churches").update({ external_source: FORGED_SOURCE, external_id: fc.forged_id }).eq("id", churchId);
  if (error) throw error;
  await db.from("forgedlife_churches").update({ status: "linked", church_id: churchId, decided_by: actor.id, decided_at: now(), updated_at: now() }).eq("id", id);
  return { churchId };
}

export async function ignoreRecord(actor: ChurchActor, table: "churches" | "groups", id: string) {
  requireSuperAdminActor(actor);
  const db = createSupabaseAdminClient();
  const { error } = await db.from(`forgedlife_${table}`).update({ status: "ignored", decided_by: actor.id, decided_at: now(), updated_at: now() }).eq("id", id).neq("status", "deleted");
  if (error) throw error;
}

const AUDIENCE: Record<string, "men" | "women"> = { male: "men", men: "men", female: "women", women: "women" };

export async function importGroup(actor: ChurchActor, id: string) {
  requireSuperAdminActor(actor);
  const db = createSupabaseAdminClient();
  const { data: g } = await db.from("forgedlife_groups").select("*").eq("id", id).maybeSingle();
  if (!g) throw new Error("Group not found.");
  if (g.status === "imported" && g.group_id) throw new Error("Already imported.");
  if (g.status === "deleted") throw new Error("ForgedLife deleted this group.");

  const leaderEmail: string | null = g.leader?.email ?? null;
  if (!leaderEmail) throw new Error("The leader hasn't consented to share their details, so there's no one to own this listing.");
  const { data: leader } = await db.from("profiles").select("id,role").ilike("email", leaderEmail).maybeSingle();
  if (!leader || !isFacilitatorRole(leader.role)) {
    throw new Error(`${leaderEmail} has no MJG facilitator account. Invite them as a facilitator first, then import.`);
  }

  const { data: linked } = g.forged_church_id
    ? await db.from("forgedlife_churches").select("church_id").eq("forged_id", g.forged_church_id).maybeSingle()
    : { data: null };
  const capacity = !g.capacity || g.capacity <= 0 ? 200 : Math.min(200, g.capacity);
  const input = {
    title: g.name,
    description: g.description,
    audience: AUDIENCE[String(g.audience ?? "").toLowerCase()] ?? "mixed",
    churchOrg: g.church?.name ?? null,
    meetingDay: g.meeting_weekday ? g.meeting_weekday - 1 : null, // ForgedLife: 1 = Sunday; MJG: 0 = Sunday
    meetingTime: g.meeting_hour == null ? null : `${String(g.meeting_hour).padStart(2, "0")}:00`,
    timezone: g.timezone ?? "America/Phoenix",
    startDate: g.start_date,
    durationWeeks: g.length_days ? Math.max(1, Math.min(52, Math.round(g.length_days / 7))) : 6,
    format: "in_person" as const,
    venueName: g.location,
    city: g.church?.city ?? null,
    state: g.church?.state ?? null,
    capacity,
    bookingMode: g.requires_approval === false ? ("auto" as const) : ("approval" as const),
  };

  let created;
  try {
    created = await createGroup(leader.id, { ...input, churchId: linked?.church_id ?? null }, actor.id);
  } catch (e) {
    // The leader isn't an approved facilitator for that MJG church yet: import it unattached.
    if (!linked?.church_id) throw e;
    created = await createGroup(leader.id, input, actor.id);
  }
  await db.from("facilitator_groups").update({ external_source: FORGED_SOURCE, external_id: g.forged_id }).eq("id", created.id);
  await db.from("forgedlife_groups").update({ status: "imported", group_id: created.id, decided_by: actor.id, decided_at: now(), updated_at: now() }).eq("id", id);
  return { groupId: created.id };
}

export async function replayEvent(actor: ChurchActor, id: string) {
  requireSuperAdminActor(actor);
  if (!(await isSwitchOn(FORGED_SWITCHES.sync))) throw new Error("Turn on “Apply live events” first.");
  return processStoredEvent(id);
}

export async function setForgedSwitch(actor: ChurchActor, key: ForgedSwitch, enabled: boolean) {
  requireSuperAdminActor(actor);
  await setSwitch(key, enabled);
}
