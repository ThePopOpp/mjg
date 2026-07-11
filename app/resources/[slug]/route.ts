import { notFound } from "next/navigation";
import { getPublishedPostBySlug, normalizePostTags } from "@/lib/content/blog";
import { publicSiteUrl, renderFaviconLinks, renderFonts, renderNavScript, renderNavStyles, renderSiteHeader, renderThemeScript } from "@/lib/public-site/static-pages";

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
  ${renderFaviconLinks()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ${renderNavStyles()}
    /* Page tokens */
    :root { --paper:#fbfaf7; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --green:#c9aa70; --card:#fff; }
    [data-theme="dark"] { --paper:#10110f; --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --card:#151713; }
    body { background:var(--paper); color:var(--ink); font-family:var(--font-body); line-height:1.6; }
    main { width:min(1180px, calc(100% - 40px)); margin:0 auto; }
    article { max-width:800px; margin:0 auto; padding:70px 0 100px; }
    .meta { color:var(--gold); font-size:13px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; margin-bottom:18px; }
    h1 { font-family:var(--font-display); font-size:clamp(46px, 8vw, 86px); line-height:.95; margin-bottom:18px; }
    .excerpt { color:var(--muted); font-size:21px; line-height:1.65; margin-bottom:34px; }
    .featured { width:100%; border-radius:8px; margin:34px 0; display:block; }
    .content { font-size:19px; line-height:1.8; color:var(--ink); }
    .content img { max-width:100%; border-radius:8px; }
    .content a { color:var(--green); }
    .video-link { margin:24px 0; }
    .video-link a { color:var(--green); font-weight:700; text-decoration:none; }
    .tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:32px; }
    .tag { border:1px solid var(--line); border-radius:999px; padding:6px 11px; color:var(--muted); font-size:13px; }
    .gallery { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; margin-top:34px; }
    .gallery img { width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:8px; }
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
      ${post.video_url ? `<p class="video-link"><a href="${escapeHtml(post.video_url)}">Watch related video</a></p>` : ""}
      <div class="content">${post.content_html}</div>
      ${post.gallery_urls?.length ? `<div class="gallery">${post.gallery_urls.map((url: string) => `<img src="${escapeHtml(url)}" alt="" />`).join("")}</div>` : ""}
      <div class="tags">${tags.map((tag: any) => `<span class="tag">${escapeHtml(tag.name)}</span>`).join("")}</div>
    </article>
  </main>
  ${renderNavScript()}
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
