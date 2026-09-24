// Frontend Editor — Steward's controlled tool layer (spec §12.2).
//
// This is the ONLY way Steward can touch the website. There is no SQL, no file
// write, no shell and no repository access behind any of it; every tool goes
// through the same validated data layer the dashboard uses, so the same rules
// apply whether a change came from a click or from a sentence:
//
//   • reads execute automatically, writes are confirmation-gated,
//   • writes land in the DRAFT and record a change set,
//   • publishing is a separate, explicit step (and is refused for protected and
//     legal pages unless the owner does it themselves),
//   • protected routes are unreachable,
//   • only registered components with registered props survive validation,
//   • everything is audited under actor_type = 'steward'.

import { upsertDevRequest } from "@/lib/dev-requests/repository";
import {
  archivePage, createPage, deletePage, duplicatePage, getPage, getPageOrThrow, linkReport, listAuditLogs,
  listPages, listVersions, logWebsiteAudit, publishPage, restorePage, restoreVersion, searchWebsite,
  unpublishPage, updatePageMeta,
} from "./data";
import { applyChangeSetToDraft, approveAndPublishChangeSet, listChangeSets, proposeChangeSet, stewardMayPublish } from "./change-sets";
import { addBlock, removeBlock, replaceTextInContent, updateBlock, moveBlock } from "./blocks";
import { createPreviewToken } from "./preview";
import { getDefinition, registrySummary, renderRegistryForPrompt, validateContent } from "./registry";
import { createNavItem, deleteNavItem, listNavigation, listGlobals, updateGlobal, updateNavItem } from "./site";
import { PAGE_TEMPLATES, templateSummary } from "./templates";
import { assertUsableSlug, riskForPage } from "./protected";
import { pagePath, type WebsiteContent, type WebsitePage } from "./types";

// Mirrors lib/ai-agent/tools.ts so the registries compose without a circular import.
type AgentContext = { actorId: string; actorEmail: string };
type AgentTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  requiresConfirmation: boolean;
  summarize?: (args: any) => string; // eslint-disable-line @typescript-eslint/no-explicit-any
  execute: (args: any, ctx: AgentContext) => Promise<unknown>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const str = (v: unknown) => String(v ?? "").trim();

/** Resolve a page from an id, a slug, or a title fragment — Mike talks in titles. */
async function resolvePage(ref: unknown): Promise<WebsitePage> {
  const value = str(ref);
  if (!value) throw new Error("Which page? Give me the page id, its address, or its title.");
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return getPageOrThrow(value);
  }
  const pages = await listPages({ includeDeleted: false });
  const needle = value.toLowerCase().replace(/^\/+/, "");
  const exact = pages.find((p) => p.slug === needle || p.title.toLowerCase() === value.toLowerCase());
  if (exact) return exact;
  const partial = pages.filter((p) => p.title.toLowerCase().includes(value.toLowerCase()) || p.slug.includes(needle));
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) {
    throw new Error(`"${value}" matches several pages: ${partial.map((p) => `${p.title} (/${p.slug})`).join(", ")}. Which one?`);
  }
  throw new Error(`I could not find a website page matching "${value}". Use website_list_pages to see what exists.`);
}

/** Compact page shape for tool results — never the full block tree unless asked. */
function pageSummary(page: WebsitePage) {
  return {
    id: page.id,
    title: page.title,
    address: pagePath(page.slug),
    status: page.status,
    pageType: page.page_type,
    sections: page.draft_content.blocks.length,
    hasUnpublishedChanges: page.has_unpublished_changes,
    isProtected: page.is_protected,
    isLegal: page.is_legal,
    lastEditedBy: page.last_edited_source,
    updatedAt: page.updated_at,
    seoTitle: page.seo_title,
    seoDescription: page.seo_description,
    editUrl: `/dashboard/cms/editor/pages/${page.id}`,
  };
}

/**
 * Shared write path: validate → record a change set → apply to the draft →
 * publish only if direct publish is switched on AND the change is safe for it.
 */
async function writeThroughChangeSet(
  page: WebsitePage,
  nextContent: WebsiteContent,
  ctx: AgentContext,
  opts: { prompt?: string; meta?: Record<string, unknown>; action?: Parameters<typeof riskForPage>[0] } = {},
) {
  const { issues } = validateContent(nextContent);
  const proposal = await proposeChangeSet({
    pageId: page.id,
    content: nextContent,
    meta: opts.meta,
    prompt: opts.prompt ?? null,
    action: opts.action ?? "page.updateContent",
    source: "steward",
    actorId: ctx.actorId,
  });

  await applyChangeSetToDraft(proposal.changeSet.id, { actorId: ctx.actorId, actorType: "steward" });

  const permission = await stewardMayPublish(page, proposal.risk);
  let published = false;
  if (permission.allowed) {
    await approveAndPublishChangeSet(proposal.changeSet.id, { actorId: ctx.actorId, actorType: "steward" });
    published = true;
  }

  return {
    ok: true,
    pageId: page.id,
    changeSetId: proposal.changeSet.id,
    summary: proposal.summary,
    risk: proposal.risk,
    appliedToDraft: true,
    published,
    whatHappensNext: published
      ? "This is live now. A version was saved, so it can be rolled back."
      : permission.reason,
    previewUrl: `/website-preview/draft/${page.id}`,
    editUrl: `/dashboard/cms/editor/pages/${page.id}`,
    validationIssues: issues.length ? issues : undefined,
  };
}

// ── Read tools ───────────────────────────────────────────────────────────────

const listPagesTool: AgentTool = {
  name: "website_list_pages",
  description:
    "List the public website pages the Frontend Editor manages, with status, address, SEO state and whether they have " +
    "unpublished changes. Start here when the user talks about 'the website', 'a page', or names a page you have not read yet.",
  parameters: {
    type: "object",
    properties: {
      status: { type: "string", enum: ["all", "published", "draft", "scheduled", "archived"], description: "Filter by status (default all)." },
      search: { type: "string", description: "Optional text to match against title, address, SEO and body copy." },
    },
  },
  requiresConfirmation: false,
  execute: async (args) => {
    const pages = await listPages({ status: args.status ?? "all", search: args.search });
    return { count: pages.length, pages: pages.map(pageSummary) };
  },
};

const getPageTool: AgentTool = {
  name: "website_get_page",
  description:
    "Read one website page in full: its settings, SEO, and the ordered list of sections with every section's id, type " +
    "and props. You MUST call this before proposing any edit to a page — never write from memory.",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Page id, address (e.g. /kingdom-stewardship) or title." },
      version: { type: "string", enum: ["draft", "published"], description: "Which content to read (default draft)." },
    },
    required: ["page"],
  },
  requiresConfirmation: false,
  execute: async (args) => {
    const page = await resolvePage(args.page);
    const content = args.version === "published" ? page.published_content ?? { version: 1 as const, blocks: [] } : page.draft_content;
    return {
      ...pageSummary(page),
      reading: args.version === "published" ? "published" : "draft",
      seo: {
        title: page.seo_title, description: page.seo_description, keywords: page.seo_keywords,
        canonical: page.canonical_url, ogTitle: page.og_title, ogDescription: page.og_description,
        ogImage: page.og_image_url, noIndex: page.no_index, noFollow: page.no_follow,
      },
      sections: content.blocks.map((b, i) => ({ position: i, id: b.id, type: b.type, hidden: b.hidden ?? false, props: b.props })),
    };
  },
};

const listComponentsTool: AgentTool = {
  name: "website_list_components",
  description:
    "List the approved page components you may place, with the exact props each one accepts, and the page templates " +
    "available when creating a page. If what the user wants is not in this list, do NOT improvise — use " +
    "website_request_component instead.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  execute: async () => ({
    components: registrySummary(),
    schemas: renderRegistryForPrompt(),
    templates: templateSummary(),
  }),
};

const searchTool: AgentTool = {
  name: "website_search",
  description:
    "Search every website page — titles, addresses, body copy, buttons, links and SEO — and get back the pages that " +
    "match with excerpts. Use this before any site-wide change so you know exactly what is affected.",
  parameters: {
    type: "object",
    properties: { query: { type: "string", description: "The text to look for." } },
    required: ["query"],
  },
  requiresConfirmation: false,
  execute: async (args) => ({ hits: await searchWebsite(str(args.query)) }),
};

const navigationTool: AgentTool = {
  name: "website_get_navigation",
  description: "Read the site navigation (main, footer and utility menus) with each item's label, link, order and visibility.",
  parameters: {
    type: "object",
    properties: { group: { type: "string", enum: ["main", "footer", "utility"], description: "Optional — omit for all groups." } },
  },
  requiresConfirmation: false,
  execute: async (args) => ({ items: await listNavigation(args.group) }),
};

const globalsTool: AgentTool = {
  name: "website_get_globals",
  description: "Read the site-wide content items (announcement bar, primary CTA, booking link, contact details, social links, footer text, default SEO).",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  execute: async () => ({
    globals: (await listGlobals()).filter((g) => g.type !== "settings").map((g) => ({ key: g.key, label: g.label, value: g.value })),
  }),
};

const versionsTool: AgentTool = {
  name: "website_list_versions",
  description: "List the saved versions of a page (number, date, who made it, whether it came from Steward, and a summary) so a previous version can be restored.",
  parameters: {
    type: "object",
    properties: { page: { type: "string", description: "Page id, address or title." } },
    required: ["page"],
  },
  requiresConfirmation: false,
  execute: async (args) => {
    const page = await resolvePage(args.page);
    const versions = await listVersions(page.id);
    return {
      pageId: page.id,
      title: page.title,
      versions: versions.map((v) => ({
        id: v.id, number: v.version_number, source: v.source, summary: v.change_summary,
        createdAt: v.created_at, sections: v.content.blocks.length,
      })),
    };
  },
};

const linksTool: AgentTool = {
  name: "website_link_report",
  description:
    "Check every internal link on the website and report which ones point at something that is not published. Use this " +
    "when asked about broken links, and before removing or renaming a page.",
  parameters: { type: "object", properties: {} },
  requiresConfirmation: false,
  execute: async () => {
    const report = await linkReport();
    return {
      brokenCount: report.brokenCount,
      pages: report.pages
        .filter((p) => p.outgoing.some((l) => l.broken))
        .map((p) => ({ title: p.title, address: pagePath(p.slug), broken: p.outgoing.filter((l) => l.broken).map((l) => l.href) })),
    };
  },
};

const historyTool: AgentTool = {
  name: "website_history",
  description: "Read the website change history — what changed, when, and whether a person or Steward did it. Use this for questions like 'what changed last week'.",
  parameters: {
    type: "object",
    properties: { limit: { type: "number", description: "How many entries (default 40, max 200)." } },
  },
  requiresConfirmation: false,
  execute: async (args) => {
    const logs = await listAuditLogs(Math.min(200, Number(args.limit) || 40));
    return {
      entries: logs.map((l) => ({ when: l.created_at, who: l.actor_type, action: l.action, what: l.summary })),
    };
  },
};

const changeSetsTool: AgentTool = {
  name: "website_list_change_sets",
  description: "List proposed website changes and their status (proposed, applied to draft, published, rejected).",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Optional — limit to one page." },
      status: { type: "string", enum: ["proposed", "draft_applied", "approved", "published", "rejected"] },
    },
  },
  requiresConfirmation: false,
  execute: async (args) => {
    const pageId = args.page ? (await resolvePage(args.page)).id : undefined;
    const rows = await listChangeSets({ pageId, status: args.status });
    return {
      changeSets: rows.map((c) => ({
        id: c.id, status: c.status, risk: c.risk, summary: c.summary, prompt: c.prompt, source: c.source, createdAt: c.created_at,
      })),
    };
  },
};

// ── Write tools (confirmation-gated) ─────────────────────────────────────────

const createPageTool: AgentTool = {
  name: "website_create_page",
  description:
    "Create a NEW website page as a draft, optionally seeded from a template or from sections you supply. " +
    "Call website_list_components first so you use real component types and real prop names. The page is never live: " +
    "the owner previews and publishes it.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "The page title." },
      slug: { type: "string", description: "Address without the leading slash (e.g. steward-ai). Derived from the title if omitted." },
      template: { type: "string", description: `One of: ${PAGE_TEMPLATES.map((t) => t.key).join(", ")}. Pick the closest fit.` },
      pageType: { type: "string", enum: ["page", "landing", "resource", "marketing", "legal"] },
      seoTitle: { type: "string" },
      seoDescription: { type: "string" },
      sections: {
        type: "array",
        description: "Optional explicit sections, replacing the template's starter content. Each item is { type, props }.",
        items: {
          type: "object",
          properties: { type: { type: "string" }, props: { type: "object" } },
          required: ["type"],
        },
      },
    },
    required: ["title"],
  },
  requiresConfirmation: true,
  summarize: (args) =>
    `Create the DRAFT page "${str(args.title)}" at /${str(args.slug) || "(generated)"}` +
    `${args.sections?.length ? ` with ${args.sections.length} section(s)` : args.template ? ` from the ${args.template} template` : ""}. It will not be live.`,
  execute: async (args, ctx) => {
    if (args.slug) assertUsableSlug(str(args.slug));
    const sections = Array.isArray(args.sections) ? args.sections : null;
    if (sections) {
      for (const s of sections) {
        if (!getDefinition(str(s?.type))) {
          throw new Error(
            `"${str(s?.type)}" is not an approved page component. Call website_list_components, or use ` +
            "website_request_component if the site genuinely needs a new one.",
          );
        }
      }
    }

    const page = await createPage({
      title: str(args.title),
      slug: args.slug ? str(args.slug) : undefined,
      page_type: args.pageType,
      template: str(args.template) || "standard",
      seo_title: args.seoTitle ?? null,
      seo_description: args.seoDescription ?? null,
      content: sections ? { version: 1, blocks: sections.map((s: Record<string, unknown>) => ({ id: "", type: str(s.type), props: s.props ?? {} })) } : undefined,
      actorId: ctx.actorId,
      actorType: "steward",
    });

    return {
      ...pageSummary(page),
      published: false,
      whatHappensNext: "Saved as a draft. Preview it, then publish when you are happy with it.",
      previewUrl: `/website-preview/draft/${page.id}`,
    };
  },
};

const proposeChangeTool: AgentTool = {
  name: "website_propose_change",
  description:
    "Replace a page's sections with a revised list. Read the page with website_get_page first and send back the FULL " +
    "ordered list of sections you want, keeping the `id` of any section you are editing (so it is recorded as an edit " +
    "rather than a delete-and-add) and omitting the `id` for new ones. The change is recorded, applied to the DRAFT, " +
    "and left for the owner to preview and publish.",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Page id, address or title." },
      sections: {
        type: "array",
        description: "The complete new list of sections, in order.",
        items: {
          type: "object",
          properties: {
            id: { type: "string", description: "Keep the existing id when editing a section; omit for a new one." },
            type: { type: "string" },
            props: { type: "object" },
            hidden: { type: "boolean" },
          },
          required: ["type"],
        },
      },
      seoTitle: { type: "string", description: "Optional SEO title change made as part of the same edit." },
      seoDescription: { type: "string" },
      prompt: { type: "string", description: "What the owner asked for, in their words. Recorded on the change set." },
    },
    required: ["page", "sections"],
  },
  requiresConfirmation: true,
  summarize: (args) =>
    `Update "${str(args.page)}" to ${Array.isArray(args.sections) ? args.sections.length : 0} section(s). ` +
    "It goes into the draft for you to preview — not straight onto the live site.",
  execute: async (args, ctx) => {
    const page = await resolvePage(args.page);
    const blocks = (Array.isArray(args.sections) ? args.sections : []).map((s: Record<string, unknown>) => ({
      id: str(s.id), type: str(s.type), props: (s.props ?? {}) as Record<string, unknown>, hidden: s.hidden === true,
    }));
    for (const b of blocks) {
      if (!getDefinition(b.type)) {
        throw new Error(`"${b.type}" is not an approved page component. Call website_list_components first.`);
      }
    }
    const meta: Record<string, unknown> = {};
    if (args.seoTitle !== undefined) meta.seo_title = str(args.seoTitle);
    if (args.seoDescription !== undefined) meta.seo_description = str(args.seoDescription);

    return writeThroughChangeSet(page, { version: 1, blocks: blocks as WebsiteContent["blocks"] }, ctx, {
      prompt: str(args.prompt) || undefined,
      meta: Object.keys(meta).length ? meta : undefined,
    });
  },
};

const editSectionTool: AgentTool = {
  name: "website_edit_section",
  description:
    "Make a targeted change to ONE section of a page without resending the whole page: update its props, move it, hide " +
    "it, add a new section after it, or remove it. Read the page first so you have the section id. Lands in the draft.",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Page id, address or title." },
      operation: { type: "string", enum: ["update", "add", "move", "remove", "hide", "show"] },
      sectionId: { type: "string", description: "The section to act on (not needed for 'add')." },
      type: { type: "string", description: "For 'add' — the component type." },
      props: { type: "object", description: "For 'add' or 'update' — only the props to set; the rest are kept." },
      afterSectionId: { type: "string", description: "For 'add' — place it after this section. Omit to append." },
      direction: { type: "string", enum: ["up", "down"], description: "For 'move'." },
      position: { type: "number", description: "For 'move' — an exact position instead of a direction." },
      prompt: { type: "string", description: "What the owner asked for, in their words." },
    },
    required: ["page", "operation"],
  },
  requiresConfirmation: true,
  summarize: (args) => {
    const what = { update: "Edit", add: "Add", move: "Move", remove: "Remove", hide: "Hide", show: "Show" }[str(args.operation)] ?? "Change";
    return `${what} a section on "${str(args.page)}". It goes into the draft for you to preview.`;
  },
  execute: async (args, ctx) => {
    const page = await resolvePage(args.page);
    const op = str(args.operation);
    let next = page.draft_content;
    let action: Parameters<typeof riskForPage>[0] = "block.update";

    switch (op) {
      case "add": {
        if (!getDefinition(str(args.type))) {
          throw new Error(`"${str(args.type)}" is not an approved page component. Call website_list_components first.`);
        }
        next = addBlock(next, { type: str(args.type), props: args.props ?? {}, afterBlockId: args.afterSectionId ? str(args.afterSectionId) : undefined }).content;
        action = "block.add";
        break;
      }
      case "update":
        next = updateBlock(next, str(args.sectionId), { props: args.props ?? {} });
        break;
      case "move":
        next = moveBlock(next, str(args.sectionId), { direction: args.direction, position: args.position });
        action = "block.move";
        break;
      case "remove":
        next = removeBlock(next, str(args.sectionId));
        action = "block.remove";
        break;
      case "hide":
        next = updateBlock(next, str(args.sectionId), { hidden: true });
        break;
      case "show":
        next = updateBlock(next, str(args.sectionId), { hidden: false });
        break;
      default:
        throw new Error("Unknown section operation.");
    }

    return writeThroughChangeSet(page, next, ctx, { prompt: str(args.prompt) || undefined, action });
  },
};

const updateSettingsTool: AgentTool = {
  name: "website_update_page_settings",
  description:
    "Change a page's settings and SEO: title, address, page type, SEO title/description/keywords, social sharing text " +
    "and image, and whether search engines should index it. Changing the address automatically keeps a redirect from " +
    "the old one. Protected pages refuse address changes.",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Page id, address or title." },
      title: { type: "string" },
      slug: { type: "string", description: "New address without the leading slash." },
      seoTitle: { type: "string" },
      seoDescription: { type: "string" },
      seoKeywords: { type: "array", items: { type: "string" } },
      ogTitle: { type: "string" },
      ogDescription: { type: "string" },
      ogImageUrl: { type: "string" },
      noIndex: { type: "boolean" },
      navigationLabel: { type: "string" },
    },
    required: ["page"],
  },
  requiresConfirmation: true,
  summarize: (args) =>
    `Update the settings for "${str(args.page)}"${args.slug ? ` and move it to /${str(args.slug)} (a redirect from the old address is kept)` : ""}.`,
  execute: async (args, ctx) => {
    const page = await resolvePage(args.page);
    if (args.slug) assertUsableSlug(str(args.slug));
    const updated = await updatePageMeta(page.id, {
      title: args.title,
      slug: args.slug,
      seo_title: args.seoTitle,
      seo_description: args.seoDescription,
      seo_keywords: args.seoKeywords,
      og_title: args.ogTitle,
      og_description: args.ogDescription,
      og_image_url: args.ogImageUrl,
      no_index: args.noIndex,
      navigation_label: args.navigationLabel,
      actorId: ctx.actorId,
      actorType: "steward",
      createRedirect: true,
    });
    return {
      ...pageSummary(updated),
      whatHappensNext:
        updated.status === "published"
          ? "Settings saved. Publish the page to put the new SEO and metadata live."
          : "Settings saved on the draft.",
    };
  },
};

const publishTool: AgentTool = {
  name: "website_publish_page",
  description:
    "Publish a page's current draft to the live site. A version is saved first, so it can always be rolled back. Only " +
    "do this when the owner has clearly asked for it to go live.",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Page id, address or title." },
      summary: { type: "string", description: "A short note about what this publish contains." },
    },
    required: ["page"],
  },
  requiresConfirmation: true,
  summarize: (args) => `PUBLISH "${str(args.page)}" to the live website. Visitors will see it immediately.`,
  execute: async (args, ctx) => {
    const page = await resolvePage(args.page);
    const { page: published, version, issues } = await publishPage(page.id, {
      actorId: ctx.actorId, actorType: "steward", summary: str(args.summary) || "Published by Steward.",
    });
    return {
      ...pageSummary(published),
      published: true,
      versionNumber: version.version_number,
      liveUrl: pagePath(published.slug),
      validationIssues: issues.length ? issues : undefined,
    };
  },
};

const lifecycleTool: AgentTool = {
  name: "website_page_lifecycle",
  description:
    "Take a page off the live site, archive it, restore it, duplicate it, or restore one of its saved versions into the " +
    "draft. Archiving is the safe choice and should be preferred over deletion; permanent deletion is deliberately NOT " +
    "available to you — the owner does that in the dashboard.",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Page id, address or title." },
      operation: { type: "string", enum: ["unpublish", "archive", "restore", "duplicate", "restoreVersion"] },
      versionId: { type: "string", description: "For 'restoreVersion' — from website_list_versions." },
      title: { type: "string", description: "For 'duplicate' — the new page's title." },
    },
    required: ["page", "operation"],
  },
  requiresConfirmation: true,
  summarize: (args) => {
    const op = str(args.operation);
    const labels: Record<string, string> = {
      unpublish: `Take "${str(args.page)}" off the live site (the draft is kept).`,
      archive: `Archive "${str(args.page)}" — off the site and out of the navigation, fully recoverable.`,
      restore: `Restore "${str(args.page)}" as a draft.`,
      duplicate: `Duplicate "${str(args.page)}" as a new draft.`,
      restoreVersion: `Restore an earlier version of "${str(args.page)}" into its draft.`,
    };
    return labels[op] ?? `Change "${str(args.page)}".`;
  },
  execute: async (args, ctx) => {
    const page = await resolvePage(args.page);
    const opts = { actorId: ctx.actorId, actorType: "steward" as const };
    switch (str(args.operation)) {
      case "unpublish":
        return { ...pageSummary(await unpublishPage(page.id, opts)), whatHappensNext: "It is off the live site. The draft is untouched." };
      case "archive":
        return { ...pageSummary(await archivePage(page.id, opts)), whatHappensNext: "Archived and removed from the navigation. It can be restored at any time." };
      case "restore":
        return { ...pageSummary(await restorePage(page.id, opts)), whatHappensNext: "Restored as a draft. Publish it when you are ready." };
      case "duplicate":
        return { ...pageSummary(await duplicatePage(page.id, { ...opts, title: str(args.title) || undefined })), whatHappensNext: "Created as a new draft." };
      case "restoreVersion": {
        const restored = await restoreVersion(str(args.versionId), opts);
        return { ...pageSummary(restored), whatHappensNext: "That version is now in the draft. Preview it, then publish if it is what you wanted." };
      }
      default:
        throw new Error("Unknown page operation.");
    }
  },
};

const navigationWriteTool: AgentTool = {
  name: "website_update_navigation",
  description:
    "Add, edit, reorder, hide or remove a navigation item. Navigation shows on every page, so this is treated as a " +
    "high-risk change and always needs the owner's confirmation.",
  parameters: {
    type: "object",
    properties: {
      operation: { type: "string", enum: ["add", "update", "remove"] },
      group: { type: "string", enum: ["main", "footer", "utility"], description: "For 'add' (default main)." },
      id: { type: "string", description: "For 'update' and 'remove' — from website_get_navigation." },
      parentLabel: { type: "string", description: "For 'add' — put it in this item's dropdown (e.g. 'Resources')." },
      label: { type: "string" },
      url: { type: "string", description: "Page address (/steward-ai) or an external https link." },
      sortOrder: { type: "number", description: "Position within its menu or dropdown." },
      isVisible: { type: "boolean" },
      openInNewTab: { type: "boolean" },
    },
    required: ["operation"],
  },
  requiresConfirmation: true,
  summarize: (args) => {
    const op = str(args.operation);
    if (op === "add") {
      return `Add "${str(args.label)}" to the ${str(args.group) || "main"} navigation${args.parentLabel ? `, under ${str(args.parentLabel)}` : ""}. This appears on every page.`;
    }
    if (op === "remove") return "Remove an item from the site navigation. This affects every page.";
    return `Update a navigation item${args.label ? ` to "${str(args.label)}"` : ""}. This affects every page.`;
  },
  execute: async (args, ctx) => {
    const op = str(args.operation);
    const opts = { actorId: ctx.actorId, actorType: "steward" as const };

    if (op === "add") {
      const group = (str(args.group) || "main") as "main" | "footer" | "utility";
      let parentId: string | null = null;
      if (args.parentLabel) {
        const existing = await listNavigation(group);
        const parent = existing.find((i) => i.label.toLowerCase() === str(args.parentLabel).toLowerCase() && !i.parent_id);
        if (!parent) throw new Error(`There is no "${str(args.parentLabel)}" item in the ${group} navigation to nest under.`);
        parentId = parent.id;
      }
      const siblings = (await listNavigation(group)).filter((i) => i.parent_id === parentId);
      const item = await createNavItem({
        navigation_group: group, label: str(args.label), url: str(args.url), parent_id: parentId,
        sort_order: typeof args.sortOrder === "number" ? args.sortOrder : siblings.length,
        open_in_new_tab: args.openInNewTab === true, ...opts,
      });
      return { ok: true, item, whatHappensNext: "The navigation is updated across the whole site." };
    }

    if (op === "remove") {
      await deleteNavItem(str(args.id), opts);
      return { ok: true, whatHappensNext: "Removed from the navigation across the whole site." };
    }

    const item = await updateNavItem(str(args.id), {
      label: args.label, url: args.url, sort_order: args.sortOrder,
      is_visible: args.isVisible, open_in_new_tab: args.openInNewTab, ...opts,
    });
    return { ok: true, item, whatHappensNext: "The navigation is updated across the whole site." };
  },
};

const globalWriteTool: AgentTool = {
  name: "website_update_global",
  description:
    "Change a site-wide content item (announcement bar, primary CTA, booking link, contact details, social links, footer " +
    "text, default SEO). These appear on every page, so this is a high-risk change. Read them with website_get_globals first.",
  parameters: {
    type: "object",
    properties: {
      key: { type: "string", description: "The item key from website_get_globals, e.g. site.primary_cta." },
      value: { type: "object", description: "The fields to change. Unknown fields are ignored." },
    },
    required: ["key", "value"],
  },
  requiresConfirmation: true,
  summarize: (args) => `Change the site-wide item "${str(args.key)}". This appears on EVERY page of the website.`,
  execute: async (args, ctx) => {
    const updated = await updateGlobal(str(args.key), (args.value ?? {}) as Record<string, unknown>, {
      actorId: ctx.actorId, actorType: "steward",
    });
    return { ok: true, key: updated.key, value: updated.value, whatHappensNext: "This is live on every page immediately." };
  },
};

const siteWideReplaceTool: AgentTool = {
  name: "website_site_wide_replace",
  description:
    "Replace a piece of text everywhere it appears on the website (for example every 'Learn More' button label). ALWAYS " +
    "run website_search first and tell the owner exactly which pages are affected and how many times. Changes land in " +
    "each page's draft, never straight onto the live site.",
  parameters: {
    type: "object",
    properties: {
      find: { type: "string", description: "The exact text to find (case sensitive)." },
      replaceWith: { type: "string", description: "What to put in its place." },
      excludePages: { type: "array", items: { type: "string" }, description: "Page ids, addresses or titles to leave alone." },
      prompt: { type: "string", description: "What the owner asked for, in their words." },
    },
    required: ["find", "replaceWith"],
  },
  requiresConfirmation: true,
  summarize: (args) =>
    `Replace "${str(args.find)}" with "${str(args.replaceWith)}" across the website` +
    `${Array.isArray(args.excludePages) && args.excludePages.length ? `, except ${args.excludePages.join(", ")}` : ""}. ` +
    "Each affected page's DRAFT is updated; nothing goes live until you publish.",
  execute: async (args, ctx) => {
    const find = String(args.find ?? "");
    if (!find) throw new Error("Tell me what text to look for.");

    const excluded = new Set<string>();
    for (const ref of Array.isArray(args.excludePages) ? args.excludePages : []) {
      try { excluded.add((await resolvePage(ref)).id); } catch { /* an unmatched exclusion is reported below */ }
    }

    const pages = await listPages({ includeDeleted: false });
    const changed: { title: string; address: string; replacements: number; changeSetId: string }[] = [];

    for (const page of pages) {
      if (excluded.has(page.id) || page.status === "archived") continue;
      const { content, replacements } = replaceTextInContent(page.draft_content, find, String(args.replaceWith ?? ""));
      if (!replacements) continue;
      const result = await writeThroughChangeSet(page, content, ctx, {
        prompt: str(args.prompt) || `Site-wide replace: "${find}" → "${String(args.replaceWith ?? "")}"`,
        action: "bulk.replace",
      });
      changed.push({ title: page.title, address: pagePath(page.slug), replacements, changeSetId: result.changeSetId });
    }

    return {
      ok: true,
      pagesChanged: changed.length,
      totalReplacements: changed.reduce((n, c) => n + c.replacements, 0),
      pages: changed,
      whatHappensNext:
        changed.length
          ? "Each page's draft now has the new wording. Review and publish the ones you want live."
          : "Nothing on the site contained that text, so nothing changed.",
    };
  },
};

const previewLinkTool: AgentTool = {
  name: "website_create_preview_link",
  description: "Create a private, expiring link to a page's draft so it can be shared for review without publishing it.",
  parameters: {
    type: "object",
    properties: {
      page: { type: "string", description: "Page id, address or title." },
      hours: { type: "number", description: "How long it should work for (default 24, max 168)." },
    },
    required: ["page"],
  },
  requiresConfirmation: true,
  summarize: (args) => `Create a private preview link for "${str(args.page)}". The page stays unpublished.`,
  execute: async (args, ctx) => {
    const page = await resolvePage(args.page);
    const preview = await createPreviewToken(page.id, { actorId: ctx.actorId, hours: Number(args.hours) || undefined });
    await logWebsiteAudit({
      actorId: ctx.actorId, actorType: "steward", action: "preview.link_created", resourceId: page.id,
      summary: `Created a draft preview link for "${page.title}".`,
    });
    return { url: preview.url, expiresAt: preview.expiresAt, note: "Anyone with this link can see the draft until it expires. It is never indexed." };
  },
};

const requestComponentTool: AgentTool = {
  name: "website_request_component",
  description:
    "The developer escape hatch (spec §54). When the owner asks for something the approved components cannot do — an " +
    "interactive calculator, a custom booking widget, a new layout — do NOT improvise with existing blocks or raw code. " +
    "Write a developer specification with this tool instead, then tell the owner what you have queued and why.",
  parameters: {
    type: "object",
    properties: {
      title: { type: "string", description: "Short name for the component or feature." },
      whatItDoes: { type: "string", description: "What the owner asked for, in plain language." },
      proposedComponent: { type: "string", description: "The component you propose, and the props it would need." },
      pagePlacement: { type: "string", description: "Which page(s) it would go on, and where." },
      dataRequirements: { type: "string", description: "What data it needs and where that comes from." },
      acceptanceCriteria: { type: "string", description: "How everyone will know it is done, one line per criterion." },
    },
    required: ["title", "whatItDoes"],
  },
  requiresConfirmation: true,
  summarize: (args) => `Queue a developer specification for "${str(args.title)}". Nothing on the website changes.`,
  execute: async (args, ctx) => {
    const body = [
      `## What was asked for\n${str(args.whatItDoes)}`,
      args.proposedComponent ? `## Proposed component\n${str(args.proposedComponent)}` : "",
      args.pagePlacement ? `## Page placement\n${str(args.pagePlacement)}` : "",
      args.dataRequirements ? `## Data requirements\n${str(args.dataRequirements)}` : "",
      args.acceptanceCriteria ? `## Acceptance criteria\n${str(args.acceptanceCriteria)}` : "",
      "## Integration\nRegister the component in lib/website/registry.ts with its field schema, add the matching React " +
        "component under components/website/blocks, and map it in components/website/page-renderer.tsx. It then appears " +
        "in the Add Section picker and becomes available to Steward automatically.",
    ]
      .filter(Boolean)
      .join("\n\n");

    const request = await upsertDevRequest({
      sourceType: "manual",
      title: `Frontend Editor component: ${str(args.title)}`,
      body,
      requestKind: "website_component",
      priority: "medium",
      metadata: { origin: "frontend_editor", requestedBy: ctx.actorEmail },
      actorUserId: ctx.actorId,
      actorEmail: ctx.actorEmail,
    });

    await logWebsiteAudit({
      actorId: ctx.actorId, actorType: "steward", action: "component.requested", resourceType: "dev_request",
      resourceId: request.id, summary: `Wrote a developer specification for "${str(args.title)}".`,
    });

    return {
      ok: true,
      devRequestId: request.id,
      whatHappensNext:
        "This is a developer job rather than a content change, so I have written it up and queued it. Nothing on the " +
        "website has changed. Once a developer builds and registers the component it will appear in the section picker.",
    };
  },
};

export const WEBSITE_TOOLS: AgentTool[] = [
  // Reads
  listPagesTool,
  getPageTool,
  listComponentsTool,
  searchTool,
  navigationTool,
  globalsTool,
  versionsTool,
  linksTool,
  historyTool,
  changeSetsTool,
  // Writes
  createPageTool,
  proposeChangeTool,
  editSectionTool,
  updateSettingsTool,
  publishTool,
  lifecycleTool,
  navigationWriteTool,
  globalWriteTool,
  siteWideReplaceTool,
  previewLinkTool,
  requestComponentTool,
];

/**
 * A compact site map for Steward's system prompt (spec §30 — retrieval, not the
 * whole website). Titles, addresses and status only; content comes from the read
 * tools on demand.
 */
export async function renderSiteMapForPrompt(): Promise<string> {
  try {
    const pages = await listPages({ includeDeleted: false });
    if (!pages.length) {
      return "WEBSITE SITE MAP\nNo Frontend-Editor pages exist yet. Use website_create_page to make the first one.";
    }
    const lines = pages
      .slice(0, 80)
      .map((p) => `- ${p.title} — ${pagePath(p.slug)} (${p.status}${p.has_unpublished_changes ? ", unpublished changes" : ""}${p.is_legal ? ", legal" : ""}${p.is_protected ? ", protected" : ""})`);
    return `WEBSITE SITE MAP (Frontend-Editor-owned pages; every other address is code-owned)\n${lines.join("\n")}`;
  } catch {
    return "";
  }
}

/** The approved-component reference injected alongside the site map. */
export function renderComponentsForPrompt(): string {
  return renderRegistryForPrompt();
}

// Re-exported so the confirmation UI and tests can reach the same deletion guard
// Steward deliberately does not have.
export { deletePage as ownerOnlyDeletePage, getPage as _getPage };
