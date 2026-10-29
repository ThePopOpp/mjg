import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createExperience, getExperienceById } from "@/lib/experiences/repository";
import type { ExperienceFrequency, OffsetUnit } from "@/lib/experiences/types";
import { archivePlan, createPlan } from "@/lib/plans/repository";
import type { PlanActor } from "@/lib/plans/auth";
import type { AppRole } from "@/lib/rbac/roles";
import type { ToolContext, ToolDef } from "./types";

// Operations gaps from the expansion plan §2.1: creating and archiving plans,
// creating experiences and taking someone out of one. Deleting a Project
// Manager item is in lib/tools/trash.ts.

const planActor = (ctx: ToolContext): PlanActor => ({ id: ctx.actorId, role: ctx.role as AppRole, email: ctx.actorEmail });

const plansCreate: ToolDef = {
  name: "plans_create",
  title: "Create a plan",
  description: "Creates a plan (project board) with the default columns. You're its owner; add members by user id. Visibility team (default) or private.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 120 },
      description: { type: "string" },
      visibility: { type: "string", enum: ["team", "private"] },
      default_view: { type: "string", enum: ["board", "grid"] },
      start_date: { type: "string", description: "YYYY-MM-DD" },
      target_date: { type: "string", description: "YYYY-MM-DD" },
      member_ids: { type: "array", items: { type: "string" } },
    },
    required: ["name"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { name: string; description?: string; visibility?: "team" | "private"; default_view?: "board" | "grid"; start_date?: string; target_date?: string; member_ids?: string[] }, ctx) => {
    const id = await createPlan(planActor(ctx), {
      name: a.name,
      description: a.description ?? null,
      planType: "basic",
      visibility: a.visibility ?? "team",
      defaultView: a.default_view ?? "board",
      color: "gold",
      icon: "clipboard-list",
      startDate: a.start_date ?? null,
      targetDate: a.target_date ?? null,
      memberIds: a.member_ids ?? [],
    });
    return { id, name: a.name, url: `/dashboard/plans/${id}` };
  },
};

const plansArchive: ToolDef = {
  name: "plans_archive",
  title: "Archive a plan",
  description: "Archives a plan (hidden from the active list, tasks kept) or restores it (archived: false).",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: { type: "string" }, archived: { type: "boolean" } }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { archived?: boolean }) => (a.archived === false ? "Restore this plan" : "Archive this plan"),
  preview: async (a: { id: string }) => {
    const supabase = createSupabaseAdminClient();
    const [{ data: plan }, { count }] = await Promise.all([
      supabase.from("plans").select("name, status, archived_at").eq("id", a.id).maybeSingle(),
      supabase.from("plan_tasks").select("id", { count: "exact", head: true }).eq("plan_id", a.id),
    ]);
    if (!plan) throw new Error("No such plan.");
    return { plan: plan.name, status: plan.status, tasks: count ?? 0 };
  },
  run: (a: { id: string; archived?: boolean }, ctx) => archivePlan(planActor(ctx), a.id, a.archived !== false),
};

const UNITS: OffsetUnit[] = ["minute", "hour", "day", "week", "month"];

const experiencesCreate: ToolDef = {
  name: "experiences_create",
  title: "Create an experience",
  description:
    "Creates an experience (email program) as a DRAFT — nothing sends until experiences_launch. Optionally from an experience type, with attendees and email steps (template id + offset from the start). Frequency weekly | biweekly | custom.",
  domain: "ops",
  inputSchema: {
    type: "object",
    properties: {
      name: { type: "string" },
      experience_type_id: { type: "string" },
      start_date: { type: "string", description: "YYYY-MM-DD" },
      start_time: { type: "string", description: "HH:MM 24h (default 09:00)" },
      frequency: { type: "string", enum: ["weekly", "biweekly", "custom"] },
      duration_weeks: { type: "integer", minimum: 1, maximum: 52 },
      facilitator_id: { type: "string" },
      attendees: { type: "array", items: { type: "object", properties: { email: { type: "string" }, name: { type: "string" } }, required: ["email"] } },
      steps: {
        type: "array",
        items: {
          type: "object",
          properties: {
            email_template_id: { type: "string" },
            offset_value: { type: "integer" },
            offset_unit: { type: "string", enum: UNITS },
            label: { type: "string" },
          },
          required: ["offset_value", "offset_unit"],
        },
      },
    },
    required: ["start_date", "frequency", "duration_weeks"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (
    a: {
      name?: string; experience_type_id?: string; start_date: string; start_time?: string; frequency: ExperienceFrequency; duration_weeks: number;
      facilitator_id?: string; attendees?: { email: string; name?: string }[];
      steps?: { email_template_id?: string; offset_value: number; offset_unit: OffsetUnit; label?: string }[];
    },
    ctx,
  ) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(a.start_date)) throw new Error("start_date must be YYYY-MM-DD.");
    const experience = await createExperience(
      {
        experienceTypeId: a.experience_type_id ?? null,
        name: a.name,
        startDate: a.start_date,
        startTime: a.start_time,
        frequency: a.frequency,
        durationWeeks: a.duration_weeks,
        facilitatorId: a.facilitator_id ?? null,
        attendees: a.attendees ?? [],
        steps: (a.steps ?? []).map((s) => ({ emailTemplateId: s.email_template_id ?? null, offsetValue: s.offset_value, offsetUnit: s.offset_unit, label: s.label ?? null })),
      },
      ctx.actorId,
    );
    return { id: experience.id, name: experience.name, status: experience.status };
  },
};

const experiencesRemoveAttendee: ToolDef = {
  name: "experiences_remove_attendee",
  title: "Take someone out of an experience",
  description: "Stops an experience's emails going to one attendee (by email). They stay on the list marked opted out (the same flag an unsubscribe sets), so their history is kept.",
  domain: "ops",
  inputSchema: { type: "object", properties: { id: { type: "string", description: "Experience id (from experiences_list)." }, email: { type: "string" } }, required: ["id", "email"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; email: string }) => {
    if (!(await getExperienceById(a.id))) throw new Error("No such experience.");
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("experience_attendees")
      .update({ opted_out: true })
      .eq("experience_id", a.id)
      .ilike("email", a.email.trim())
      .select("id, email");
    if (error) throw error;
    if (!data?.length) throw new Error(`${a.email} isn't an attendee of this experience.`);
    return { ok: true, removed: data[0].email };
  },
};

export const OPS_PLUS_TOOLS: ToolDef[] = [plansCreate, plansArchive, experiencesCreate, experiencesRemoveAttendee];
