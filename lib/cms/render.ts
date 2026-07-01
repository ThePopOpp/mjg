// CMS server-side renderer: a block tree → branded, full HTML document using the
// same public-site chrome as the blog/resource pages. Used by the draft-preview
// route now, and by the public /p/<slug> route after publishing (Phase 3).

import {
  publicSiteUrl, renderFaviconLinks, renderFonts, renderNavScript, renderNavStyles,
  renderSiteHeader, renderThemeScript,
} from "@/lib/public-site/static-pages";
import { escHtml as esc, mdToHtml } from "./md";
import { blockPad, type CmsBlock } from "./types";

function band(b: CmsBlock, innerHtml: string): string {
  const sec: string[] = [];
  if (b.bgColor) sec.push(`background:${esc(b.bgColor)}`);
  sec.push(`padding:${blockPad(b, "top")}px ${b.padX ?? 20}px ${blockPad(b, "bottom")}px`);
  if (b.marginTop) sec.push(`margin-top:${b.marginTop}px`);
  if (b.marginBottom) sec.push(`margin-bottom:${b.marginBottom}px`);
  const inner: string[] = ["width:min(1180px,calc(100% - 40px))", "margin:0 auto"];
  if (b.maxWidth && b.maxWidth > 0) inner.push(`max-width:${b.maxWidth}px`);
  if (b.align) inner.push(`text-align:${b.align}`);
  if (b.textColor) inner.push(`color:${esc(b.textColor)}`);
  return `<section style="${sec.join(";")}"><div style="${inner.join(";")}">${innerHtml}</div></section>`;
}

const fs = (b: CmsBlock, fallback: string) => (b.fontSize ? `font-size:${b.fontSize}px` : `font-size:${fallback}`);

export function renderCmsBlock(b: CmsBlock): string {
  if (b.hidden) return "";
  switch (b.type) {
    case "heading":
      return band(b, `<h1 style="font-family:var(--font-display);${fs(b, "clamp(36px,6vw,64px)")};line-height:1.05;margin:0">${esc(b.text || "")}</h1>`);
    case "subheading":
      return band(b, `<h2 style="font-family:var(--font-display);${fs(b, "clamp(22px,3.5vw,34px)")};line-height:1.15;margin:0">${esc(b.text || "")}</h2>`);
    case "paragraph":
      return band(b, `<p style="${fs(b, "18px")};line-height:1.7;margin:0">${esc(b.text || "").replace(/\n/g, "<br/>")}</p>`);
    case "richtext":
      return band(b, `<div style="${fs(b, "18px")};line-height:1.75" class="cms-rt">${mdToHtml(b.text || "")}</div>`);
    case "image":
      return b.url ? band(b, `<img src="${esc(b.url)}" alt="${esc(b.alt || "")}" style="max-width:100%;${b.maxWidth ? `max-width:${b.maxWidth}px;` : ""}${b.height ? `max-height:${b.height}px;` : ""}border-radius:${b.radius ?? 8}px;display:inline-block" />`) : "";
    case "button":
      return b.url ? band(b, `<a href="${esc(b.url)}" style="display:inline-block;background:${esc(b.buttonColor || "var(--green,#315f43)")};color:${esc(b.textColor || "#ffffff")};padding:14px 26px;border-radius:${b.radius ?? 6}px;${fs(b, "16px")};font-weight:700;text-decoration:none">${esc(b.label || "Learn more")}</a>`) : "";
    case "divider":
      return band(b, `<hr style="border:none;border-top:1px solid ${esc(b.textColor || "var(--line,#e4ded2)")};margin:0" />`);
    case "spacer":
      return `<div style="height:${b.height ?? 40}px"></div>`;
    default:
      return "";
  }
}

export function renderCmsPageHtml(page: { title: string }, blocks: CmsBlock[], opts: { draft?: boolean } = {}): string {
  const siteUrl = publicSiteUrl();
  const body = blocks.map(renderCmsBlock).join("\n");
  const draftRibbon = opts.draft
    ? `<div style="position:fixed;top:0;left:0;right:0;z-index:9999;background:#b08949;color:#fff;text-align:center;font:600 12px/1.6 var(--font-body);padding:4px">DRAFT PREVIEW — not published</div>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(page.title)} | Michael J. Gauthier</title>
  ${renderFaviconLinks()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ${renderNavStyles()}
    :root { --paper:#fbfaf7; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --green:#315f43; --card:#fff; }
    [data-theme="dark"] { --paper:#10110f; --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --card:#151713; }
    body { background:var(--paper); color:var(--ink); font-family:var(--font-body); line-height:1.6; }
    .cms-rt a { color:var(--green); }
    .cms-rt ul { padding-left:1.2em; margin:0; }
    .cms-rt p { margin:0 0 14px; }
    img { max-width:100%; }
  </style>
</head>
<body${opts.draft ? ' style="padding-top:26px"' : ""}>
  ${draftRibbon}
  ${renderSiteHeader(siteUrl)}
  <main>
    ${body || `<section style="padding:80px 20px;text-align:center;color:var(--muted)"><p>This page has no content blocks yet.</p></section>`}
  </main>
  ${renderNavScript()}
</body>
</html>`;
}
