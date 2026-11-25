import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { FLAGS, isFeatureEnabled } from "@/lib/flags";
import { getCurrentProfile } from "@/lib/auth/server";

// The two Leadership Check-In release switches (migration 202611250149), both OFF
// until Mike approves. Super admins always pass a flag, so they can preview.

/** Globally on — for things every visitor sees (hub card, sitemap, indexing). */
export async function leadershipFlagOn(key: typeof FLAGS.LEADERSHIP_PUBLIC | typeof FLAGS.LEADERSHIP_STEWARD): Promise<boolean> {
  const { data, error } = await createSupabaseAdminClient().from("feature_flags").select("enabled").eq("key", key).maybeSingle();
  return !error && data?.enabled === true;
}

/** What this viewer may see: the page (public or previewing) and the Steward hand-off. */
export async function leadershipAccess() {
  const profile = await getCurrentProfile().catch(() => null);
  const real = profile && profile.id !== "local-preview" ? profile : null;
  const subject = real ? { id: real.id, role: real.role } : null;
  const [isPublic, page, steward] = await Promise.all([
    leadershipFlagOn(FLAGS.LEADERSHIP_PUBLIC),
    subject ? isFeatureEnabled(FLAGS.LEADERSHIP_PUBLIC, subject) : Promise.resolve(false),
    subject ? isFeatureEnabled(FLAGS.LEADERSHIP_STEWARD, subject) : leadershipFlagOn(FLAGS.LEADERSHIP_STEWARD),
  ]);
  return { profile: real, isPublic, canView: isPublic || page, preview: !isPublic && page, steward };
}

/** Steward may read this member's Leadership Check-In results. */
export async function stewardReadsLeadership(profileId: string, role: string | null | undefined) {
  return isFeatureEnabled(FLAGS.LEADERSHIP_STEWARD, { id: profileId, role }).catch(() => false);
}
