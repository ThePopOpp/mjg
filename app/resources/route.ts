import { getPublishedPosts, normalizePostTags } from "@/lib/content/blog";
import { publicSiteUrl, renderStaticPage } from "@/lib/public-site/static-pages";

export async function GET() {
  const posts = await getPublishedPosts();
  if (!posts.length) return renderStaticPage("resources.html");

  const siteUrl = publicSiteUrl();
  return new Response(renderArchive(posts as any[], siteUrl), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function renderArchive(posts: any[], siteUrl: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resources | Michael J. Gauthier</title>
  <style>
    :root { color-scheme: light dark; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --gold:#c9a96d; --green:#315f43; --paper:#fbfaf7; --card:#fff; }
    @media (prefers-color-scheme: dark) { :root { --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --paper:#10110f; --card:#151713; } }
    * { box-sizing:border-box; }
    body { margin:0; background:var(--paper); color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    header, main { width:min(1180px, calc(100% - 40px)); margin:0 auto; }
    header { display:flex; align-items:center; justify-content:space-between; padding:28px 0; border-bottom:1px solid var(--line); }
    .brand { display:flex; align-items:baseline; gap:14px; text-decoration:none; color:var(--ink); }
    .brand strong { font-size:42px; font-weight:950; letter-spacing:-.05em; }
    .brand span { font-family:Georgia,serif; font-style:italic; font-weight:700; }
    nav { display:flex; align-items:center; gap:26px; }
    nav a { color:var(--ink); text-decoration:none; font-weight:650; }
    .cta { background:var(--ink); color:var(--paper); padding:13px 18px; border-radius:6px; }
    .hero { padding:80px 0 44px; text-align:center; }
    .eyebrow { color:var(--gold); font-weight:800; letter-spacing:.16em; text-transform:uppercase; font-size:13px; }
    h1 { font-family:Georgia,serif; font-size:clamp(48px, 9vw, 90px); line-height:.95; margin:18px 0; }
    .hero p { color:var(--muted); font-size:20px; max-width:700px; margin:0 auto; line-height:1.7; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:22px; padding:28px 0 90px; }
    article { border:1px solid var(--line); background:var(--card); border-radius:8px; overflow:hidden; }
    article img { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; }
    .body { padding:22px; }
    .meta { color:var(--gold); font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
    h2 { font-family:Georgia,serif; font-size:30px; line-height:1.1; margin:12px 0; }
    p { color:var(--muted); line-height:1.65; }
    .tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
    .tag { border:1px solid var(--line); border-radius:999px; padding:5px 10px; color:var(--muted); font-size:12px; }
    .read { display:inline-flex; margin-top:18px; color:var(--green); font-weight:800; text-decoration:none; }
  </style>
</head>
<body>
  <header>
    <a class="brand" href="${siteUrl}/"><strong>MJG</strong><span>Michael J. Gauthier</span></a>
    <nav>
      <a href="${siteUrl}/about">About</a>
      <a href="${siteUrl}/mission">Mission</a>
      <a href="${siteUrl}/resources">Resources</a>
      <a href="${siteUrl}/contact">Contact</a>
      <a class="cta" href="${siteUrl}/#join">Join the Journey</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <div class="eyebrow">Resources</div>
      <h1>The Stewardship Blueprint</h1>
      <p>Reflections, resources, and practical next steps for living with intention across faith, family, fitness, finances, and meaningful experiences.</p>
    </section>
    <section class="grid">
      ${posts.map((post) => renderCard(post, siteUrl)).join("")}
    </section>
  </main>
</body>
</html>`;
}

function renderCard(post: any, siteUrl: string) {
  const tags = normalizePostTags(post);
  return `<article>
    ${post.featured_image_url ? `<img src="${escapeHtml(post.featured_image_url)}" alt="" />` : ""}
    <div class="body">
      <div class="meta">${escapeHtml(post.category?.name ?? "Resource")}</div>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.excerpt || "")}</p>
      <div class="tags">${tags.map((tag: any) => `<span class="tag">${escapeHtml(tag.name)}</span>`).join("")}</div>
      <a class="read" href="${siteUrl}/resources/${post.slug}">Read post →</a>
    </div>
  </article>`;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
