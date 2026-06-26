import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { applyMergeFields, composePostText, extractMergeFields, renderSchema } from "./render";
import { publishToPlatform, SocialNotConnectedError } from "./publish";
import type {
  SocialAccount, SocialAutomation, SocialDashboardData, SocialEngagement, SocialMessage,
  SocialPost, SocialReport, SocialStats, SocialTemplate,
} from "./types";

export function slugify(input: string): string {
  return (String(input || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60)) || "post";
}
async function ensureUniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const sb = createSupabaseAdminClient();
  const root = slugify(base);
  let candidate = root;
  for (let i = 0; i < 50; i++) {
    const { data } = await sb.from("social_templates").select("id").eq("slug", candidate).maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${root}-${i + 2}`;
  }
  return `${root}-${Date.now().toString(36)}`;
}

const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
function sumEngagement(list: { engagement?: SocialEngagement | null }[]): SocialEngagement {
  const acc: Required<SocialEngagement> = { likes: 0, comments: 0, shares: 0, impressions: 0, reach: 0, clicks: 0 };
  for (const p of list) {
    const e = p.engagement ?? {};
    acc.likes += num(e.likes); acc.comments += num(e.comments); acc.shares += num(e.shares);
    acc.impressions += num(e.impressions); acc.reach += num(e.reach); acc.clicks += num(e.clicks);
  }
  return acc;
}
function engagementTotal(e: SocialEngagement | null | undefined): number {
  const x = e ?? {};
  return num(x.likes) + num(x.comments) + num(x.shares) + num(x.clicks);
}

// ── Accounts (Settings) ──────────────────────────────────────────────────────
export async function listAccounts(): Promise<SocialAccount[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("social_accounts").select("*").order("platform", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SocialAccount[];
}
export async function saveAccount(input: {
  id?: string; platform: string; display_name: string; profile_url?: string | null;
  external_id?: string | null; status?: string; is_active?: boolean; credentials?: Record<string, string>;
  actorUserId?: string;
}): Promise<SocialAccount> {
  const sb = createSupabaseAdminClient();
  const row: Record<string, unknown> = {
    platform: input.platform,
    display_name: input.display_name,
    profile_url: input.profile_url ?? null,
    external_id: input.external_id ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.status) row.status = input.status;
  if (input.is_active !== undefined) row.is_active = input.is_active;
  if (input.credentials) row.credentials = input.credentials;

  if (input.id) {
    const { data, error } = await sb.from("social_accounts").update(row).eq("id", input.id).select("*").single();
    if (error) throw new Error(error.message);
    return data as unknown as SocialAccount;
  }
  row.created_by = input.actorUserId ?? null;
  const { data, error } = await sb.from("social_accounts").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as unknown as SocialAccount;
}
export async function deleteAccount(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("social_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Templates ─────────────────────────────────────────────────────────────────
export async function getSocialTemplateData(): Promise<{ templates: SocialTemplate[]; automations: SocialAutomation[] }> {
  const sb = createSupabaseAdminClient();
  const [t, a] = await Promise.all([
    sb.from("social_templates").select("*").order("updated_at", { ascending: false }),
    sb.from("social_automations").select("*, template:social_templates(name, slug)"),
  ]);
  if (t.error) throw new Error(t.error.message);
  if (a.error) throw new Error(a.error.message);
  return { templates: (t.data ?? []) as unknown as SocialTemplate[], automations: (a.data ?? []) as unknown as SocialAutomation[] };
}
export async function listActiveTemplates(): Promise<SocialTemplate[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("social_templates").select("*").eq("status", "active").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SocialTemplate[];
}
export async function getTemplate(id: string): Promise<SocialTemplate | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb.from("social_templates").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as unknown as SocialTemplate | null;
}
export async function saveSocialTemplate(input: {
  id?: string; name: string; slug?: string; description?: string | null; category?: string;
  status?: string; platforms?: string[]; bodyText?: string; builderSchema?: unknown;
  mediaUrls?: string[]; hashtags?: string[]; linkUrl?: string | null; actorUserId?: string;
}): Promise<SocialTemplate> {
  const sb = createSupabaseAdminClient();
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Template name is required.");

  // If a builder schema is supplied, derive body/media/hashtags from it.
  let body = input.bodyText ?? "";
  let media = input.mediaUrls ?? [];
  let tags = input.hashtags ?? [];
  let link = input.linkUrl ?? null;
  if (input.builderSchema && Array.isArray((input.builderSchema as { blocks?: unknown[] }).blocks)) {
    const r = renderSchema(input.builderSchema as never);
    body = r.body_text || body;
    if (r.media_urls.length) media = r.media_urls;
    if (r.hashtags.length) tags = r.hashtags;
    link = r.link_url ?? link;
  }

  const row: Record<string, unknown> = {
    name,
    description: input.description ?? null,
    category: input.category || "general",
    status: input.status || "draft",
    platforms: input.platforms ?? [],
    body_text: body,
    builder_schema: input.builderSchema ?? {},
    media_urls: media,
    hashtags: tags,
    link_url: link,
    available_fields: extractMergeFields(body),
    updated_by: input.actorUserId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    row.slug = await ensureUniqueSlug(input.slug || name, input.id);
    const { data, error } = await sb.from("social_templates").update(row).eq("id", input.id).select("*").single();
    if (error) throw new Error(error.message);
    return data as unknown as SocialTemplate;
  }
  row.slug = await ensureUniqueSlug(input.slug || name);
  row.created_by = input.actorUserId ?? null;
  const { data, error } = await sb.from("social_templates").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as unknown as SocialTemplate;
}
export async function deleteSocialTemplate(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  await sb.from("social_automations").update({ enabled: false, template_id: null }).eq("template_id", id);
  const { error } = await sb.from("social_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Posts ─────────────────────────────────────────────────────────────────────
export async function listPosts(opts: { status?: string; limit?: number } = {}): Promise<SocialPost[]> {
  const sb = createSupabaseAdminClient();
  let q = sb.from("social_posts")
    .select("*, account:social_accounts(display_name, platform), template:social_templates(name)")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 500);
  if (opts.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SocialPost[];
}

export async function createPost(input: {
  template_id?: string | null; account_id?: string | null; platform: string;
  body_text: string; media_urls?: string[]; hashtags?: string[]; link_url?: string | null;
  scheduled_at?: string | null; status?: string; merge_data?: Record<string, string>; actorUserId?: string;
}): Promise<SocialPost> {
  const sb = createSupabaseAdminClient();
  const merge = input.merge_data ?? {};
  const status = input.status || (input.scheduled_at ? "scheduled" : "draft");
  if (status === "scheduled" && !input.scheduled_at) throw new Error("A scheduled time is required to schedule a post.");

  const row = {
    template_id: input.template_id ?? null,
    account_id: input.account_id ?? null,
    platform: input.platform,
    status,
    body_text: applyMergeFields(input.body_text || "", merge),
    media_urls: input.media_urls ?? [],
    hashtags: input.hashtags ?? [],
    link_url: input.link_url ?? null,
    scheduled_at: input.scheduled_at ?? null,
    merge_data: merge,
    created_by: input.actorUserId ?? null,
  };
  const { data, error } = await sb.from("social_posts").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return data as unknown as SocialPost;
}

export async function updatePost(id: string, patch: Record<string, unknown>): Promise<void> {
  const sb = createSupabaseAdminClient();
  const allowed: Record<string, unknown> = {};
  for (const k of ["body_text", "media_urls", "hashtags", "link_url", "scheduled_at", "status", "account_id", "engagement"]) {
    if (k in patch && patch[k] !== undefined) allowed[k] = patch[k];
  }
  allowed.updated_at = new Date().toISOString();
  const { error } = await sb.from("social_posts").update(allowed).eq("id", id);
  if (error) throw new Error(error.message);
}
export async function deletePost(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("social_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Publish a post now via the platform adapter (live API wiring is in publish.ts).
export async function publishPost(id: string): Promise<SocialPost> {
  const sb = createSupabaseAdminClient();
  const { data: post, error } = await sb.from("social_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!post) throw new Error("Post not found.");
  if (!post.account_id) throw new Error("Choose an account before publishing.");

  const { data: account } = await sb.from("social_accounts").select("*").eq("id", post.account_id).maybeSingle();
  if (!account) throw new Error("The account for this post no longer exists.");

  try {
    const result = await publishToPlatform({
      account: account as unknown as SocialAccount,
      bodyText: post.body_text,
      hashtags: post.hashtags ?? [],
      mediaUrls: post.media_urls ?? [],
      linkUrl: post.link_url ?? null,
    });
    const { data: updated } = await sb.from("social_posts").update({
      status: "published", published_at: new Date().toISOString(),
      external_post_id: result.externalPostId, external_url: result.externalUrl, error_message: null,
      updated_at: new Date().toISOString(),
    }).eq("id", id).select("*").single();
    return updated as unknown as SocialPost;
  } catch (e) {
    if (e instanceof SocialNotConnectedError) throw e; // setup issue — leave status untouched
    const message = e instanceof Error ? e.message : "Publish failed.";
    await sb.from("social_posts").update({ status: "failed", error_message: message, updated_at: new Date().toISOString() }).eq("id", id);
    throw new Error(message);
  }
}

// Publish all scheduled posts whose time has arrived (cron/manual trigger).
export async function publishDuePosts(limit = 25): Promise<{ attempted: number; published: number; failed: number }> {
  const sb = createSupabaseAdminClient();
  const { data } = await sb.from("social_posts").select("id")
    .eq("status", "scheduled").lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true }).limit(limit);
  let published = 0, failed = 0;
  for (const p of data ?? []) {
    try { await publishPost(p.id); published += 1; } catch { failed += 1; }
  }
  return { attempted: (data ?? []).length, published, failed };
}

// ── Inbox: messages / comments / reviews ────────────────────────────────────────
export async function listMessages(opts: { kind?: string; status?: string; limit?: number } = {}): Promise<SocialMessage[]> {
  const sb = createSupabaseAdminClient();
  let q = sb.from("social_messages").select("*").order("received_at", { ascending: false }).limit(opts.limit ?? 500);
  if (opts.kind) q = q.eq("kind", opts.kind);
  if (opts.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SocialMessage[];
}
export async function updateMessage(id: string, patch: { status?: string; reply_text?: string }): Promise<void> {
  const sb = createSupabaseAdminClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status) row.status = patch.status;
  if (patch.reply_text !== undefined) { row.reply_text = patch.reply_text; row.replied_at = new Date().toISOString(); row.status = "replied"; }
  const { error } = await sb.from("social_messages").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}
export async function deleteMessage(id: string): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("social_messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Automations ─────────────────────────────────────────────────────────────────
export async function saveAutomation(input: { event_key: string; template_id: string | null; platforms?: string[]; enabled: boolean; actorUserId?: string }): Promise<void> {
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("social_automations").upsert({
    event_key: input.event_key,
    template_id: input.template_id,
    platforms: input.platforms ?? [],
    enabled: input.enabled,
    updated_by: input.actorUserId ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "event_key" });
  if (error) throw new Error(error.message);
}

// ── Reports / analytics ─────────────────────────────────────────────────────────
export async function getSocialReport(rangeDays = 30): Promise<SocialReport> {
  const sb = createSupabaseAdminClient();
  const since = new Date(Date.now() - rangeDays * 86400000).toISOString();
  const { data } = await sb.from("social_posts").select("*").gte("created_at", since).limit(2000);
  const posts = (data ?? []) as unknown as SocialPost[];

  const published = posts.filter((p) => p.status === "published");
  const byPlatformMap = new Map<string, { published: number; engagement: number }>();
  for (const p of published) {
    const cur = byPlatformMap.get(p.platform) ?? { published: 0, engagement: 0 };
    cur.published += 1; cur.engagement += engagementTotal(p.engagement);
    byPlatformMap.set(p.platform, cur);
  }

  const dayMap = new Map<string, { published: number; engagement: number }>();
  const chartDays = Math.min(rangeDays, 14);
  for (let i = chartDays - 1; i >= 0; i--) dayMap.set(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), { published: 0, engagement: 0 });
  for (const p of published) {
    const day = String(p.published_at ?? p.created_at ?? "").slice(0, 10);
    const cur = dayMap.get(day);
    if (cur) { cur.published += 1; cur.engagement += engagementTotal(p.engagement); }
  }

  const topPosts = [...published]
    .sort((a, b) => engagementTotal(b.engagement) - engagementTotal(a.engagement))
    .slice(0, 8)
    .map((p) => ({ id: p.id, platform: p.platform, body: (p.body_text || "").slice(0, 120), engagement: engagementTotal(p.engagement), url: p.external_url }));

  return {
    rangeDays,
    totals: {
      posts: posts.length,
      published: published.length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      failed: posts.filter((p) => p.status === "failed").length,
      engagement: sumEngagement(published),
    },
    byPlatform: Array.from(byPlatformMap.entries()).map(([platform, v]) => ({ platform, ...v })).sort((a, b) => b.published - a.published),
    daily: Array.from(dayMap.entries()).map(([date, v]) => ({ date: date.slice(5), ...v })),
    topPosts,
  };
}

// ── Dashboard aggregate ──────────────────────────────────────────────────────
export async function getSocialDashboardData(): Promise<SocialDashboardData> {
  const [accounts, { templates, automations }, posts, messages] = await Promise.all([
    listAccounts(), getSocialTemplateData(), listPosts({ limit: 500 }), listMessages({ limit: 500 }),
  ]);

  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const stats: SocialStats = {
    connectedAccounts: accounts.filter((a) => a.status === "connected" && a.is_active).length,
    scheduledPosts: posts.filter((p) => p.status === "scheduled").length,
    publishedThisWeek: posts.filter((p) => p.status === "published" && (p.published_at ?? "") >= weekAgo).length,
    unreadInbox: messages.filter((m) => m.status === "new").length,
    totalEngagement: engagementTotal(sumEngagement(posts.filter((p) => p.status === "published"))),
  };

  return { accounts, templates, posts, messages, automations, stats };
}

export { composePostText };
