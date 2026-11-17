import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getWelcomeSettings, readinessProblems, type WelcomeSettings } from "@/lib/facilitator-welcome/series";

// Settings and status for the Facilitator Welcome Series card (Emails → Automations).

export type WelcomeOverview = {
  settings: WelcomeSettings;
  problems: string[];
  enrolled: number;
  pending: number;
  sent: number;
  skipped: number;
  failed: number;
};

export async function getWelcomeOverview(): Promise<WelcomeOverview> {
  const db = createSupabaseAdminClient();
  const settings = await getWelcomeSettings();
  const count = async (status?: string) => {
    let q = db.from("facilitator_welcome_events").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count: n } = await q;
    return n ?? 0;
  };
  const [{ count: enrolled }, pending, sent, skipped, failed] = await Promise.all([
    db.from("facilitator_welcome_enrollments").select("id", { count: "exact", head: true }),
    count("pending"),
    count("sent"),
    count("skipped"),
    count("failed"),
  ]);
  return { settings, problems: readinessProblems(settings), enrolled: enrolled ?? 0, pending, sent, skipped, failed };
}

const URL_FIELDS = ["handbook_url", "assessment_url", "resources_url", "instagram_url", "facebook_url", "linkedin_url"] as const;

/** Only https links: they go into emails and a text message as-is. */
function cleanUrl(value: unknown, label: string): string | null {
  const v = typeof value === "string" ? value.trim() : "";
  if (!v) return null;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    throw new Error(`${label} is not a valid link.`);
  }
  if (url.protocol !== "https:") throw new Error(`${label} must start with https://.`);
  return url.toString();
}

const LABELS: Record<(typeof URL_FIELDS)[number], string> = {
  handbook_url: "Handbook link",
  assessment_url: "Check-In link",
  resources_url: "Resources link",
  instagram_url: "Instagram link",
  facebook_url: "Facebook link",
  linkedin_url: "LinkedIn link",
};

export async function saveWelcomeSettings(input: Record<string, unknown>, actorId: string): Promise<WelcomeOverview> {
  const next: Partial<WelcomeSettings> & { updated_by: string; updated_at: string } = {
    updated_by: actorId,
    updated_at: new Date().toISOString(),
  };
  for (const field of URL_FIELDS) {
    if (field in input) {
      const v = cleanUrl(input[field], LABELS[field]);
      if ((field === "assessment_url" || field === "resources_url") && !v) throw new Error(`${LABELS[field]} is required.`);
      (next as Record<string, unknown>)[field] = v;
    }
  }
  if ("mailing_address" in input) {
    const v = typeof input.mailing_address === "string" ? input.mailing_address.trim().replace(/\s*\n\s*/g, ", ") : "";
    if (v.length > 300) throw new Error("Postal address is too long.");
    next.mailing_address = v || null;
  }
  if ("enabled" in input) next.enabled = input.enabled === true;

  const current = await getWelcomeSettings();
  const merged = { ...current, ...next } as WelcomeSettings;
  if (merged.enabled) {
    const problems = readinessProblems(merged);
    if (problems.length) throw new Error(`Can't switch the series on yet. ${problems.join(" ")}`);
  }

  const { error } = await createSupabaseAdminClient().from("facilitator_welcome_settings").update(next).eq("id", 1);
  if (error) throw error;
  return getWelcomeOverview();
}
