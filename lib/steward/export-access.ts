import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Who may export their Steward conversation history.
//
// Owner tooling, not a member feature: Mike and Jeremy export their own test
// conversations and hand them to Mike's ChatGPT Steward to find where the app's
// Steward goes off. Same group as "View as" — a REAL Super Admin (from
// profiles, never the viewed role) who has view-as roles in profile_view_roles.
// That is exactly those two accounts today, and adding someone to View as is a
// deliberate act in the database, so this cannot widen by accident.
//
// Each person only ever exports their OWN conversations; this check decides
// whether the feature exists for them at all.

export async function canExportStewardHistory(profileId: string): Promise<boolean> {
  const db = createSupabaseAdminClient();
  const [{ data: profile }, { data: viewRoles }] = await Promise.all([
    db.from("profiles").select("role").eq("id", profileId).maybeSingle(),
    db.from("profile_view_roles").select("roles").eq("profile_id", profileId).maybeSingle(),
  ]);
  if (!profile || profile.role !== "super_admin") return false;
  return Array.isArray(viewRoles?.roles) && viewRoles.roles.length > 0;
}
