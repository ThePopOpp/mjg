import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { csvToObjects } from "@/lib/csv";
import { ROLES } from "@/lib/rbac/roles";
import { createUserInvitation } from "@/lib/user-management/repository";
import { appUrl } from "@/lib/public-site/static-pages";
import { createGroup, getFacilitatorProfile, saveFacilitatorProfile } from "./repository";
import { DAYS, type GroupInput } from "./shared";

// Super-Admin bulk import of facilitators from a CSV. Two steps: preview (validate every row,
// nothing written) and commit (invite + park listing details). Idempotent by email: running
// the same file twice won't double-invite.

const ALIASES: Record<string, string> = {
  "first name": "firstName", firstname: "firstName", first: "firstName",
  "last name": "lastName", lastname: "lastName", last: "lastName",
  name: "fullName", "full name": "fullName",
  email: "email", "email address": "email",
  phone: "phone", mobile: "phone", cell: "phone", "phone number": "phone",
  church: "churchOrg", "church name": "churchOrg", organization: "churchOrg", org: "churchOrg", "church/org": "churchOrg", "church org": "churchOrg",
  city: "city", state: "state",
  bio: "bio",
  "group title": "groupTitle", "group name": "groupTitle", group: "groupTitle",
  day: "day", "meeting day": "day",
  time: "time", "meeting time": "time",
  capacity: "capacity", spots: "capacity",
  format: "format",
  "start date": "startDate", start: "startDate",
};

export type ImportRow = {
  line: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  churchOrg: string | null;
  city: string | null;
  state: string | null;
  bio: string | null;
  group: Partial<GroupInput> | null;
  action: "invite" | "update" | "skip";
  notes: string[];
  error: string | null;
};

function parseDay(v?: string) {
  if (!v) return null;
  const i = DAYS.findIndex((d) => d.toLowerCase().startsWith(v.trim().toLowerCase().slice(0, 3)));
  return i >= 0 ? i : null;
}

function parseTime(v?: string) {
  if (!v) return null;
  const m = v.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ?? "00";
  if (m[3]?.startsWith("p") && h < 12) h += 12;
  if (m[3]?.startsWith("a") && h === 12) h = 0;
  return h <= 23 ? `${String(h).padStart(2, "0")}:${min}` : null;
}

function parseDate(v?: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

/** Validate the file and say what would happen to each row. Writes nothing. */
export async function previewFacilitatorImport(csv: string): Promise<{ rows: ImportRow[]; recognized: string[] }> {
  const { columns, records } = csvToObjects(csv, ALIASES);
  if (!records.length) throw new Error("The file has no rows.");
  if (records.length > 1000) throw new Error("Import up to 1,000 facilitators at a time.");
  if (!columns.includes("email")) throw new Error("The file needs an Email column.");

  const supabase = createSupabaseAdminClient();
  const emails = records.map((r) => (r.email ?? "").trim().toLowerCase()).filter(Boolean);
  const [{ data: profiles }, { data: invites }] = await Promise.all([
    supabase.from("profiles").select("id,email,role,status").in("email", emails),
    supabase.from("user_invitations").select("email,invite_status").in("email", emails).in("invite_status", ["pending", "sent"]),
  ]);
  const profileBy = new Map((profiles ?? []).map((p: any) => [String(p.email).toLowerCase(), p]));
  const invited = new Set((invites ?? []).map((i: any) => String(i.email).toLowerCase()));

  const seen = new Set<string>();
  const rows = records.map((r, i): ImportRow => {
    const email = (r.email ?? "").trim().toLowerCase();
    let [firstName, lastName] = [r.firstName ?? "", r.lastName ?? ""];
    if (!firstName && r.fullName) {
      const parts = r.fullName.trim().split(/\s+/);
      firstName = parts[0] ?? "";
      lastName = parts.slice(1).join(" ");
    }
    const notes: string[] = [];
    let error: string | null = null;
    let action: ImportRow["action"] = "invite";

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) error = "Missing or invalid email.";
    else if (seen.has(email)) error = "Duplicate email in this file.";
    seen.add(email);

    const existing: any = profileBy.get(email);
    if (!error && existing) {
      if (existing.role === ROLES.FACILITATOR) {
        action = "update";
        notes.push("Already a facilitator — their listing details will be filled in.");
      } else {
        action = "skip";
        notes.push(`Already has an account as ${String(existing.role).replace(/_/g, " ")} — change their role in User Management first.`);
      }
    } else if (!error && invited.has(email)) {
      notes.push("Already invited — no second invite; listing details will be saved.");
    }

    let group: Partial<GroupInput> | null = null;
    if (r.groupTitle || r.day || r.time) {
      const day = parseDay(r.day);
      const time = parseTime(r.time);
      if (r.day && day == null) notes.push(`Couldn't read day "${r.day}".`);
      if (r.time && !time) notes.push(`Couldn't read time "${r.time}".`);
      const fmt = (r.format ?? "").toLowerCase();
      group = {
        title: r.groupTitle || `${firstName || "Our"}'s 6-Week Challenge group`.replace(/^Our's/, "Our"),
        meetingDay: day,
        meetingTime: time,
        capacity: r.capacity ? Number(r.capacity) || 10 : 10,
        format: fmt.startsWith("on") ? "online" : fmt.startsWith("hy") ? "hybrid" : "in_person",
        city: r.city ?? null,
        state: r.state ?? null,
        churchOrg: r.churchOrg ?? null,
        startDate: parseDate(r.startDate),
      };
    }

    return {
      line: i + 2,
      email,
      firstName,
      lastName,
      phone: r.phone ?? null,
      churchOrg: r.churchOrg ?? null,
      city: r.city ?? null,
      state: r.state ?? null,
      bio: r.bio ?? null,
      group,
      action: error ? "skip" : action,
      notes,
      error,
    };
  });
  return { rows, recognized: columns };
}

/** Run the import: invite new facilitators (now or at a date) and park their listing details. */
export async function commitFacilitatorImport(csv: string, actorId: string, opts: { sendAt?: string | null }) {
  const { rows } = await previewFacilitatorImport(csv);
  const supabase = createSupabaseAdminClient();
  const result = { invited: 0, updated: 0, skipped: 0, failed: [] as Array<{ line: number; email: string; error: string }> };

  for (const row of rows) {
    if (row.action === "skip") { result.skipped++; continue; }
    try {
      const data = {
        firstName: row.firstName, lastName: row.lastName, phone: row.phone, churchOrg: row.churchOrg,
        city: row.city, state: row.state, bio: row.bio, group: row.group,
      };
      if (row.action === "update") {
        const { data: prof } = await supabase.from("profiles").select("id").ilike("email", row.email).maybeSingle();
        if (prof) await applyPrefill(prof.id, data);
        result.updated++;
        continue;
      }
      const { data: open } = await supabase
        .from("user_invitations").select("id").ilike("email", row.email).in("invite_status", ["pending", "sent"]).maybeSingle();
      let invitationId = open?.id ?? null;
      let sendError: string | null = null;
      if (!invitationId) {
        try {
          const inv = await createUserInvitation({
            email: row.email,
            phone: row.phone ?? undefined,
            role: ROLES.FACILITATOR,
            inviteMethod: "email",
            invitedBy: actorId,
            siteUrl: appUrl(),
            scheduledSendAt: opts.sendAt ?? null,
          });
          invitationId = inv.id;
        } catch (e) {
          // The invitation row is saved even when its email fails — keep the details and report it.
          sendError = e instanceof Error ? e.message : String(e);
        }
      }
      await supabase.from("facilitator_prefills").upsert(
        { email: row.email, data, imported_by: actorId, invitation_id: invitationId, applied_at: null, updated_at: new Date().toISOString() },
        { onConflict: "email" },
      );
      if (sendError) result.failed.push({ line: row.line, email: row.email, error: sendError });
      else result.invited++;
    } catch (e) {
      result.failed.push({ line: row.line, email: row.email, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return result;
}

type PrefillData = {
  firstName?: string; lastName?: string; phone?: string | null; churchOrg?: string | null;
  city?: string | null; state?: string | null; bio?: string | null; group?: Partial<GroupInput> | null;
};

/** Create the facilitator's public profile (and a draft group) from imported details. */
async function applyPrefill(profileId: string, data: PrefillData) {
  const existing = await getFacilitatorProfile(profileId);
  if (!existing) {
    const displayName = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
    if (displayName) {
      await saveFacilitatorProfile(profileId, { displayName, bio: data.bio, churchOrg: data.churchOrg, city: data.city, state: data.state });
    }
  }
  if (data.group?.title) {
    const supabase = createSupabaseAdminClient();
    const { count } = await supabase.from("facilitator_groups").select("id", { count: "exact", head: true }).eq("facilitator_id", profileId);
    if (!count) await createGroup(profileId, data.group as GroupInput, profileId);
  }
}

/** Called when a facilitator opens Facilitator Listing: apply any imported details once. */
export async function applyPendingPrefill(profile: { id: string; email: string | null }) {
  if (!profile.email) return false;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("facilitator_prefills").select("data,applied_at").eq("email", profile.email.toLowerCase()).maybeSingle();
  if (!data || data.applied_at) return false;
  await applyPrefill(profile.id, data.data as PrefillData);
  await supabase.from("facilitator_prefills").update({ applied_at: new Date().toISOString() }).eq("email", profile.email.toLowerCase());
  return true;
}
