// Pilot Forms — shared types + constants→definition converters (client-safe;
// no DB imports). Used by the builders, the public renderers, and the data layer.

import { CHECK_IN_SECTIONS, REFLECTION_PROMPTS, GENERAL_SURVEY_FIELDS, PASTOR_ELDER_SURVEY_FIELDS } from "@/lib/pilot/constants";

export type SurveyFieldType = "text" | "email" | "phone" | "number" | "date" | "textarea" | "select" | "radio" | "checkbox";
export const SURVEY_FIELD_TYPES: { value: SurveyFieldType; label: string; hasOptions?: boolean }[] = [
  { value: "text", label: "Short text" }, { value: "textarea", label: "Long text" }, { value: "email", label: "Email" },
  { value: "phone", label: "Phone" }, { value: "number", label: "Number" }, { value: "date", label: "Date" },
  { value: "select", label: "Dropdown", hasOptions: true }, { value: "radio", label: "Radio (single)", hasOptions: true },
  { value: "checkbox", label: "Checkboxes (multi)", hasOptions: true },
];
export const TYPE_HAS_OPTIONS = new Set<SurveyFieldType>(["select", "radio", "checkbox"]);

export type SurveyField = { id: string; name: string; label: string; type: SurveyFieldType; required?: boolean; options?: string[]; help?: string };
export type SurveyDefinition = { version: 1; fields: SurveyField[] };

export type CheckInQuestion = { id: string; text: string };
export type CheckInSectionDef = { id: string; key: string; title: string; lowestTag: string; coreQuestion?: string; questions: CheckInQuestion[] };
export type ScoreRange = { label: string; minPct: number };
export type CheckInDefinition = { version: 1; scaleMax: number; sections: CheckInSectionDef[]; reflections: string[]; ranges: ScoreRange[] };

export type PilotFormKind = "survey" | "check_in";
export type PilotFormStatus = "draft" | "published" | "archived";
export type PilotForm = {
  id: string; kind: PilotFormKind; slug: string; title: string; description: string | null;
  status: PilotFormStatus;
  draft_definition: SurveyDefinition | CheckInDefinition;
  published_definition: SurveyDefinition | CheckInDefinition | null;
  created_at: string; updated_at: string; published_at: string | null;
};

let _sid = 0;
const gid = (p: string) => `${p}${Date.now().toString(36)}${(_sid++).toString(36)}`;
export const newFieldId = () => gid("f");
export const newSectionId = () => gid("s");
export const newQuestionId = () => gid("q");

export const DEFAULT_RANGES: ScoreRange[] = [
  { label: "Aligned & Intentional", minPct: 80 },
  { label: "Aware but Stretched", minPct: 60 },
  { label: "Drifting in Key Layers", minPct: 40 },
  { label: "Time to Pause & Rebuild", minPct: 0 },
];

type ConstField = { name: string; label: string; type: string; required?: boolean; options?: readonly string[] };
export function surveyDefFromConstants(fields: readonly ConstField[]): SurveyDefinition {
  return { version: 1, fields: fields.map((f, i) => ({ id: `f${i}`, name: f.name, label: f.label, type: f.type as SurveyFieldType, required: f.required, options: f.options ? [...f.options] : undefined })) };
}
export function checkInDefFromConstants(): CheckInDefinition {
  return {
    version: 1, scaleMax: 5,
    sections: CHECK_IN_SECTIONS.map((s, i) => ({ id: `s${i}`, key: s.key, title: s.title, lowestTag: s.lowestTag, coreQuestion: s.coreQuestion, questions: s.questions.map((q, j) => ({ id: `q${i}_${j}`, text: q })) })),
    reflections: [...REFLECTION_PROMPTS], ranges: DEFAULT_RANGES,
  };
}
// Seed a survey definition from the hardcoded constants by slug.
export function seedSurveyDef(slug: string): SurveyDefinition {
  return slug === "pastor-elder" ? surveyDefFromConstants(PASTOR_ELDER_SURVEY_FIELDS) : surveyDefFromConstants(GENERAL_SURVEY_FIELDS);
}

// The two seed surveys + the check-in. Used to (re)seed builder rows.
export const SEED_FORMS: { kind: PilotFormKind; slug: string; title: string; description: string }[] = [
  { kind: "survey", slug: "general", title: "General Pilot Feedback", description: "Created for More 7-Day Stewardship Pilot feedback survey." },
  { kind: "survey", slug: "pastor-elder", title: "Pastor / Elder Review", description: "Pastor, elder, and church-leader review survey." },
  { kind: "check_in", slug: "check-in", title: "Created for More Check-In", description: "The scored 7-layer Stewardship Blueprint self-assessment (Bedrock → Legacy, out of 140)." },
];
export function seedDefFor(kind: PilotFormKind, slug: string): SurveyDefinition | CheckInDefinition {
  return kind === "check_in" ? checkInDefFromConstants() : seedSurveyDef(slug);
}

// survey_type stored on responses: keep the two legacy values, else the slug.
export function surveyTypeForSlug(slug: string): string {
  return slug === "pastor-elder" ? "pastor_elder" : slug;
}
