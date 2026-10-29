import {
  archiveChurch,
  assignChurchAdmin,
  createChurch,
  decideFacilitatorApplication,
  getChurch,
  getChurchDetail,
  getFacilitatorApplication,
  listChurchAdmins,
  listChurches,
  listFacilitatorApplications,
  removeChurchAdmin,
  updateChurch,
} from "@/lib/churches/repository";
import { createGroup } from "@/lib/facilitator-groups/repository";
import type { GroupInput } from "@/lib/facilitator-groups/shared";
import type { ToolContext, ToolDef } from "./types";

// Churches, church admins and facilitator applications (plan §2.3). Thin wrappers over
// lib/churches — the same functions the dashboard's Churches and Church pages use. Church
// admins themselves never use the connector; these are for Super Admins.

const actor = (ctx: ToolContext) => ({ id: ctx.actorId, role: ctx.role });
const CHURCH_ID = { type: "string", description: "Church id (from churches_list)." };
const churchRecord = (pick: (a: any, r?: any) => string | undefined) => ({ entity: "church", id: pick });

const churchesList: ToolDef = {
  name: "churches_list",
  title: "Churches",
  description: "Every church groups can belong to, with city/state and website. Archived churches only when include_archived is true.",
  domain: "people",
  inputSchema: { type: "object", properties: { search: { type: "string" }, include_archived: { type: "boolean" } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { search?: string; include_archived?: boolean }) => listChurches({ search: a.search, includeArchived: a.include_archived }),
};

const churchGet: ToolDef = {
  name: "church_get",
  title: "A church",
  description: "One church with its admins, its official groups and facilitator application counts.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: CHURCH_ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => getChurchDetail(a.id),
};

const CHURCH_FIELDS = {
  name: { type: "string" },
  city: { type: "string" },
  state: { type: "string", description: "Two-letter state code." },
  website: { type: "string" },
};

const churchCreate: ToolDef = {
  name: "church_create",
  title: "Add a church",
  description: "Adds a church so facilitators can apply to it and groups can be listed as official church groups.",
  domain: "people",
  inputSchema: { type: "object", properties: CHURCH_FIELDS, required: ["name"] },
  risk: "write",
  minRole: "super_admin",
  record: churchRecord((_a, r) => r?.id),
  run: async (a: { name: string; city?: string; state?: string; website?: string }, ctx) => createChurch(actor(ctx), a),
};

const churchUpdate: ToolDef = {
  name: "church_update",
  title: "Edit a church",
  description: "Changes a church's name, city, state or website. Use church_archive to archive it.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: CHURCH_ID, ...CHURCH_FIELDS }, required: ["id"] },
  risk: "write",
  minRole: "super_admin",
  record: churchRecord((a) => a.id),
  run: async (a: { id: string; name?: string; city?: string; state?: string; website?: string }, ctx) => {
    const { id, ...changes } = a;
    return updateChurch(actor(ctx), id, changes);
  },
};

const churchArchive: ToolDef = {
  name: "church_archive",
  title: "Archive a church",
  description: "Archives a church: it disappears from pickers and no new facilitator applications can be made. Existing groups and admins stay.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: CHURCH_ID }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  record: churchRecord((a) => a.id),
  summarize: () => "Archive this church",
  preview: async (a: { id: string }) => {
    const c = await getChurchDetail(a.id);
    return { church: c.name, place: [c.city, c.state].filter(Boolean).join(", ") || null, admins: c.admins.length, groups: c.groups.length, pendingApplications: c.applications.pending };
  },
  run: async (a: { id: string }, ctx) => archiveChurch(actor(ctx), a.id),
};

const churchAdminsList: ToolDef = {
  name: "church_admins_list",
  title: "Church admins",
  description: "Active church admins, optionally for one church.",
  domain: "people",
  inputSchema: { type: "object", properties: { church_id: CHURCH_ID } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { church_id?: string }) => listChurchAdmins(a.church_id),
};

const PERSON = {
  profile_id: { type: "string", description: "The person's profile id (from search_users)." },
  email: { type: "string", description: "Or their account email." },
};

const churchAdminAssign: ToolDef = {
  name: "church_admin_assign",
  title: "Make someone a church admin",
  description: "Makes an existing account an admin of a church: they can approve facilitators for it in the dashboard. A participant's role becomes Church Admin.",
  domain: "people",
  inputSchema: { type: "object", properties: { church_id: CHURCH_ID, ...PERSON }, required: ["church_id"] },
  risk: "high",
  minRole: "super_admin",
  record: churchRecord((a) => a.church_id),
  summarize: (a: { email?: string; profile_id?: string }) => `Make ${a.email ?? a.profile_id ?? "this person"} a church admin`,
  preview: async (a: { church_id: string }) => {
    const c = await getChurch(a.church_id);
    if (!c) throw new Error("Church not found.");
    return { church: c.name, currentAdmins: (await listChurchAdmins(a.church_id)).map((x) => x.email ?? x.name) };
  },
  run: async (a: { church_id: string; profile_id?: string; email?: string }, ctx) =>
    assignChurchAdmin(actor(ctx), { churchId: a.church_id, profileId: a.profile_id, email: a.email }),
};

const churchAdminRemove: ToolDef = {
  name: "church_admin_remove",
  title: "Remove a church admin",
  description: "Ends someone's admin access to a church. Someone with no churches left goes back to Participant.",
  domain: "people",
  inputSchema: { type: "object", properties: { church_id: CHURCH_ID, profile_id: PERSON.profile_id }, required: ["church_id", "profile_id"] },
  risk: "high",
  minRole: "super_admin",
  record: churchRecord((a) => a.church_id),
  summarize: () => "Remove this church admin",
  preview: async (a: { church_id: string; profile_id: string }) => {
    const admin = (await listChurchAdmins(a.church_id)).find((x) => x.profileId === a.profile_id);
    if (!admin) throw new Error("That person isn't an admin of this church.");
    return { church: admin.churchName, admin: admin.name, email: admin.email };
  },
  run: async (a: { church_id: string; profile_id: string }, ctx) => removeChurchAdmin(actor(ctx), { churchId: a.church_id, profileId: a.profile_id }),
};

const applicationsList: ToolDef = {
  name: "facilitator_applications_list",
  title: "Facilitator applications",
  description: "Facilitators asking a church to approve them (so they can list official church groups). Filter by church and status.",
  domain: "people",
  inputSchema: { type: "object", properties: { church_id: CHURCH_ID, status: { type: "string", enum: ["pending", "approved", "rejected"] } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { church_id?: string; status?: "pending" | "approved" | "rejected" }) =>
    listFacilitatorApplications({ churchIds: a.church_id ? [a.church_id] : undefined, status: a.status }),
};

const applicationGet: ToolDef = {
  name: "facilitator_application_get",
  title: "A facilitator application",
  description: "One facilitator application with the facilitator, church, message and decision.",
  domain: "people",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => {
    const app = await getFacilitatorApplication(a.id);
    if (!app) throw new Error("Application not found.");
    return app;
  },
};

const applicationDecide: ToolDef = {
  name: "facilitator_application_decide",
  title: "Approve or reject a facilitator",
  description: "Approves or rejects a pending facilitator application. Approval lets the facilitator list official groups for that church. The facilitator is emailed.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: { id: { type: "string" }, decision: { type: "string", enum: ["approve", "reject"] }, note: { type: "string" } },
    required: ["id", "decision"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { decision: string }) => (a.decision === "approve" ? "Approve this facilitator for the church" : "Reject this facilitator application"),
  preview: async (a: { id: string }) => {
    const app = await getFacilitatorApplication(a.id);
    if (!app) throw new Error("Application not found.");
    return { facilitator: app.name, email: app.email, church: app.churchName, status: app.status, message: app.message };
  },
  run: async (a: { id: string; decision: "approve" | "reject"; note?: string }, ctx) => decideFacilitatorApplication(actor(ctx), a.id, a.decision, a.note),
};

const groupCreate: ToolDef = {
  name: "group_create",
  title: "Create a group listing",
  description:
    "Creates a draft Find a Group listing for a facilitator. group takes the same fields as group_update (title required). church_id makes it an official church group — only allowed when that church has approved the facilitator.",
  domain: "people",
  inputSchema: {
    type: "object",
    properties: {
      facilitator_id: { type: "string", description: "The facilitator's profile id." },
      group: { type: "object", description: "title (required), description, audience, meetingDay, meetingTime, city, state, capacity, …" },
      church_id: CHURCH_ID,
    },
    required: ["facilitator_id", "group"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { facilitator_id: string; group: GroupInput; church_id?: string }, ctx) =>
    createGroup(a.facilitator_id, { ...a.group, ...(a.church_id ? { churchId: a.church_id } : {}) }, ctx.actorId),
};

export const CHURCH_TOOLS: ToolDef[] = [
  churchesList, churchGet, churchCreate, churchUpdate, churchArchive,
  churchAdminsList, churchAdminAssign, churchAdminRemove,
  applicationsList, applicationGet, applicationDecide,
  groupCreate,
];
