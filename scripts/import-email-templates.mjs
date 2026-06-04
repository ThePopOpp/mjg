import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const templateDir = path.join(projectRoot, "docs", "email-templates", "files");

const imports = [
  ["00-welcome.html", "email_journey_welcome", "Welcome Email 0", "email_journey"],
  ["01-day-1-building.html", "email_journey_day_1", "Day 1 - Building", "email_journey"],
  ["02-day-2-faith.html", "email_journey_day_2", "Day 2 - Faith", "email_journey"],
  ["03-day-3-drift.html", "email_journey_day_3", "Day 3 - Drift", "email_journey"],
  ["04-day-4-family.html", "email_journey_day_4", "Day 4 - Family", "email_journey"],
  ["05-day-5-energy.html", "email_journey_day_5", "Day 5 - Energy", "email_journey"],
  ["06-day-6-joy-money.html", "email_journey_day_6", "Day 6 - Joy and Money", "email_journey"],
  ["07-day-7-next-step.html", "email_journey_day_7", "Day 7 - Next Step", "email_journey"],
  ["08-survey-invitation.html", "email_journey_final_survey", "Final Survey Invitation", "surveys"],
  ["09-survey-reminder.html", "email_journey_survey_reminder", "Survey Reminder", "surveys"],
  ["10-thank-you-share.html", "email_journey_thank_you_share", "Thank You and Share", "email_journey"],
  ["11-inner-circle.html", "email_journey_inner_circle", "Inner Circle Invitation", "inner_circle"],
  ["12-behind-the-scenes.html", "email_journey_behind_the_scenes", "Behind the Scenes Follow-Up", "email_journey"],
];

const extraMappings = [
  ["survey_general_invite", "08-survey-invitation"],
  ["survey_pastor_elder_invite", "08-survey-invitation"],
  ["inner_circle_invite", "11-inner-circle"],
];

const templateIdsByAlias = new Map();

for (const [fileName, eventKey, name, category] of imports) {
  const filePath = path.join(templateDir, fileName);
  const rawHtml = repairMojibake(fs.readFileSync(filePath, "utf8"));
  const htmlBody = repairMojibake(normalizeMergeFields(rawHtml));
  const subject = repairMojibake(extractTitle(rawHtml) || name);
  const preheader = repairMojibake(extractPreheader(rawHtml) || "");
  const slug = `created-for-more-${fileName.replace(/\.html$/i, "")}`;
  const availableFields = Array.from(extractMergeFields(`${subject} ${preheader} ${htmlBody}`));

  const { data, error } = await supabase
    .from("email_templates")
    .upsert(
      {
        name,
        slug,
        subject,
        preheader: preheader || null,
        html_body: htmlBody,
        text_body: stripHtml(htmlBody),
        category,
        status: "active",
        available_fields: availableFields,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slug" },
    )
    .select("id,slug")
    .single();

  if (error) throw new Error(`Template import failed for ${fileName}: ${error.message}`);
  templateIdsByAlias.set(fileName.replace(/\.html$/i, ""), data.id);

  await mapTemplate(eventKey, data.id);
  console.log(`Imported ${name} -> ${eventKey}`);
}

for (const [eventKey, templateAlias] of extraMappings) {
  const templateId = templateIdsByAlias.get(templateAlias);
  if (templateId) {
    await mapTemplate(eventKey, templateId);
    console.log(`Mapped ${eventKey} -> ${templateAlias}`);
  }
}

async function mapTemplate(eventKey, templateId) {
  const { error } = await supabase
    .from("email_template_mappings")
    .upsert(
      {
        event_key: eventKey,
        template_id: templateId,
        enabled: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "event_key" },
    );
  if (error) throw new Error(`Mapping failed for ${eventKey}: ${error.message}`);
}

function normalizeMergeFields(value) {
  const fields = {
    FIRST_NAME: "first_name",
    CHECKIN_LINK: "checkin_link",
    SURVEY_LINK: "survey_link",
    INNER_CIRCLE_LINK: "inner_circle_link",
    FORWARD_LINK: "forward_link",
    PREFERENCES_URL: "preferences_url",
    UNSUBSCRIBE_URL: "unsubscribe_url",
  };

  return value.replace(/\{\{\{\s*([A-Z0-9_]+)\s*\}\}\}/g, (_match, key) => `{{${fields[key] || key.toLowerCase()}}}`);
}

function extractTitle(value) {
  const match = value.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1].trim()) : "";
}

function extractPreheader(value) {
  const match = value.match(/<div[^>]*display:none[^>]*>([\s\S]*?)<\/div>/i);
  return match ? stripHtml(decodeEntities(match[1])).replace(/\s+/g, " ").trim() : null;
}

function extractMergeFields(value) {
  const fields = new Set();
  for (const match of value.matchAll(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g)) fields.add(match[1]);
  return fields;
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeEntities(value) {
  return repairMojibake(value
    .replace(/&#x27;/g, "'")
    .replace(/&mdash;/g, "-")
    .replace(/&ndash;/g, "-")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " "));
}

function repairMojibake(value) {
  if (!value) return value;
  const replacements = [
    [[0x00e2, 0x20ac, 0x201d], "-"],
    [[0x00e2, 0x20ac, 0x201c], "-"],
    [[0x00e2, 0x20ac, 0x0022], "-"],
    [[0x00e2, 0x20ac, 0x2122], "'"],
    [[0x00e2, 0x20ac, 0x02dc], "'"],
    [[0x00e2, 0x20ac, 0x0153], '"'],
    [[0x00e2, 0x20ac, 0x009d], '"'],
    [[0x00c2, 0x00b7], "·"],
    [[0x00c2], ""],
  ];

  return replacements.reduce(
    (current, [codepoints, replacement]) => current.replaceAll(String.fromCodePoint(...codepoints), replacement),
    value,
  );
}
