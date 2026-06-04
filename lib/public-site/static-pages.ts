import { readFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const DEFAULT_SITE_URL = "https://my.michaeljgauthier.com";

const STATIC_ROUTES: Record<string, string> = {
  "index.html": "/",
  "about-us.html": "/about",
  "contact.html": "/contact",
  "resources.html": "/resources",
  "post.html": "/post",
  "join-the-movement.html": "/join-the-movement",
  "created-for-more.html": "/created-for-more",
};

export function publicSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function renderStaticPage(fileName: string) {
  const filePath = path.join(process.cwd(), "main", fileName);
  const html = transformStaticHtml(readFileSync(filePath, "utf8"));

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

export function renderGeneratedPage(input: { title: string; eyebrow: string; body: string; ctaLabel?: string; ctaHref?: string }) {
  const siteUrl = publicSiteUrl();
  return new NextResponse(
    `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(input.title)} | Michael J. Gauthier</title>
  <style>
    :root { color-scheme: light dark; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --gold:#c9a96d; --green:#315f43; --paper:#fbfaf7; }
    @media (prefers-color-scheme: dark) { :root { --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --paper:#10110f; } }
    body { margin:0; background:var(--paper); color:var(--ink); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { min-height:100vh; display:grid; place-items:center; padding:48px 20px; background-image:linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size:80px 80px; }
    section { width:min(780px, 100%); text-align:center; }
    .logo { font-size:56px; font-weight:900; letter-spacing:-.04em; margin-bottom:8px; }
    .script { font-family:Georgia, serif; font-style:italic; font-weight:700; margin-bottom:72px; }
    .eyebrow { display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:8px 18px; color:var(--gold); font-weight:800; letter-spacing:.16em; text-transform:uppercase; font-size:13px; }
    h1 { font-family:Georgia, serif; font-size:clamp(44px, 8vw, 84px); line-height:.95; margin:28px 0 20px; }
    p { color:var(--muted); font-size:20px; line-height:1.7; margin:0 auto; max-width:680px; }
    a { display:inline-flex; margin-top:36px; background:var(--ink); color:var(--paper); border-radius:6px; padding:16px 24px; text-decoration:none; font-weight:800; }
  </style>
</head>
<body>
  <main>
    <section>
      <div class="logo">MJG</div>
      <div class="script">Michael J. Gauthier</div>
      <div class="eyebrow">${escapeHtml(input.eyebrow)}</div>
      <h1>${escapeHtml(input.title)}</h1>
      <p>${escapeHtml(input.body)}</p>
      ${input.ctaLabel && input.ctaHref ? `<a href="${escapeHtml(input.ctaHref.startsWith("http") ? input.ctaHref : `${siteUrl}${input.ctaHref}`)}">${escapeHtml(input.ctaLabel)}</a>` : ""}
    </section>
  </main>
</body>
</html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function transformStaticHtml(html: string) {
  const siteUrl = publicSiteUrl();
  let output = html
    .replaceAll("https://blueprint.michaeljgauthier.com", siteUrl)
    .replace(/https:\/\/michaeljgauthier\.com\/login\/?/g, `${siteUrl}/login`)
    .replace(/https:\/\/michaeljgauthier\.com\/register\/?/g, `${siteUrl}/#join`)
    .replace(
      /const FLUENT_CRM_ENDPOINT = 'https:\/\/michaeljgauthier\.com\/\?fluentcrm=1&route=contact&hash=[^']+';/g,
      "const FLUENT_CRM_ENDPOINT = '/api/public/join-journey';",
    )
    .replace(
      /var FLUENT_CRM_URL = 'https:\/\/michaeljgauthier\.com\/\?fluentcrm=1&route=contact&hash=[^']+';/g,
      "var FLUENT_CRM_URL = '/api/public/join-journey';",
    )
    .replace("const POST_PAGE = 'post.html';", "const POST_PAGE = '/post';");

  for (const [fileName, route] of Object.entries(STATIC_ROUTES)) {
    const absolute = `${siteUrl}${route === "/" ? "/" : route}`;
    output = output
      .replace(new RegExp(`href="${escapeRegExp(fileName)}"`, "g"), `href="${absolute}"`)
      .replace(new RegExp(`href='${escapeRegExp(fileName)}'`, "g"), `href='${absolute}'`);
  }

  return output;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
