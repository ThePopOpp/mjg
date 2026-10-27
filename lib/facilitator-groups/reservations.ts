import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { upsertParticipant } from "@/lib/pilot/repository";
import { addAttendeeToExperience } from "@/lib/experiences/add-attendee";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { brandEmailButton, brandEmailHeader } from "@/lib/brand/assets";
import { appUrl } from "@/lib/public-site/static-pages";
import { dmBadge, getNotifierId } from "@/lib/notifications/system-dm";
import { getGroup, getManagedGroup, rowToReservation, type Actor } from "./repository";
import { FORMATS, scheduleLabel, type OwnerGroup, type Reservation, type ReservationStatus } from "./shared";

// Taking, deciding and releasing spots. The capacity math lives in the row-locking SQL
// functions (migration 202610270124); this layer authorizes, then joins confirmed people to
// the facilitator's team (and the group's experience drip) and sends the notices.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const RPC_ERRORS: Record<string, string> = {
  group_not_found: "That group no longer exists.",
  group_not_open: "This group isn't taking requests right now.",
  own_group: "That's your own group.",
  no_room: "There's no room left in this group. Raise the capacity or free a spot first.",
  not_pending: "That request has already been decided.",
  reservation_not_found: "Request not found.",
};
function rpcError(error: { message?: string } | null) {
  const key = Object.keys(RPC_ERRORS).find((k) => error?.message?.includes(k));
  return new Error(key ? RPC_ERRORS[key] : error?.message || "Something went wrong.");
}

function splitName(name: string | null | undefined, email: string) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || email, lastName: parts.slice(1).join(" ") };
}

/** Exact meeting place, for confirmed members (email + their dashboard). */
export function meetingPlace(g: OwnerGroup): string {
  if (g.format === "online") return "Online — your facilitator will send the link.";
  const addr = [g.venueName, g.addressLine, [g.city, g.state].filter(Boolean).join(", "), g.postalCode].filter(Boolean).join(" · ");
  return g.format === "hybrid" ? `${addr} (or join online)` : addr;
}

// ── Joining / leaving the team ───────────────────────────────────────────────────

async function joinTeam(group: OwnerGroup, r: { id: string; name: string | null; email: string | null }) {
  if (!r.email) return;
  const supabase = createSupabaseAdminClient();
  const participant = await upsertParticipant({ ...splitName(r.name, r.email), email: r.email, participantType: "general_participant" });
  await supabase.from("facilitator_group_reservations").update({ participant_id: participant.id }).eq("id", r.id);
  if (group.teamId) {
    await supabase.from("facilitator_team_members").upsert({ team_id: group.teamId, participant_id: participant.id }, { onConflict: "team_id,participant_id" });
  }
  if (group.experienceId) {
    await addAttendeeToExperience(group.experienceId, { name: r.name ?? undefined, email: r.email }, group.facilitatorId).catch((e) =>
      console.error("[groups] experience attendee add failed", e instanceof Error ? e.message : e),
    );
  }
}

async function leaveTeam(group: OwnerGroup, reservationId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: r } = await supabase.from("facilitator_group_reservations").select("participant_id,email").eq("id", reservationId).maybeSingle();
  if (r?.participant_id && group.teamId) {
    await supabase.from("facilitator_team_members").delete().eq("team_id", group.teamId).eq("participant_id", r.participant_id);
  }
  if (r?.email && group.experienceId) {
    await supabase.from("experience_attendees").update({ opted_out: true }).eq("experience_id", group.experienceId).ilike("email", r.email);
  }
}

// ── Notices ──────────────────────────────────────────────────────────────────────

function emailShell(title: string, bodyHtml: string, cta?: { href: string; label: string }) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#191815;line-height:1.55;">
  ${brandEmailHeader()}
  <h2 style="font-family:Georgia,serif;font-weight:600;margin:8px 0 12px;">${esc(title)}</h2>
  ${bodyHtml}
  ${cta ? `<p style="margin-top:22px;">${brandEmailButton(cta.href, esc(cta.label))}</p>` : ""}
</div>`;
}

function groupFacts(g: OwnerGroup, exact: boolean) {
  const where = exact ? meetingPlace(g) : g.format === "online" ? "Online" : [g.city, g.state].filter(Boolean).join(", ");
  const start = g.startDate ? `<br/><strong>Starts:</strong> ${esc(new Date(`${g.startDate}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))}` : "";
  return `<p style="background:#f6f2ea;border-radius:8px;padding:12px 14px;"><strong>${esc(g.title)}</strong><br/>${esc(scheduleLabel(g))}<br/><strong>${exact ? "Where" : "Area"}:</strong> ${esc(where)}${start}<br/><strong>Format:</strong> ${esc(FORMATS[g.format])}</p>`;
}

async function profileContact(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("first_name,last_name,email").eq("id", profileId).maybeSingle();
  return { name: [data?.first_name, data?.last_name].filter(Boolean).join(" ") || data?.email || "Your facilitator", email: data?.email ?? null };
}

/** Tell the participant what happened to their request. Best effort. */
async function notifyParticipant(group: OwnerGroup, r: Reservation, status: ReservationStatus) {
  if (!r.email) return;
  try {
    const facilitator = await profileContact(group.facilitatorId);
    const groupUrl = `${appUrl()}/groups/${group.slug}`;
    const messages: Partial<Record<ReservationStatus, { subject: string; title: string; body: string; cta?: { href: string; label: string } }>> = {
      confirmed: {
        subject: `You're in: ${group.title}`,
        title: "Your spot is confirmed",
        body: `<p>You have a spot in ${esc(facilitator.name)}'s group. Here are the details:</p>${groupFacts(group, true)}<p>Questions? Message ${esc(facilitator.name)} from your MJG dashboard.</p>`,
        cta: { href: `${appUrl()}/dashboard`, label: "Open my dashboard" },
      },
      pending: {
        subject: `Request sent: ${group.title}`,
        title: "We sent your request",
        body: `<p>${esc(facilitator.name)} will review it and you'll get an email as soon as they respond.</p>${groupFacts(group, false)}`,
        cta: { href: groupUrl, label: "View the group" },
      },
      waitlisted: {
        subject: `You're on the waitlist: ${group.title}`,
        title: "You're on the waitlist",
        body: `<p>This group is full right now. If a spot opens, ${esc(facilitator.name)} can offer it to you and we'll email you.</p>${groupFacts(group, false)}`,
        cta: { href: `${appUrl()}/groups`, label: "See other groups" },
      },
      declined: {
        subject: `About your request: ${group.title}`,
        title: "This group isn't the right fit",
        body: `<p>${esc(facilitator.name)} wasn't able to offer you a spot in this group. There are other groups that may work for your schedule.</p>`,
        cta: { href: `${appUrl()}/groups`, label: "Find another group" },
      },
    };
    const m = messages[status];
    if (!m) return;
    await sendSmtpEmail({ to: r.email, subject: m.subject, html: emailShell(m.title, m.body, m.cta) });
  } catch (e) {
    console.error("[groups] participant notice failed", e instanceof Error ? e.message : e);
  }
}

/** Tell the facilitator about a new request (DM badge + email). Best effort. */
async function notifyFacilitator(group: OwnerGroup, r: Reservation) {
  try {
    const supabase = createSupabaseAdminClient();
    const who = r.name || "Someone";
    const verb = r.status === "confirmed" ? "booked a spot in" : r.status === "waitlisted" ? "joined the waitlist for" : "asked to join";
    const line = `${who} ${verb} ${group.title}${r.partySize > 1 ? ` (party of ${r.partySize})` : ""}.`;
    const manageUrl = `${appUrl()}/dashboard/facilitator-listing?group=${group.id}`;
    const notifier = await getNotifierId(supabase);
    if (notifier) {
      await dmBadge(supabase, notifier, group.facilitatorId, `${line}${r.status === "pending" ? " Approve or decline it in Facilitator Listing." : ""} ${manageUrl}`);
    }
    const facilitator = await profileContact(group.facilitatorId);
    if (facilitator.email) {
      const note = r.message ? `<p style="border-left:3px solid #C9A46E;padding-left:12px;color:#5c564d;">${esc(r.message)}</p>` : "";
      await sendSmtpEmail({
        to: facilitator.email,
        subject: r.status === "pending" ? `New request to join ${group.title}` : `New member: ${group.title}`,
        html: emailShell(
          r.status === "pending" ? "Someone wants to join your group" : "Your group has a new member",
          `<p>${esc(line)}</p>${note}${r.status === "pending" ? "<p>Approve or decline the request in your dashboard.</p>" : ""}`,
          { href: manageUrl, label: r.status === "pending" ? "Review the request" : "See your roster" },
        ),
      });
    }
  } catch (e) {
    console.error("[groups] facilitator notice failed", e instanceof Error ? e.message : e);
  }
}

async function loadReservation(id: string): Promise<Reservation | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("facilitator_group_reservations").select("*").eq("id", id).maybeSingle();
  return data ? rowToReservation(data) : null;
}

// ── Actions ──────────────────────────────────────────────────────────────────────

/** A signed-in participant asks for a spot. */
export async function requestSpot(
  me: { id: string; email: string | null; name: string },
  groupId: string,
  input: { partySize?: number; message?: string | null },
): Promise<{ reservation: Reservation; already: boolean }> {
  const supabase = createSupabaseAdminClient();
  const party = Math.min(4, Math.max(1, Math.round(Number(input.partySize) || 1)));
  const message = (input.message ?? "").toString().trim().slice(0, 1000) || null;
  const { data, error } = await supabase.rpc("request_group_spot", {
    p_group: groupId,
    p_profile: me.id,
    p_party: party,
    p_message: message,
    p_name: me.name,
    p_email: me.email,
  });
  if (error) throw rpcError(error);
  const row = Array.isArray(data) ? data[0] : data;
  const reservation = (await loadReservation(row.reservation_id))!;
  if (!row.already) {
    const group = (await getGroup(groupId))!;
    if (reservation.status === "confirmed") await joinTeam(group, reservation);
    await Promise.all([notifyParticipant(group, reservation, reservation.status), notifyFacilitator(group, reservation)]);
  }
  return { reservation, already: Boolean(row.already) };
}

/** Facilitator/admin: approve (confirm), decline, or remove (cancel) someone. */
export async function decideReservation(actor: Actor, reservationId: string, decision: "confirm" | "decline" | "cancel") {
  const before = await loadReservation(reservationId);
  if (!before) throw new Error("Request not found.");
  const group = await getManagedGroup(actor, before.groupId);
  const supabase = createSupabaseAdminClient();
  const { data: status, error } = await supabase.rpc("decide_group_reservation", { p_reservation: reservationId, p_decision: decision, p_actor: actor.id });
  if (error) throw rpcError(error);
  const after = (await loadReservation(reservationId))!;
  if (status === "confirmed" && before.status !== "confirmed") {
    await joinTeam(group, after);
    await notifyParticipant(group, after, "confirmed");
  } else if (status === "declined") {
    await notifyParticipant(group, after, "declined");
  } else if (status === "canceled" && before.status === "confirmed") {
    await leaveTeam(group, reservationId);
  }
  return after;
}

/** The participant withdraws their own request / spot. */
export async function cancelMyReservation(me: { id: string }, reservationId: string) {
  const r = await loadReservation(reservationId);
  if (!r || r.profileId !== me.id) throw new Error("Request not found.");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.rpc("decide_group_reservation", { p_reservation: reservationId, p_decision: "cancel", p_actor: me.id });
  if (error) throw rpcError(error);
  if (r.status === "confirmed") {
    const group = await getGroup(r.groupId);
    if (group) await leaveTeam(group, reservationId);
  }
  return loadReservation(reservationId);
}

/** The facilitator adds someone they recruited (takes a confirmed spot). */
export async function addGroupMember(
  actor: Actor,
  groupId: string,
  input: { name?: string; email: string; phone?: string; partySize?: number },
  source: "facilitator" | "import" = "facilitator",
) {
  const group = await getManagedGroup(actor, groupId);
  const email = (input.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("A valid email is required.");
  const name = (input.name ?? "").trim() || null;
  const participant = await upsertParticipant({ ...splitName(name, email), email, phone: input.phone, participantType: "general_participant" });
  const supabase = createSupabaseAdminClient();
  const { data: rid, error } = await supabase.rpc("add_group_member", {
    p_group: groupId,
    p_participant: participant.id,
    p_name: name,
    p_email: email,
    p_party: Math.min(4, Math.max(1, Math.round(Number(input.partySize) || 1))),
    p_actor: actor.id,
    p_source: source,
  });
  if (error) throw rpcError(error);
  const reservation = (await loadReservation(rid as string))!;
  await joinTeam(group, reservation);
  return reservation;
}

/** A participant's own reservations (their dashboard "My Group" card). */
export async function listMyReservations(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("facilitator_group_reservations")
    .select("*")
    .eq("profile_id", profileId)
    .in("status", ["pending", "confirmed", "waitlisted"])
    .order("created_at", { ascending: false });
  const out: Array<{ reservation: Reservation; group: OwnerGroup; place: string | null; facilitatorName: string }> = [];
  for (const row of data ?? []) {
    const group = await getGroup(row.group_id);
    if (!group) continue;
    const facilitator = await profileContact(group.facilitatorId);
    const reservation = rowToReservation(row);
    out.push({ reservation, group, place: reservation.status === "confirmed" ? meetingPlace(group) : null, facilitatorName: facilitator.name });
  }
  return out;
}
