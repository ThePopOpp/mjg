import { ContentError, describeScope, discardDraft, listScopes, listVersions, publish, resetToDefault, restoreVersion, saveDraft, type Actor } from "@/lib/marketing/content/write";
import { contentPreviewUrl } from "@/lib/marketing/content/preview-link";
import { getScope } from "@/lib/marketing/content/registry";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import type { ToolContext, ToolDef } from "./types";

// Marketing page content: the code-built pages (homepage, Blueprint, Check-In,
// About, Contact, …) whose words, buttons and images live in content scopes
// (lib/marketing/content). Edits go to a DRAFT; publish makes them live.
// Every field is validated against its schema — an invalid edit stores nothing.

const actor = (ctx: ToolContext): Actor => ({ id: ctx.actorId, source: ctx.via === "mcp" ? "mcp" : "shepherd" });

/** ContentError carries field-level issues; surface them so the model can fix its input. */
async function guard<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (err) {
    if (err instanceof ContentError && err.issues.length) {
      throw new Error(`${err.message} Issues: ${JSON.stringify(err.issues.slice(0, 10))}`);
    }
    throw err;
  }
}

function previewFor(scopeKey: string) {
  const path = getScope(scopeKey)?.path ?? "/";
  const { url, expiresAt } = contentPreviewUrl(path);
  return { previewUrl: `${publicSiteUrl()}${url}`, previewExpiresAt: expiresAt, livePage: `${publicSiteUrl()}${path === "/" ? "" : path}` };
}

const SCOPE = { type: "string", description: 'Content scope key, e.g. "page:home", "page:contact", "global:nav". From content_list_pages.' };
const SECTION = { type: "string", description: "Section key within the scope (from content_get)." };

const listPages: ToolDef = {
  name: "content_list_pages",
  title: "List editable pages",
  description: "Lists every editable marketing page and shared area (navigation, footer, join form…) with its sections. Start here to find the scope to edit.",
  domain: "content",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () => listScopes(),
};

const getContent: ToolDef = {
  name: "content_get",
  title: "Read a page's content",
  description:
    "Shows a page's sections: each field's type and rules, the LIVE values, any unpublished DRAFT, which fields differ from the built-in defaults, and the revision number (pass it back as expected_revision when saving to avoid overwriting someone else).",
  domain: "content",
  inputSchema: { type: "object", properties: { scope: SCOPE }, required: ["scope"] },
  risk: "read",
  minRole: "super_admin",
  run: async (args: { scope: string }) => guard(() => describeScope(args.scope)),
};

const saveDraftTool: ToolDef = {
  name: "content_save_draft",
  title: "Edit page content (draft)",
  description:
    "Changes some fields of one section as a DRAFT (not live). `changes` holds only the fields to change, using the field keys and shapes from content_get. Returns a preview link to see the draft on the real page. Publish with content_publish.",
  domain: "content",
  inputSchema: {
    type: "object",
    properties: {
      scope: SCOPE,
      section: SECTION,
      changes: { type: "object", description: "Field key → new value, e.g. {\"title\": \"…\"}." },
      expected_revision: { type: "integer", description: "The revision from content_get (recommended)." },
    },
    required: ["scope", "section", "changes"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (args: { scope: string; section: string; changes: Record<string, unknown>; expected_revision?: number }, ctx) =>
    guard(async () => {
      const result = await saveDraft({ scope: args.scope, section: args.section, patch: args.changes as never, expectedRevision: args.expected_revision, actor: actor(ctx) });
      return { ...result, status: "draft saved (not live)", ...previewFor(args.scope) };
    }),
};

const resetFields: ToolDef = {
  name: "content_reset_fields",
  title: "Reset fields to default (draft)",
  description: "Puts fields back to the page's built-in wording/images, in the draft. Publish to make it live.",
  domain: "content",
  inputSchema: {
    type: "object",
    properties: { scope: SCOPE, section: SECTION, fields: { type: "array", items: { type: "string" }, minItems: 1 }, expected_revision: { type: "integer" } },
    required: ["scope", "section", "fields"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (args: { scope: string; section: string; fields: string[]; expected_revision?: number }, ctx) =>
    guard(async () => ({
      ...(await resetToDefault({ scope: args.scope, section: args.section, fields: args.fields, expectedRevision: args.expected_revision, actor: actor(ctx) })),
      ...previewFor(args.scope),
    })),
};

const discard: ToolDef = {
  name: "content_discard_draft",
  title: "Discard a draft",
  description: "Throws away a section's unpublished draft; the live page is unchanged.",
  domain: "content",
  inputSchema: { type: "object", properties: { scope: SCOPE, section: SECTION }, required: ["scope", "section"] },
  risk: "write",
  minRole: "super_admin",
  run: async (args: { scope: string; section: string }, ctx) => guard(() => discardDraft({ scope: args.scope, section: args.section, actor: actor(ctx) })),
};

const previewLink: ToolDef = {
  name: "content_preview_link",
  title: "Preview link for drafts",
  description: "A link (valid 1 hour) that opens the real page showing unpublished drafts, on any device.",
  domain: "content",
  inputSchema: { type: "object", properties: { scope: SCOPE }, required: ["scope"] },
  risk: "read",
  minRole: "super_admin",
  run: async (args: { scope: string }) => {
    if (!getScope(args.scope)) throw new Error(`Unknown content scope "${args.scope}".`);
    return previewFor(args.scope);
  },
};

const publishTool: ToolDef = {
  name: "content_publish",
  title: "Publish page content",
  description: "Makes a page's drafts live (all drafted sections, or only the ones listed). Each publish is versioned and can be restored.",
  domain: "content",
  inputSchema: {
    type: "object",
    properties: {
      scope: SCOPE,
      sections: { type: "array", items: { type: "string" }, description: "Only these sections (default: every drafted section)." },
      note: { type: "string", description: "What changed, for the version history." },
    },
    required: ["scope"],
  },
  risk: "high",
  minRole: "super_admin",
  summarize: (args: { scope: string; sections?: string[] }) =>
    `Publish ${args.sections?.length ? args.sections.join(", ") : "all drafts"} on ${getScope(args.scope)?.label ?? args.scope} — live for every visitor`,
  preview: async (args: { scope: string; sections?: string[] }) => {
    const scope = await describeScope(args.scope);
    const changes = scope.sections
      .filter((s) => s.hasDraft && (!args.sections?.length || args.sections.includes(s.key)))
      .map((s) => {
        const live = s.live as Record<string, unknown>;
        const draft = (s.draft ?? {}) as Record<string, unknown>;
        const fields = Object.keys(draft).filter((k) => JSON.stringify(draft[k]) !== JSON.stringify(live[k]));
        return { section: s.label, fields: fields.map((f) => ({ field: f, from: live[f], to: draft[f] })) };
      });
    if (!changes.length) throw new Error("There are no drafts to publish on this page.");
    return { page: scope.label, path: scope.path, changes, ...previewFor(args.scope) };
  },
  run: async (args: { scope: string; sections?: string[]; note?: string }, ctx) =>
    guard(async () => ({ ...(await publish({ scope: args.scope, sections: args.sections, note: args.note, actor: actor(ctx) })), ...previewFor(args.scope) })),
};

const versions: ToolDef = {
  name: "content_versions",
  title: "Version history",
  description: "Lists a section's published versions (newest first) with notes and dates.",
  domain: "content",
  inputSchema: { type: "object", properties: { scope: SCOPE, section: SECTION }, required: ["scope", "section"] },
  risk: "read",
  minRole: "super_admin",
  run: async (args: { scope: string; section: string }) => guard(() => listVersions(args.scope, args.section)),
};

const restore: ToolDef = {
  name: "content_restore_version",
  title: "Restore a version (draft)",
  description: "Copies an earlier published version of a section into the draft. Publish it to make it live again.",
  domain: "content",
  inputSchema: { type: "object", properties: { scope: SCOPE, section: SECTION, version: { type: "integer", minimum: 1 } }, required: ["scope", "section", "version"] },
  risk: "write",
  minRole: "super_admin",
  run: async (args: { scope: string; section: string; version: number }, ctx) =>
    guard(async () => ({ ...(await restoreVersion({ scope: args.scope, section: args.section, version: args.version, actor: actor(ctx) })), ...previewFor(args.scope) })),
};

export const CONTENT_TOOLS: ToolDef[] = [listPages, getContent, saveDraftTool, resetFields, discard, previewLink, publishTool, versions, restore];
