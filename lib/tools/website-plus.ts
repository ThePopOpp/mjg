import { approveAndPublishChangeSet, getChangeSet, pendingChangeSets, rejectChangeSet } from "@/lib/website/change-sets";
import { searchMedia, updateMediaAltText, mediaUsage } from "@/lib/website/media";
import { createRedirect, deleteRedirect, listRedirects, setRedirectActive } from "@/lib/website/site";
import type { ToolDef } from "./types";

// Frontend Editor extras not covered by Shepherd's website_* tools: redirects,
// the change-set approval queue, and media alt text. Same lib functions the
// dashboard uses; redirects take effect immediately, so changing them is high risk.

const listRedirectsTool: ToolDef = {
  name: "website_list_redirects",
  title: "List redirects",
  description: "Lists every address redirect (old path → new path, 301/302, active or not).",
  domain: "website",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => listRedirects(),
};

const createRedirectTool: ToolDef = {
  name: "website_create_redirect",
  title: "Create or change a redirect",
  description: "Sends visitors from an old address to a new one (301 permanent by default). Replaces an existing redirect for the same old address. Live immediately.",
  domain: "website",
  inputSchema: {
    type: "object",
    properties: {
      from: { type: "string", description: "Old address, e.g. /old-page." },
      to: { type: "string", description: "New address (/new-page) or a full https link." },
      status_code: { type: "integer", enum: [301, 302], description: "301 permanent (default) or 302 temporary." },
    },
    required: ["from", "to"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { from: string; to: string; status_code?: number }) => `Redirect ${a.from} → ${a.to} (${a.status_code ?? 301}), live immediately`,
  run: async (a: { from: string; to: string; status_code?: number }, ctx) =>
    createRedirect({ source_path: a.from, destination_path: a.to, status_code: a.status_code, actorId: ctx.actorId, actorType: "shepherd" }),
};

const toggleRedirect: ToolDef = {
  name: "website_set_redirect_active",
  title: "Turn a redirect on or off",
  description: "Activates or deactivates a redirect by id (from website_list_redirects). Live immediately.",
  domain: "website",
  inputSchema: { type: "object", properties: { id: { type: "string" }, active: { type: "boolean" } }, required: ["id", "active"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { id: string; active: boolean }) => `${a.active ? "Activate" : "Deactivate"} redirect ${a.id}`,
  run: async (a: { id: string; active: boolean }, ctx) => {
    await setRedirectActive(a.id, a.active, { actorId: ctx.actorId });
    return { ok: true };
  },
};

const removeRedirect: ToolDef = {
  name: "website_delete_redirect",
  title: "Delete a redirect",
  description: "Deletes a redirect by id. The old address will 404 (or show a page) again.",
  domain: "website",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { id: string }) => `Delete redirect ${a.id}`,
  run: async (a: { id: string }, ctx) => {
    await deleteRedirect(a.id, { actorId: ctx.actorId });
    return { ok: true };
  },
};

const pendingChanges: ToolDef = {
  name: "website_pending_changes",
  title: "Changes waiting for approval",
  description: "Proposed website changes (from Shepherd or editors) waiting to be approved and published, newest first.",
  domain: "website",
  inputSchema: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 50 } } },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { limit?: number }) => pendingChangeSets(a.limit ?? 20),
};

const approveChange: ToolDef = {
  name: "website_approve_change",
  title: "Approve and publish a change",
  description: "Approves a proposed change set (id from website_pending_changes) and publishes it live.",
  domain: "website",
  inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: (a: { id: string }) => `Approve and publish website change ${a.id}`,
  preview: async (a: { id: string }) => {
    const cs = await getChangeSet(a.id);
    if (!cs) throw new Error("No such change set.");
    return cs;
  },
  run: async (a: { id: string }, ctx) => approveAndPublishChangeSet(a.id, { actorId: ctx.actorId, actorType: "shepherd" }),
};

const rejectChange: ToolDef = {
  name: "website_reject_change",
  title: "Reject a change",
  description: "Rejects a proposed change set, with an optional reason. Nothing is published.",
  domain: "website",
  inputSchema: { type: "object", properties: { id: { type: "string" }, reason: { type: "string" } }, required: ["id"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; reason?: string }, ctx) => rejectChangeSet(a.id, { actorId: ctx.actorId, reason: a.reason }),
};

const findMedia: ToolDef = {
  name: "website_search_media",
  title: "Search website media",
  description: "Finds images and files in the media library by words, with their alt text and where they're used.",
  domain: "website",
  inputSchema: {
    type: "object",
    properties: { query: { type: "string" }, asset_type: { type: "string", description: "e.g. image" }, limit: { type: "integer", minimum: 1, maximum: 50 }, with_usage: { type: "boolean" } },
  },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { query?: string; asset_type?: string; limit?: number; with_usage?: boolean }) => {
    const items = await searchMedia({ query: a.query, assetType: a.asset_type, limit: a.limit ?? 20 });
    if (!a.with_usage) return items;
    return Promise.all(items.map(async (item) => ({ ...item, usage: await mediaUsage((item as { url?: string }).url ?? "").catch(() => []) })));
  },
};

const altText: ToolDef = {
  name: "website_set_alt_text",
  title: "Set image alt text",
  description: "Sets the description screen readers read for an image (id from website_search_media).",
  domain: "website",
  inputSchema: { type: "object", properties: { id: { type: "string" }, alt_text: { type: "string", maxLength: 300 } }, required: ["id", "alt_text"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; alt_text: string }, ctx) => updateMediaAltText(a.id, a.alt_text, { actorId: ctx.actorId, actorType: "shepherd" }),
};

export const WEBSITE_PLUS_TOOLS: ToolDef[] = [
  listRedirectsTool,
  createRedirectTool,
  toggleRedirect,
  removeRedirect,
  pendingChanges,
  approveChange,
  rejectChange,
  findMedia,
  altText,
];
