import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import { convert } from "html-to-text";

// Read-only export of every 6-Week Challenge email (participant + leader) for content review.
// Writes docs/6-week-challenge/review/data.json plus one rendered HTML file per email.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
nextEnv.loadEnvConfig(projectRoot);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });

const outDir = path.join(projectRoot, "docs", "6-week-challenge", "review");
const htmlDir = path.join(outDir, "html");
fs.mkdirSync(htmlDir, { recursive: true });

const TYPES = ["six-week-challenge", "six-week-challenge-biweekly", "six-week-challenge-leader"];
const CATEGORIES = ["six_week_challenge_participant", "six_week_challenge_facilitator"];
const SITE = "https://michaeljgauthier.com";
const SAMPLE = {
  first_name: "John",
  unsubscribe_url: `${SITE}/email-preferences`,
  preferences_url: `${SITE}/email-preferences`,
  book_waitlist_url: `${SITE}/book-waitlist`,
  guide_url: `${SITE}/6-week-challenge`,
  video_url: `${SITE}/6-week-challenge/videos`,
};
const fill = (s) => (s ?? "").replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (m, k) => (k in SAMPLE ? SAMPLE[k] : m));

const { data: types, error: tErr } = await supabase.from("experience_types").select("id,slug,name").in("slug", TYPES);
if (tErr) throw tErr;
const { data: steps, error: sErr } = await supabase
  .from("experience_type_steps")
  .select("experience_type_id,step_number,label,email_template_id,subject_override,offset_value,offset_unit")
  .in("experience_type_id", types.map((t) => t.id))
  .order("step_number");
if (sErr) throw sErr;
const { data: templates, error: eErr } = await supabase
  .from("email_templates")
  .select("id,name,slug,subject,preheader,html_body,text_body,category,status")
  .in("category", CATEGORIES)
  .order("slug");
if (eErr) throw eErr;

const typeSlug = Object.fromEntries(types.map((t) => [t.id, t.slug]));
const schedule = {}; // template id -> { [typeSlug]: {step, label, offset_value, offset_unit, subject_override} }
for (const s of steps) {
  if (!s.email_template_id) continue;
  (schedule[s.email_template_id] ??= {})[typeSlug[s.experience_type_id]] = {
    step: s.step_number, label: s.label, offset_value: s.offset_value, offset_unit: s.offset_unit, subject_override: s.subject_override,
  };
}

const emails = templates.map((t) => {
  const file = `${t.slug}.html`;
  fs.writeFileSync(path.join(htmlDir, file), fill(t.html_body));
  const body = t.text_body?.trim() ? fill(t.text_body) : convert(fill(t.html_body), { wordwrap: false, selectors: [{ selector: "img", format: "skip" }] });
  return {
    track: t.category === "six_week_challenge_facilitator" ? "leader" : "participant",
    slug: t.slug, name: t.name, status: t.status,
    subject: fill(t.subject), preheader: fill(t.preheader), body, html_file: `html/${file}`,
    schedule: schedule[t.id] ?? {},
  };
});

fs.writeFileSync(path.join(outDir, "data.json"), JSON.stringify({ exported_at: new Date().toISOString(), types, emails }, null, 2));
const inDrip = emails.filter((e) => Object.keys(e.schedule).length).length;
console.log(`Exported ${emails.length} emails (${inDrip} in a drip, ${emails.length - inDrip} not scheduled) to ${outDir}`);
