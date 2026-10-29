import { BUILT_IN_ASSESSMENTS, getMcpReadableMap, isBuiltInAssessment, mcpResultsGate } from "@/lib/assessments/mcp-access";
import { getAssessmentResult, listAssessmentResults } from "@/lib/assessments/results";
import { ensureSeeds, getFormBySlug, listForms, publishForm, saveDraft } from "@/lib/pilot/forms-data";
import type { CheckInDefinition, PilotForm, PilotFormKind, SurveyDefinition } from "@/lib/pilot/form-types";
import { getCheckInSubmissionStats } from "@/lib/check-in/submissions";
import { getEnergyAuditStats } from "@/lib/energy-audit/submissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ToolDef } from "./types";

// Assessments: the two built-in check-ins (Created for More, Energy Audit) and the
// builder forms (pilot_forms: the pilot check-in and the surveys), through the
// same lib code as Check-In Results / Energy Audit / Surveys in the dashboard.
// RESULTS are readable only where a Super Admin turned on "Readable by MCP" for
// that assessment (default off) — every result tool goes through mcpResultsGate.

const KEY = { type: "string", description: "Assessment key from assessments_list: created-for-more, energy-audit, check-in, or a survey slug." };
const RESERVED = new Set(["general", "pastor-elder", "check-in", ...BUILT_IN_ASSESSMENTS.map((a) => a.key)]);

type Summary = { key: string; title: string; kind: "built_in" | PilotFormKind; status: string; description: string | null; mcpReadable: boolean; publishedAt?: string | null; updatedAt?: string };

async function allAssessments(kind?: PilotFormKind | "built_in"): Promise<Summary[]> {
  await ensureSeeds();
  const [forms, readable] = await Promise.all([listForms(), getMcpReadableMap()]);
  const builtIns: Summary[] = BUILT_IN_ASSESSMENTS.map((a) => ({ key: a.key, title: a.title, kind: "built_in", status: "published", description: a.description, mcpReadable: readable.get(a.key) === true }));
  const fromForms: Summary[] = forms.map((f) => ({
    key: f.slug, title: f.title, kind: f.kind, status: f.status, description: f.description,
    mcpReadable: readable.get(f.slug) === true, publishedAt: f.published_at, updatedAt: f.updated_at,
  }));
  return [...builtIns, ...fromForms].filter((a) => !kind || a.kind === kind);
}

async function findAssessment(key: string): Promise<Summary | null> {
  return (await allAssessments()).find((a) => a.key === key) ?? null;
}

async function gated(key: string) {
  const gate = mcpResultsGate(await findAssessment(key));
  if (!gate.ok) throw new Error(gate.message);
}

/** Light shape check so a bad draft can't break the builder or the public form. */
export function checkDefinition(kind: PilotFormKind, def: unknown): string | null {
  const d = def as Partial<SurveyDefinition & CheckInDefinition> | null;
  if (!d || typeof d !== "object") return "definition must be an object.";
  if (kind === "survey") {
    if (!Array.isArray(d.fields) || !d.fields.length) return "A survey definition needs fields: [{ name, label, type, required?, options? }].";
    for (const f of d.fields) if (!f || typeof f.name !== "string" || typeof f.label !== "string" || typeof f.type !== "string") return "Every field needs name, label and type.";
    return null;
  }
  if (!Array.isArray(d.sections) || !d.sections.length) return "A check-in definition needs sections: [{ key, title, lowestTag, questions: [{ id, text }] }].";
  for (const s of d.sections) if (!s || typeof s.key !== "string" || typeof s.title !== "string" || !Array.isArray(s.questions)) return "Every section needs key, title and questions.";
  return null;
}

function normalizeDefinition(kind: PilotFormKind, def: any): SurveyDefinition | CheckInDefinition {
  if (kind === "survey") {
    return { version: 1, fields: def.fields.map((f: any, i: number) => ({ id: f.id || `f${i}`, ...f })) };
  }
  return {
    version: 1,
    scaleMax: Number(def.scaleMax) || 5,
    sections: def.sections.map((s: any, i: number) => ({
      id: s.id || `s${i}`, key: s.key, title: s.title, lowestTag: s.lowestTag ?? "", coreQuestion: s.coreQuestion,
      questions: s.questions.map((q: any, j: number) => (typeof q === "string" ? { id: `q${i}_${j}`, text: q } : { id: q.id || `q${i}_${j}`, text: String(q.text ?? "") })),
    })),
    reflections: Array.isArray(def.reflections) ? def.reflections.map(String) : [],
    ranges: Array.isArray(def.ranges) ? def.ranges : [],
  };
}

function formView(f: PilotForm, mcpReadable: boolean) {
  return {
    key: f.slug, id: f.id, kind: f.kind, title: f.title, description: f.description, status: f.status, mcpReadable,
    draft: f.draft_definition, published: f.published_definition, publishedAt: f.published_at, updatedAt: f.updated_at,
    draftDiffersFromPublished: JSON.stringify(f.draft_definition) !== JSON.stringify(f.published_definition),
  };
}

async function requireForm(key: string): Promise<PilotForm> {
  if (isBuiltInAssessment(key)) throw new Error(`"${key}" is a built-in assessment defined in code; its questions can't be edited here.`);
  await ensureSeeds();
  const form = await getFormBySlug(key);
  if (!form) throw new Error(`No assessment or survey with key "${key}".`);
  return form;
}

const list: ToolDef = {
  name: "assessments_list",
  title: "List assessments",
  description: "Every assessment and survey: the built-in Created for More Check-In and Energy Audit, the pilot check-in, and builder surveys — with status (draft/published) and whether results are Readable by MCP.",
  domain: "people",
  inputSchema: { type: "object", properties: { kind: { type: "string", enum: ["built_in", "check_in", "survey"] } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { kind?: PilotFormKind | "built_in" }) => allAssessments(a.kind),
};

const get: ToolDef = {
  name: "assessment_get",
  title: "One assessment",
  description: "An assessment's definition (draft and published questions for builder forms) and aggregate numbers for built-ins. No individual results — use assessment_results_list.",
  domain: "people",
  inputSchema: { type: "object", properties: { key: KEY }, required: ["key"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { key: string }) => {
    const readable = await getMcpReadableMap();
    if (isBuiltInAssessment(a.key)) {
      const info = BUILT_IN_ASSESSMENTS.find((b) => b.key === a.key)!;
      const stats = a.key === "energy-audit" ? await getEnergyAuditStats() : await getCheckInSubmissionStats();
      return { ...info, kind: "built_in", definedIn: "code", mcpReadable: readable.get(a.key) === true, stats };
    }
    return formView(await requireForm(a.key), readable.get(a.key) === true);
  },
};

const RESULT_FILTERS = {
  since: { type: "string", description: "ISO date; results on/after." },
  until: { type: "string", description: "ISO date; results on/before." },
  email: { type: "string", description: "Only this person's results." },
  limit: { type: "integer", minimum: 1, maximum: 200 },
};

const resultsList: ToolDef = {
  name: "assessment_results_list",
  title: "Assessment results",
  description: "People's results for one assessment (name, email, score, band, lowest/strongest area, date). Only for assessments with Readable by MCP on; otherwise says so. Never includes written reflections.",
  domain: "people",
  inputSchema: { type: "object", properties: { key: KEY, ...RESULT_FILTERS }, required: ["key"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { key: string; since?: string; until?: string; email?: string; limit?: number }) => {
    await gated(a.key);
    return listAssessmentResults(a.key, a);
  },
};

const resultGet: ToolDef = {
  name: "assessment_result_get",
  title: "One assessment result",
  description: "One result in full: per-area scores, statement ratings and chosen next step. Only for assessments with Readable by MCP on. Never includes written reflections.",
  domain: "people",
  inputSchema: { type: "object", properties: { key: KEY, id: { type: "string" } }, required: ["key", "id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { key: string; id: string }) => {
    await gated(a.key);
    return getAssessmentResult(a.key, a.id);
  },
};

const DEFINITION = {
  type: "object",
  description:
    "survey: { fields: [{ name, label, type: text|textarea|email|phone|number|date|select|radio|checkbox, required?, options?, help? }] }. check_in: { scaleMax, sections: [{ key, title, lowestTag, questions: [\"statement\" | { text }] }], reflections: [\"prompt\"], ranges: [{ label, minPct }] }.",
};

const createDraft: ToolDef = {
  name: "assessment_create_draft",
  title: "Create a survey (draft)",
  description: "Creates a new builder survey as a draft (not live until assessment_publish). Results start NOT readable by MCP. The check-in already exists — edit it with assessment_update_draft.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: {
      slug: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{1,59}$", description: "URL slug: /surveys/<slug>." },
      title: { type: "string", minLength: 1 },
      description: { type: "string" },
      definition: DEFINITION,
    },
    required: ["slug", "title", "definition"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { slug: string; title: string; description?: string; definition: unknown }, ctx) => {
    if (RESERVED.has(a.slug)) throw new Error("That slug is reserved.");
    if (await getFormBySlug(a.slug)) throw new Error(`"${a.slug}" already exists — use assessment_update_draft.`);
    const bad = checkDefinition("survey", a.definition);
    if (bad) throw new Error(bad);
    const form = await saveDraft({ kind: "survey", slug: a.slug, title: a.title, description: a.description ?? null, draftDefinition: normalizeDefinition("survey", a.definition), actorUserId: ctx.actorId });
    return formView(form, false);
  },
};

const updateDraft: ToolDef = {
  name: "assessment_update_draft",
  title: "Edit an assessment draft",
  description: "Changes the draft title, description and/or questions of the pilot check-in or a survey. The live form is unchanged until assessment_publish.",
  domain: "people",
  inputSchema: { type: "object", properties: { key: KEY, title: { type: "string", minLength: 1 }, description: { type: ["string", "null"] }, definition: DEFINITION }, required: ["key"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { key: string; title?: string; description?: string | null; definition?: unknown }, ctx) => {
    const form = await requireForm(a.key);
    if (a.definition !== undefined) {
      const bad = checkDefinition(form.kind, a.definition);
      if (bad) throw new Error(bad);
    }
    const saved = await saveDraft({
      id: form.id, kind: form.kind, slug: form.slug,
      title: a.title ?? form.title,
      description: a.description === undefined ? form.description : a.description,
      draftDefinition: a.definition === undefined ? form.draft_definition : normalizeDefinition(form.kind, a.definition),
      actorUserId: ctx.actorId,
    });
    return formView(saved, (await getMcpReadableMap()).get(saved.slug) === true);
  },
};

function countQuestions(def: unknown): number {
  const d = def as Partial<SurveyDefinition & CheckInDefinition> | null;
  if (!d) return 0;
  if (Array.isArray(d.fields)) return d.fields.length;
  return (d.sections ?? []).reduce((n, s) => n + (s.questions?.length ?? 0), 0);
}

const publish: ToolDef = {
  name: "assessment_publish",
  title: "Publish an assessment",
  description: "Makes the draft of the pilot check-in or a survey the live public form (/check-in or /surveys/<slug>).",
  domain: "people",
  inputSchema: { type: "object", properties: { key: KEY }, required: ["key"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { key: string }) => `Publish the "${a.key}" draft as the live public form`,
  preview: async (a: { key: string }) => {
    const form = await requireForm(a.key);
    return {
      title: form.title, status: form.status, url: form.kind === "check_in" ? "/check-in" : `/surveys/${form.slug}`,
      questionsNow: form.published_definition ? countQuestions(form.published_definition) : null,
      questionsAfter: countQuestions(form.draft_definition),
      changed: JSON.stringify(form.draft_definition) !== JSON.stringify(form.published_definition),
    };
  },
  run: async (a: { key: string }) => {
    const form = await requireForm(a.key);
    if (!form.id) throw new Error("Save a draft first.");
    const published = await publishForm(form.id);
    return { key: published.slug, status: published.status, publishedAt: published.published_at };
  },
};

// ── Surveys (builder forms of kind survey) ──────────────────────────────────

const surveysList: ToolDef = {
  name: "surveys_list",
  title: "List surveys",
  description: "Participant surveys (General, Pastor/Elder, and any built in the Surveys builder) with status, response counts and whether responses are Readable by MCP.",
  domain: "people",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => {
    const surveys = await allAssessments("survey");
    const db = createSupabaseAdminClient();
    const { data } = await db.from("survey_responses").select("survey_type").limit(10000);
    const counts = new Map<string, number>();
    for (const r of data ?? []) counts.set(r.survey_type as string, (counts.get(r.survey_type as string) ?? 0) + 1);
    return surveys.map((s) => ({ ...s, responses: counts.get(s.key === "pastor-elder" ? "pastor_elder" : s.key) ?? 0 }));
  },
};

const surveyResponses: ToolDef = {
  name: "survey_responses_list",
  title: "Survey responses",
  description: "Responses to one survey (who, when, permissions given). Only for surveys with Readable by MCP on; use assessment_result_get for one response's answers.",
  domain: "people",
  inputSchema: { type: "object", properties: { key: { type: "string", description: "Survey slug from surveys_list (e.g. general, pastor-elder)." }, ...RESULT_FILTERS }, required: ["key"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { key: string; since?: string; until?: string; email?: string; limit?: number }) => {
    const survey = (await allAssessments("survey")).find((s) => s.key === a.key);
    if (!survey) throw new Error(`No survey "${a.key}".`);
    const gate = mcpResultsGate(survey);
    if (!gate.ok) throw new Error(gate.message);
    return listAssessmentResults(a.key, a);
  },
};

export const ASSESSMENT_TOOLS: ToolDef[] = [list, get, resultsList, resultGet, createDraft, updateDraft, publish, surveysList, surveyResponses];
