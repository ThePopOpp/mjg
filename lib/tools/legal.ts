import { getLegalDocument, listLegalDocuments, listLegalVersions, publishLegalDocument, restoreLegalVersion, saveLegalDraft, unpublishLegalDocument } from "@/lib/legal/data";
import { checkLegalReadiness } from "@/lib/legal/placeholders";
import type { ToolDef } from "./types";

// Legal documents (Privacy, Terms, SMS Terms, AI & Trust…), edited at CMS →
// Legal. The safety rules live in lib/legal: publishing is blocked while a
// draft still has placeholders, and /privacy + /terms can't be unpublished
// (the A2P 10DLC registration points at them). Publishing is high risk.

const ID = { type: "string", description: "Document id (from legal_list)." };

const list: ToolDef = {
  name: "legal_list",
  title: "List legal documents",
  description: "Every legal document with its status: published or not, unpublished changes, readiness to publish, and public address.",
  domain: "legal",
  inputSchema: { type: "object", properties: {} },
  risk: "read",
  minRole: "super_admin",
  run: async () =>
    (await listLegalDocuments()).map((d) => ({
      id: d.id,
      slug: d.slug,
      title: d.title,
      isPublished: d.isPublished,
      hasUnpublishedChanges: d.has_unpublished_changes,
      effectiveDate: d.effective_date,
      publicPath: d.publicPath,
      readiness: d.readiness,
    })),
};

const get: ToolDef = {
  name: "legal_get",
  title: "Read a legal document",
  description: "A legal document's draft and published text (markdown) and status.",
  domain: "legal",
  inputSchema: { type: "object", properties: { id: ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => {
    const doc = await getLegalDocument(a.id);
    if (!doc) throw new Error("Legal document not found.");
    return doc;
  },
};

const readiness: ToolDef = {
  name: "legal_check_readiness",
  title: "Check a draft for placeholders",
  description: "Lists unfilled placeholders and draft markers in a legal draft — these block publishing.",
  domain: "legal",
  inputSchema: { type: "object", properties: { id: ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => {
    const doc = await getLegalDocument(a.id);
    if (!doc) throw new Error("Legal document not found.");
    return checkLegalReadiness(doc.draft_md ?? "");
  },
};

const saveDraft: ToolDef = {
  name: "legal_save_draft",
  title: "Edit a legal draft",
  description: "Replaces a legal document's DRAFT text (full markdown). Not live until legal_publish. Attorney review applies to these documents.",
  domain: "legal",
  inputSchema: {
    type: "object",
    properties: {
      id: ID,
      draft_md: { type: "string", description: "The complete markdown text." },
      effective_date: { type: "string", description: "YYYY-MM-DD, optional." },
      title: { type: "string" },
      summary: { type: "string" },
    },
    required: ["id", "draft_md"],
  },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; draft_md: string; effective_date?: string; title?: string; summary?: string }, ctx) =>
    saveLegalDraft(a.id, { draft_md: a.draft_md, effective_date: a.effective_date, title: a.title, summary: a.summary }, ctx.actorId),
};

const publishDoc: ToolDef = {
  name: "legal_publish",
  title: "Publish a legal document",
  description: "Makes a legal document's draft the public version. Refused while it has placeholders.",
  domain: "legal",
  inputSchema: { type: "object", properties: { id: ID }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Publish this legal document — the public policy changes immediately",
  preview: async (a: { id: string }) => {
    const doc = await getLegalDocument(a.id);
    if (!doc) throw new Error("Legal document not found.");
    const check = checkLegalReadiness(doc.draft_md ?? "");
    return { title: doc.title, publicPath: doc.publicPath, effectiveDate: doc.effective_date, readiness: check, draftLength: (doc.draft_md ?? "").length };
  },
  run: async (a: { id: string }, ctx) => publishLegalDocument(a.id, ctx.actorId),
};

const unpublishDoc: ToolDef = {
  name: "legal_unpublish",
  title: "Unpublish a legal document",
  description: "Takes a legal document offline (its page 404s). Privacy and Terms can't be unpublished.",
  domain: "legal",
  inputSchema: { type: "object", properties: { id: ID }, required: ["id"] },
  risk: "high",
  minRole: "super_admin",
  summarize: () => "Unpublish this legal document — its public page will 404",
  run: async (a: { id: string }, ctx) => unpublishLegalDocument(a.id, ctx.actorId),
};

const versions: ToolDef = {
  name: "legal_versions",
  title: "Legal version history",
  description: "Published versions of a legal document, newest first.",
  domain: "legal",
  inputSchema: { type: "object", properties: { id: ID }, required: ["id"] },
  risk: "read",
  minRole: "super_admin",
  run: async (a: { id: string }) => listLegalVersions(a.id),
};

const restore: ToolDef = {
  name: "legal_restore_version",
  title: "Restore a legal version (draft)",
  description: "Copies an earlier published version into the draft. Publish it to make it live.",
  domain: "legal",
  inputSchema: { type: "object", properties: { id: ID, version_id: { type: "string" } }, required: ["id", "version_id"] },
  risk: "write",
  minRole: "super_admin",
  run: async (a: { id: string; version_id: string }, ctx) => restoreLegalVersion(a.id, a.version_id, ctx.actorId),
};

export const LEGAL_TOOLS: ToolDef[] = [list, get, readiness, saveDraft, publishDoc, unpublishDoc, versions, restore];
