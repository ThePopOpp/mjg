import { getTemplate, saveSocialTemplate, updatePost } from "@/lib/social-media/data";
import { getLiveRecord } from "@/lib/mcp/records";
import type { ToolDef } from "./types";

// Social gaps from the expansion plan §2.1: editing posts and templates.
// Deleting either is in lib/tools/trash.ts; publishing stays publish_social_post (high).

const socialPostUpdate: ToolDef = {
  name: "social_post_update",
  title: "Edit a social post",
  description:
    "Changes a draft, scheduled or failed social post (id from list_social_posts): body_text, hashtags, link_url, media_urls, account_id, scheduled_at (ISO 8601; sets it scheduled), or status draft to unschedule. Published posts can't be edited here.",
  domain: "social",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      changes: {
        type: "object",
        properties: {
          body_text: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          link_url: { type: ["string", "null"] },
          media_urls: { type: "array", items: { type: "string" } },
          account_id: { type: ["string", "null"] },
          scheduled_at: { type: ["string", "null"] },
          status: { type: "string", enum: ["draft", "scheduled"] },
        },
        additionalProperties: false,
      },
    },
    required: ["id", "changes"],
  },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "social_post", id: (a: { id: string }) => a.id },
  run: async (a: { id: string; changes: Record<string, unknown> }) => {
    const post = await getLiveRecord("social_post", a.id);
    if (["published", "publishing"].includes(post.status)) throw new Error("That post is already published (or publishing) and can't be edited.");
    const changes = { ...a.changes };
    if (changes.scheduled_at && !changes.status) changes.status = "scheduled";
    if (changes.status === "scheduled" && !(changes.scheduled_at ?? post.scheduled_at)) throw new Error("A scheduled time is required to schedule a post.");
    if (changes.status === "draft" && !("scheduled_at" in changes)) changes.scheduled_at = null;
    await updatePost(a.id, changes);
    return { ok: true, id: a.id };
  },
};

const socialTemplateUpdate: ToolDef = {
  name: "social_template_update",
  title: "Edit a social template",
  description:
    "Changes a social post template (id from list_social_templates): name, description, category, status (draft, active, archived), platforms, bodyText, hashtags, mediaUrls, linkUrl. Fields you leave out keep their value. Changing bodyText replaces a template built in the drag-and-drop builder with plain text.",
  domain: "social",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      changes: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: ["string", "null"] },
          category: { type: "string" },
          status: { type: "string", enum: ["draft", "active", "archived"] },
          platforms: { type: "array", items: { type: "string" } },
          bodyText: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          mediaUrls: { type: "array", items: { type: "string" } },
          linkUrl: { type: ["string", "null"] },
        },
        additionalProperties: false,
      },
    },
    required: ["id", "changes"],
  },
  risk: "write",
  minRole: "super_admin",
  record: { entity: "social_template", id: (a: { id: string }) => a.id },
  run: async (a: { id: string; changes: Record<string, any> }, ctx) => {
    const t = await getTemplate(a.id);
    if (!t) throw new Error("No such template (or it's in the trash).");
    const c = a.changes;
    // saveSocialTemplate writes every field, so start from the current template.
    const saved = await saveSocialTemplate({
      id: t.id,
      name: c.name ?? t.name,
      slug: t.slug,
      description: "description" in c ? c.description : t.description,
      category: c.category ?? t.category,
      status: c.status ?? t.status,
      platforms: c.platforms ?? t.platforms,
      bodyText: c.bodyText ?? t.body_text,
      // A builder schema re-derives the body, so keep it only when the text isn't being replaced.
      builderSchema: c.bodyText === undefined ? t.builder_schema : undefined,
      mediaUrls: c.mediaUrls ?? t.media_urls,
      hashtags: c.hashtags ?? t.hashtags,
      linkUrl: "linkUrl" in c ? c.linkUrl : t.link_url,
      actorUserId: ctx.actorId,
    });
    return { id: saved.id, name: saved.name, status: saved.status };
  },
};

export const SOCIAL_PLUS_TOOLS: ToolDef[] = [socialPostUpdate, socialTemplateUpdate];
