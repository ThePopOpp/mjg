import { saveEmailTemplate } from "@/lib/email/templates";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type BlogPostStatus = "draft" | "scheduled" | "published" | "hidden" | "archived" | "deleted";

export type BlogPostInput = {
  id?: string;
  title: string;
  slug?: string;
  excerpt?: string;
  contentHtml: string;
  contentText?: string;
  authorName?: string;
  category?: string;
  tags?: string[];
  featuredImageUrl?: string;
  galleryUrls?: string[];
  videoUrl?: string;
  status: BlogPostStatus;
  publishAt?: string;
  actorUserId?: string;
};

export async function getBlogAdminData() {
  const supabase = createSupabaseAdminClient();
  const [posts, categories, tags] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("*, category:blog_post_categories(name,slug), tags:blog_post_tag_links(blog_post_tags(id,name,slug))")
      .neq("status", "deleted")
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase.from("blog_post_categories").select("*").order("name", { ascending: true }),
    supabase.from("blog_post_tags").select("*").order("name", { ascending: true }),
  ]);

  return {
    posts: posts.data ?? [],
    categories: categories.data ?? [],
    tags: tags.data ?? [],
    error: posts.error?.message ?? categories.error?.message ?? tags.error?.message ?? null,
  };
}

export async function getBlogPostById(id: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_post_categories(name,slug), tags:blog_post_tag_links(blog_post_tags(id,name,slug)), media:blog_post_media(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPublishedPosts() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_post_categories(name,slug), tags:blog_post_tag_links(blog_post_tags(id,name,slug))")
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
    .order("publish_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedPostBySlug(slug: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, category:blog_post_categories(name,slug), tags:blog_post_tag_links(blog_post_tags(id,name,slug)), media:blog_post_media(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveBlogPost(input: BlogPostInput) {
  const supabase = createSupabaseAdminClient();
  const slug = slugify(input.slug || input.title);
  const categoryId = await ensureCategory(input.category);
  const now = new Date().toISOString();
  const status = input.status || "draft";

  const payload = {
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt?.trim() || null,
    content_html: input.contentHtml || "",
    content_text: input.contentText || stripHtml(input.contentHtml),
    author_name: input.authorName?.trim() || "Michael J. Gauthier",
    category_id: categoryId,
    featured_image_url: input.featuredImageUrl?.trim() || null,
    gallery_urls: input.galleryUrls?.filter(Boolean) ?? [],
    video_url: input.videoUrl?.trim() || null,
    status,
    publish_at: input.publishAt || null,
    deployed_at: status === "published" ? now : null,
    hidden_at: status === "hidden" ? now : null,
    archived_at: status === "archived" ? now : null,
    updated_by: input.actorUserId ?? null,
    updated_at: now,
  };

  const query = input.id
    ? supabase.from("blog_posts").update(payload).eq("id", input.id)
    : supabase.from("blog_posts").insert({ ...payload, created_by: input.actorUserId ?? null });

  const { data, error } = await query.select("*").single();
  if (error) throw error;

  await syncPostTags(data.id, input.tags ?? []);
  return data;
}

export async function updateBlogPostStatus(input: { id: string; status: BlogPostStatus; actorUserId?: string }) {
  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .update({
      status: input.status,
      deployed_at: input.status === "published" ? now : undefined,
      hidden_at: input.status === "hidden" ? now : undefined,
      archived_at: input.status === "archived" ? now : undefined,
      deleted_at: input.status === "deleted" ? now : undefined,
      updated_by: input.actorUserId ?? null,
      updated_at: now,
    })
    .eq("id", input.id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function convertPostToEmailTemplate(input: { id: string; actorUserId?: string }) {
  const post = await getBlogPostById(input.id);
  if (!post) throw new Error("Blog post not found.");

  const siteUrl = publicSiteUrl();
  const postUrl = `${siteUrl}/resources/${post.slug}`;
  const htmlBody = `
    <div style="font-family:Arial,sans-serif;line-height:1.65;color:#111;max-width:680px;margin:0 auto;padding:28px;">
      ${post.featured_image_url ? `<img src="${escapeHtml(post.featured_image_url)}" alt="" style="width:100%;height:auto;border-radius:8px;margin-bottom:24px;" />` : ""}
      <p style="text-transform:uppercase;letter-spacing:.14em;color:#c9a96d;font-size:12px;font-weight:700;">Michael J. Gauthier</p>
      <h1 style="font-family:Georgia,serif;font-size:36px;line-height:1.1;margin:8px 0 16px;">${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p style="font-size:18px;color:#5f6d66;">${escapeHtml(post.excerpt)}</p>` : ""}
      <div>${post.content_html}</div>
      <p style="margin-top:28px;"><a href="${postUrl}" style="display:inline-block;background:#111111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">Read the full post</a></p>
    </div>
  `;

  const template = await saveEmailTemplate({
    id: post.linked_email_template_id ?? undefined,
    name: `${post.title} Email`,
    slug: `blog-${post.slug}`,
    subject: post.title,
    preheader: post.excerpt ?? undefined,
    htmlBody,
    textBody: post.content_text || stripHtml(post.content_html),
    category: "blog_posts",
    status: post.status === "published" ? "active" : "draft",
    actorUserId: input.actorUserId,
  });

  const supabase = createSupabaseAdminClient();
  await supabase.from("blog_posts").update({ linked_email_template_id: template.id, updated_at: new Date().toISOString() }).eq("id", post.id);
  return template;
}

async function ensureCategory(name?: string) {
  const cleanName = name?.trim();
  if (!cleanName) return null;
  const supabase = createSupabaseAdminClient();
  const slug = slugify(cleanName);
  const { data, error } = await supabase
    .from("blog_post_categories")
    .upsert({ name: cleanName, slug, updated_at: new Date().toISOString() }, { onConflict: "slug" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function syncPostTags(postId: string, tagNames: string[]) {
  const clean = Array.from(new Set(tagNames.map((tag) => tag.trim()).filter(Boolean)));
  const supabase = createSupabaseAdminClient();
  await supabase.from("blog_post_tag_links").delete().eq("post_id", postId);
  if (!clean.length) return;

  const rows = clean.map((name) => ({ name, slug: slugify(name) }));
  const { data: tags, error } = await supabase.from("blog_post_tags").upsert(rows, { onConflict: "slug" }).select("id");
  if (error) throw error;
  await supabase.from("blog_post_tag_links").insert((tags ?? []).map((tag) => ({ post_id: postId, tag_id: tag.id })));
}

export function normalizePostTags(post: any) {
  return (post.tags ?? [])
    .map((link: any) => link.blog_post_tags)
    .filter(Boolean);
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
