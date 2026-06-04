import { notFound } from "next/navigation";
import { getPublishedPostBySlug, normalizePostTags } from "@/lib/content/blog";
import { publicSiteUrl } from "@/lib/public-site/static-pages";

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
  <style>
    :root { color-scheme: light dark; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --gold:#c9a96d; --green:#315f43; --paper:#fbfaf7; --card:#fff; }
    @media (prefers-color-scheme: dark) { :root { --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --paper:#10110f; --card:#151713; } }
    body { margin:0; background:var(--paper); color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header, main { width:min(920px, calc(100% - 40px)); margin:0 auto; }
    header { display:flex; align-items:center; justify-content:space-between; padding:28px 0; border-bottom:1px solid var(--line); }
    .brand { display:flex; align-items:baseline; gap:14px; text-decoration:none; color:var(--ink); }
    .brand strong { font-size:42px; font-weight:950; letter-spacing:-.05em; }
    .brand span { font-family:Georgia,serif; font-style:italic; font-weight:700; }
    nav { display:flex; gap:22px; }
    nav a { color:var(--ink); text-decoration:none; font-weight:650; }
    article { padding:70px 0 100px; }
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
  </style>
</head>
<body>
  <header>
    <a class="brand" href="${siteUrl}/"><strong>MJG</strong><span>Michael J. Gauthier</span></a>
    <nav>
      <a href="${siteUrl}/resources">Resources</a>
      <a href="${siteUrl}/contact">Contact</a>
    </nav>
  </header>
  <main>
    <article>
      <div class="meta">${escapeHtml(post.category?.name ?? "Resource")} · ${post.publish_at ? new Date(post.publish_at).toLocaleDateString() : ""}</div>
      <h1>${escapeHtml(post.title)}</h1>
      ${post.excerpt ? `<p class="excerpt">${escapeHtml(post.excerpt)}</p>` : ""}
      ${post.featured_image_url ? `<img class="featured" src="${escapeHtml(post.featured_image_url)}" alt="" />` : ""}
      ${post.video_url ? `<p><a href="${escapeHtml(post.video_url)}">Watch related video</a></p>` : ""}
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
