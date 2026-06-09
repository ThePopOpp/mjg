import { notFound } from "next/navigation";
import { getPublishedPostBySlug, normalizePostTags } from "@/lib/content/blog";
import { publicSiteUrl, renderSiteHeader, renderThemeScript } from "@/lib/public-site/static-pages";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  return new Response(renderPost(post as any), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function renderPost(post: any) {
  const siteUrl = publicSiteUrl();
  const tags = normalizePostTags(post);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(post.title)} | Michael J. Gauthier</title>
  ${renderThemeScript()}
  <style>
    :root { color-scheme: light dark; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --gold:#c9a96d; --green:#315f43; --paper:#fbfaf7; --card:#fff; }
    [data-theme="dark"] { --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --paper:#10110f; --card:#151713; }
    @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --paper:#10110f; --card:#151713; } }
    * { box-sizing:border-box; }
    body { margin:0; background:var(--paper); color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header, main { width:min(1180px, calc(100% - 40px)); margin:0 auto; }
    header { display:flex; align-items:center; justify-content:space-between; padding:28px 0; border-bottom:1px solid var(--line); gap:16px; }
    .brand { display:flex; align-items:baseline; gap:14px; text-decoration:none; color:var(--ink); flex-shrink:0; }
    .brand strong { font-size:42px; font-weight:950; letter-spacing:-.05em; }
    .brand span { font-family:Georgia,serif; font-style:italic; font-weight:700; }
    nav { display:flex; align-items:center; gap:22px; flex-wrap:wrap; }
    nav a { color:var(--ink); text-decoration:none; font-weight:650; white-space:nowrap; font-size:15px; }
    .cta { background:var(--ink); color:var(--paper) !important; padding:11px 16px; border-radius:6px; font-weight:700 !important; }
    .theme-toggle { background:none; border:1px solid var(--line); border-radius:6px; cursor:pointer; color:var(--ink); padding:7px; display:flex; align-items:center; justify-content:center; }
    [data-theme="dark"] .icon-sun, :root:not([data-theme="light"]) .icon-sun { display:none; }
    [data-theme="light"] .icon-moon { display:none; }
    [data-theme="dark"] .icon-moon, :root:not([data-theme="light"]) .icon-moon { display:block; }
    @media (prefers-color-scheme: light) { :root:not([data-theme="dark"]) .icon-sun { display:none; } :root:not([data-theme="dark"]) .icon-moon { display:block; } }
    article { padding:70px 0 100px; max-width:800px; margin:0 auto; }
    .meta { color:var(--gold); font-size:13px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }
    h1 { font-family:Georgia,serif; font-size:clamp(46px, 8vw, 86px); line-height:.95; margin:18px 0; }
    .excerpt { color:var(--muted); font-size:21px; line-height:1.65; }
    .featured { width:100%; border-radius:8px; margin:34px 0; }
    .content { font-size:19px; line-height:1.8; color:var(--ink); }
    .content img { max-width:100%; border-radius:8px; }
    .tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:32px; }
    .tag { border:1px solid var(--line); border-radius:999px; padding:6px 11px; color:var(--muted); font-size:13px; }
    .gallery { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; margin-top:34px; }
    .gallery img { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:8px; }
    @media (max-width: 700px) { nav a:not(.cta) { display:none; } }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}
  <main>
    <article>
      <div class="meta">${escapeHtml(post.category?.name ?? "Resource")} · ${post.publish_at ? new Date(post.publish_at).toLocaleDateString() : ""}</div>
      <h1>${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p class="excerpt">${escapeHtml(post.excerpt)}</p>` : ""}
      ${post.featured_image_url ? `<img class="featured" src="${escapeHtml(post.featured_image_url)}" alt="" />` : ""}
      ${post.video_url ? `<p><a href="${escapeHtml(post.video_url)}" style="color:var(--green);font-weight:700;">Watch related video</a></p>` : ""}
      <div class="content">${post.content_html}</div>
      ${post.gallery_urls?.length ? `<div class="gallery">${post.gallery_urls.map((url: string) => `<img src="${escapeHtml(url)}" alt="" />`).join("")}</div>` : ""}
      <div class="tags">${tags.map((tag: any) => `<span class="tag">${escapeHtml(tag.name)}</span>`).join("")}</div>
    </article>
  </main>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
