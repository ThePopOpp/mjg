import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ROLES } from "@/lib/rbac/roles";
import { getFacilitatorTeam } from "@/lib/facilitator/team";

export type DmPerson = { id: string; name: string; email: string };

const personName = (p: any) => `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || p?.email || "Unknown";
const lc = (e: string | null | undefined) => (e ?? "").trim().toLowerCase();

async function profilesByEmails(emails: Set<string>, excludeId: string): Promise<DmPerson[]> {
  const list = Array.from(emails).filter(Boolean);
  if (!list.length) return [];
  const supabase = createSupabaseAdminClient();
  const orFilter = list.map((e) => `email.ilike.${e.replace(/[,()%]/g, "")}`).join(",");
  const { data } = await supabase.from("profiles").select("id, first_name, last_name, email").eq("status", "active").or(orFilter);
  return (data ?? []).filter((p: any) => p.id !== excludeId).map((p: any) => ({ id: p.id, name: personName(p), email: p.email ?? "" }));
}

async function profilesByIds(ids: Set<string>, excludeId: string): Promise<DmPerson[]> {
  const list = Array.from(ids).filter((id) => id && id !== excludeId);
  if (!list.length) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("id, first_name, last_name, email").eq("status", "active").in("id", list);
  return (data ?? []).map((p: any) => ({ id: p.id, name: personName(p), email: p.email ?? "" }));
}

// The people a facilitator or participant may start a DM with — their group only.
// Facilitator → the participants they lead. Participant → their teammates + facilitator(s).
export async function getGroupPeople(profile: { id: string; role: string; email: string | null }): Promise<DmPerson[]> {
  const supabase = createSupabaseAdminClient();
  const emails = new Set<string>();
  const profileIds = new Set<string>();

  if (profile.role === ROLES.FACILITATOR) {
    const team = await getFacilitatorTeam(profile.id);
    team.participants.forEach((p) => { const e = lc(p.email); if (e) emails.add(e); });
  } else if (profile.role === ROLES.PARTICIPANT) {
    const addr = lc(profile.email);
    if (!addr) return [];
    const { data: mine } = await supabase.from("participants").select("id").ilike("email", addr);
    const myIds = (mine ?? []).map((r: any) => r.id as string);
    if (!myIds.length) return [];
    const { data: myMemb } = await supabase.from("facilitator_team_members").select("team_id").in("participant_id", myIds);
    const teamIds = Array.from(new Set((myMemb ?? []).map((m: any) => m.team_id as string)));
    if (!teamIds.length) return [];
    const { data: members } = await supabase.from("facilitator_team_members").select("participant_id").in("team_id", teamIds);
    const memberIds = Array.from(new Set((members ?? []).map((m: any) => m.participant_id as string))).filter((id) => !myIds.includes(id));
    if (memberIds.length) {
      const { data: teammates } = await supabase.from("participants").select("email").in("id", memberIds);
      (teammates ?? []).forEach((p: any) => { const e = lc(p.email); if (e) emails.add(e); });
    }
    const { data: teams } = await supabase.from("facilitator_teams").select("facilitator_id").in("id", teamIds);
    (teams ?? []).forEach((t: any) => { if (t.facilitator_id) profileIds.add(t.facilitator_id as string); });
  } else {
    return [];
  }

  const [byEmail, byId] = await Promise.all([profilesByEmails(emails, profile.id), profilesByIds(profileIds, profile.id)]);
  const seen = new Set<string>();
  const people: DmPerson[] = [];
  for (const p of [...byEmail, ...byId]) { if (!seen.has(p.id)) { seen.add(p.id); people.push(p); } }
  return people.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGroupMemberIds(profile: { id: string; role: string; email: string | null }): Promise<Set<string>> {
  return new Set((await getGroupPeople(profile)).map((p) => p.id));
}
