// CMS server-side renderer: a block tree → branded, full HTML document using the
// same public-site chrome as the blog/resource pages. Used by the draft-preview
// route now, and by the public /p/<slug> route after publishing (Phase 3).

import {
  publicSiteUrl, renderFaviconLinks, renderFonts, renderNavScript, renderNavStyles,
  renderSiteHeader, renderThemeScript,
} from "@/lib/public-site/static-pages";
import { escHtml as esc, mdToHtml, sanitizeHtml, styleToCss, typoStyle, videoEmbedSrc } from "./md";
import { fontLinksHtml } from "./fonts";
import { blockPad, type CmsBlock } from "./types";

// Extra typography CSS (font family/weight/style/transform/spacing/shadow) appended
// LAST so an author's font choice wins over the block's default font-family.
function ts(b: CmsBlock): string {
  const css = styleToCss(typoStyle(b));
  return css ? `;${css}` : "";
}

function band(b: CmsBlock, innerHtml: string): string {
  const sec: string[] = [];
  if (b.bgColor) sec.push(`background:${esc(b.bgColor)}`);
  if (b.bgImage) sec.push(`background-image:url('${esc(b.bgImage)}')`, "background-size:cover", "background-position:center");
  sec.push(`padding:${blockPad(b, "top")}px ${b.padX ?? 20}px ${blockPad(b, "bottom")}px`);
  if (b.marginTop) sec.push(`margin-top:${b.marginTop}px`);
  if (b.marginBottom) sec.push(`margin-bottom:${b.marginBottom}px`);
  if (b.minHeight) sec.push(`min-height:${b.minHeight}px`, "display:flex", "align-items:center");
  if (b.borderWidth) sec.push(`border:${b.borderWidth}px ${b.borderStyle || "solid"} ${esc(b.borderColor || "#e4ded2")}`);
  if (b.boxShadow) sec.push(`box-shadow:${esc(b.boxShadow)}`);
  if ((b.borderWidth || b.boxShadow) && b.radius) sec.push(`border-radius:${b.radius}px`);
  const inner: string[] = ["width:min(1180px,calc(100% - 40px))", "margin:0 auto"];
  if (b.minHeight) inner.push("width:100%");
  if (b.maxWidth && b.maxWidth > 0) inner.push(`max-width:${b.maxWidth}px`);
  if (b.align) inner.push(`text-align:${b.align}`);
  if (b.textColor) inner.push(`color:${esc(b.textColor)}`);
  return `<section style="${sec.join(";")}"><div style="${inner.join(";")}">${innerHtml}</div></section>`;
}

const fs = (b: CmsBlock, fallback: string) => (b.fontSize ? `font-size:${b.fontSize}px` : `font-size:${fallback}`);

const ALERT_COLORS: Record<string, { bg: string; border: string; fg: string }> = {
  info: { bg: "#eef4fb", border: "#b7d3f0", fg: "#1e4e79" },
  success: { bg: "#edf7ef", border: "#b7e0bf", fg: "#1e6b34" },
  warning: { bg: "#fdf6e8", border: "#efd9a3", fg: "#8a6212" },
  error: { bg: "#fcecec", border: "#f0b7b7", fg: "#8a1e1e" },
};

function overlayRgba(b: CmsBlock): string {
  const hex = (b.overlay || "#000000").replace("#", "");
  const n = parseInt(hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, bl = n & 255;
  const a = Math.max(0, Math.min(100, b.overlayOpacity ?? 40)) / 100;
  return `rgba(${r},${g},${bl},${a})`;
}

const FIELD_TYPES = new Set(["text", "email", "phone", "number", "date", "textarea", "select", "checkbox"]);

export function renderCmsBlock(b: CmsBlock): string {
  if (b.hidden) return "";
  switch (b.type) {
    case "heading":
      return band(b, `<h1 style="font-family:var(--font-display);${fs(b, "clamp(36px,6vw,64px)")};line-height:1.05;margin:0${ts(b)}">${esc(b.text || "")}</h1>`);
    case "subheading":
      return band(b, `<h2 style="font-family:var(--font-display);${fs(b, "clamp(22px,3.5vw,34px)")};line-height:1.15;margin:0${ts(b)}">${esc(b.text || "")}</h2>`);
    case "paragraph":
      return band(b, `<p style="${fs(b, "18px")};line-height:1.7;margin:0${ts(b)}">${esc(b.text || "").replace(/\n/g, "<br/>")}</p>`);
    case "richtext":
      return band(b, `<div style="${fs(b, "18px")};line-height:1.75${ts(b)}" class="cms-rt">${mdToHtml(b.text || "")}</div>`);
    case "image":
      return b.url ? band(b, `<img src="${esc(b.url)}" alt="${esc(b.alt || "")}" style="max-width:100%;${b.maxWidth ? `max-width:${b.maxWidth}px;` : ""}${b.height ? `max-height:${b.height}px;` : ""}border-radius:${b.radius ?? 8}px;display:inline-block" />`) : "";
    case "button":
      return b.url ? band(b, buttonHtml(b, b.label || "Learn more", b.url, true)) : "";
    case "divider":
      return band(b, `<hr style="border:none;border-top:${b.borderWidth ?? 1}px ${b.borderStyle || "solid"} ${esc(b.borderColor || b.textColor || "var(--line,#e4ded2)")};margin:0" />`);
    case "spacer":
      return `<div style="height:${b.height ?? 40}px"></div>`;
    case "cta": {
      return band(b, `${b.eyebrow ? `<div style="color:var(--gold,#c9a46e);font-weight:800;letter-spacing:.14em;text-transform:uppercase;font-size:13px;margin-bottom:12px">${esc(b.eyebrow)}</div>` : ""}<h2 style="font-family:var(--font-display);${fs(b, "clamp(28px,4vw,44px)")};line-height:1.1;margin:0 0 12px${ts(b)}">${esc(b.text || "")}</h2>${b.subtext ? `<p style="font-size:18px;line-height:1.6;color:var(--muted,#5f6d66);margin:0 0 20px">${esc(b.subtext)}</p>` : ""}<div>${buttonHtml(b, b.label, b.url, true)}${buttonHtml(b, b.label2, b.url2, false)}</div>`);
    }
    case "hero": {
      const bg = b.bgImage
        ? `background-image:linear-gradient(${overlayRgba(b)},${overlayRgba(b)}),url('${esc(b.bgImage)}');background-size:cover;background-position:center`
        : (b.bgColor ? `background:${esc(b.bgColor)}` : "background:var(--green,#315f43)");
      const fg = b.textColor || "#ffffff";
      const inner = [`width:min(1180px,calc(100% - 40px))`, "margin:0 auto", `color:${esc(fg)}`, `text-align:${b.align || "center"}`];
      if (b.maxWidth && b.maxWidth > 0) inner.push(`max-width:${b.maxWidth}px`);
      return `<section style="${bg};padding:${blockPad(b, "top")}px 20px ${blockPad(b, "bottom")}px;min-height:${b.minHeight ?? 420}px;display:flex;align-items:center${b.marginTop ? `;margin-top:${b.marginTop}px` : ""}${b.marginBottom ? `;margin-bottom:${b.marginBottom}px` : ""}"><div style="${inner.join(";")}">${b.eyebrow ? `<div style="font-weight:800;letter-spacing:.16em;text-transform:uppercase;font-size:13px;margin-bottom:16px;opacity:.9">${esc(b.eyebrow)}</div>` : ""}<h1 style="font-family:var(--font-display);${fs(b, "clamp(38px,6vw,72px)")};line-height:1.03;margin:0 0 16px${ts(b)}">${esc(b.text || "")}</h1>${b.subtext ? `<p style="font-size:clamp(17px,2vw,21px);line-height:1.6;margin:0 auto 26px;max-width:640px;opacity:.95">${esc(b.subtext)}</p>` : ""}<div>${buttonHtml(b, b.label, b.url, true)}${buttonHtml(b, b.label2, b.url2, false)}</div></div></section>`;
    }
    case "quote":
      return band(b, `<blockquote style="font-family:var(--font-display);${fs(b, "clamp(22px,3vw,32px)")};line-height:1.35;margin:0${ts(b)}">“${esc(b.text || "")}”</blockquote>${(b.author || b.role) ? `<div style="margin-top:16px;font-size:15px;color:var(--muted,#5f6d66)">${esc(b.author || "")}${b.role ? `<span style="opacity:.8"> · ${esc(b.role)}</span>` : ""}</div>` : ""}`);
    case "scripture":
      return band(b, `<div style="border-left:3px solid ${esc(b.buttonColor || "var(--gold,#c9a46e)")};padding-left:22px">${b.author ? `<div style="font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:12px;color:var(--gold,#c9a46e);margin-bottom:10px">${esc(b.author)}${b.role ? ` · ${esc(b.role)}` : ""}</div>` : ""}<p style="font-family:var(--font-display);${fs(b, "clamp(20px,3vw,30px)")};line-height:1.4;margin:0${ts(b)}">${esc(b.text || "")}</p>${b.subtext ? `<p style="font-size:16px;line-height:1.7;color:var(--muted,#5f6d66);margin:16px 0 0">${esc(b.subtext)}</p>` : ""}</div>`);
    case "alert": {
      const c = ALERT_COLORS[b.variant || "info"] || ALERT_COLORS.info;
      return band(b, `<div style="background:${b.bgColor || c.bg};border:1px solid ${c.border};border-left:4px solid ${c.fg};border-radius:${b.radius ?? 10}px;padding:16px 18px;text-align:left">${b.text ? `<div style="font-weight:700;color:${c.fg};margin-bottom:4px">${esc(b.text)}</div>` : ""}${b.subtext ? `<div style="font-size:15px;line-height:1.6;color:#3a3a3a">${esc(b.subtext)}</div>` : ""}</div>`);
    }
    case "list": {
      const style = b.variant || "check";
      const tag = style === "number" ? "ol" : "ul";
      const items = (b.items || []).map((it) => {
        const mark = style === "check" ? `<span style="color:var(--green,#315f43);margin-right:10px;font-weight:800">✓</span>` : "";
        return `<li style="${style === "check" ? "list-style:none;" : ""}margin:0 0 10px;line-height:1.6;${fs(b, "17px")}">${mark}${esc(it.title || "")}</li>`;
      }).join("");
      return band(b, `<${tag} style="margin:0;padding:${style === "check" ? "0" : "0 0 0 1.2em"}${ts(b)}">${items}</${tag}>`);
    }
    case "statgrid": {
      const cols = Math.max(1, Math.min(4, b.columns || 3));
      const cells = (b.items || []).map((it) => `<div style="text-align:center"><div style="font-family:var(--font-display);font-size:clamp(32px,5vw,52px);line-height:1;color:${esc(b.textColor || "var(--green,#315f43)")}">${esc(it.title || "")}</div><div style="font-size:14px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted,#5f6d66);margin-top:8px">${esc(it.body || "")}</div></div>`).join("");
      return band(b, `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${b.gap ?? 24}px">${cells}</div>`);
    }
    case "gallery": {
      const cols = Math.max(1, Math.min(4, b.columns || 3));
      const cells = (b.items || []).map((it) => it.imageUrl ? `<figure style="margin:0"><img src="${esc(it.imageUrl)}" alt="${esc(it.title || "")}" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:${b.radius ?? 10}px;display:block" />${it.title ? `<figcaption style="font-size:13px;color:var(--muted,#5f6d66);margin-top:6px">${esc(it.title)}</figcaption>` : ""}</figure>` : "").join("");
      return band(b, `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${b.gap ?? 12}px">${cells}</div>`);
    }
    case "cardgrid": {
      const cols = Math.max(1, Math.min(4, b.columns || 3));
      const cards = (b.items || []).map((it) => `<div style="background:var(--card,#fff);border:1px solid var(--line,#e4ded2);border-radius:${b.radius ?? 12}px;overflow:hidden;text-align:left">${it.imageUrl ? `<img src="${esc(it.imageUrl)}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block" />` : ""}<div style="padding:18px">${it.title ? `<div style="font-family:var(--font-display);font-size:20px;margin-bottom:6px">${esc(it.title)}</div>` : ""}${it.body ? `<p style="font-size:15px;line-height:1.6;color:var(--muted,#5f6d66);margin:0">${esc(it.body)}</p>` : ""}${it.url ? `<a href="${esc(it.url)}" style="display:inline-block;margin-top:12px;color:var(--green,#315f43);font-weight:700;text-decoration:none">Learn more →</a>` : ""}</div></div>`).join("");
      return band(b, `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${b.gap ?? 16}px">${cards}</div>`);
    }
    case "resource": {
      return band(b, `<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;background:var(--card,#fff);border:1px solid var(--line,#e4ded2);border-radius:${b.radius ?? 12}px;padding:20px;text-align:left"><div style="flex:1;min-width:220px">${b.role ? `<div style="font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--gold,#c9a46e);margin-bottom:6px">${esc(b.role)}</div>` : ""}<div style="font-family:var(--font-display);font-size:22px;margin-bottom:4px">${esc(b.text || "")}</div>${b.subtext ? `<p style="font-size:14px;line-height:1.6;color:var(--muted,#5f6d66);margin:0">${esc(b.subtext)}</p>` : ""}</div>${b.url ? `<a href="${esc(b.url)}"${b.newTab ? ' target="_blank" rel="noopener"' : ""} style="display:inline-block;background:${esc(b.buttonColor || "var(--green,#315f43)")};color:#fff;padding:12px 22px;border-radius:6px;font-weight:700;text-decoration:none">${esc(b.label || "Download")}</a>` : ""}</div>`);
    }
    case "accordion":
      return band(b, (b.items || []).map((it) => `<details style="border:1px solid var(--line,#e4ded2);border-radius:10px;margin-bottom:8px;background:var(--card,#fff)"><summary style="cursor:pointer;padding:14px 16px;font-weight:600;list-style:none">${esc(it.q || "")}</summary><div style="padding:0 16px 16px;color:var(--muted,#5f6d66);line-height:1.6">${esc(it.a || "")}</div></details>`).join(""));
    case "form": {
      const fields = (b.items || []).map((it) => {
        const t = FIELD_TYPES.has(it.fieldType || "") ? it.fieldType! : "text";
        const label = `<label style="display:block;font-size:13px;font-weight:600;margin:0 0 6px">${esc(it.title || "")}${it.required ? ' <span style="color:#b04">*</span>' : ""}</label>`;
        let ctrl = "";
        const st = "width:100%;padding:11px 13px;border:1px solid var(--line,#e4ded2);border-radius:8px;font-size:15px;background:#fff";
        if (t === "textarea") ctrl = `<textarea placeholder="${esc(it.placeholder || "")}" rows="4" style="${st}"></textarea>`;
        else if (t === "select") ctrl = `<select style="${st}">${(it.options || "").split(",").map((o) => `<option>${esc(o.trim())}</option>`).join("")}</select>`;
        else if (t === "checkbox") ctrl = `<label style="display:flex;gap:8px;align-items:center;font-size:15px"><input type="checkbox" /> ${esc(it.placeholder || it.title || "")}</label>`;
        else ctrl = `<input type="${t === "phone" ? "tel" : t}" placeholder="${esc(it.placeholder || "")}" style="${st}" />`;
        return `<div style="margin-bottom:16px">${t === "checkbox" ? "" : label}${ctrl}</div>`;
      }).join("");
      return band(b, `<form onsubmit="return false" style="text-align:left;max-width:${b.maxWidth || 560}px;margin:0 auto">${b.text ? `<h2 style="font-family:var(--font-display);font-size:28px;margin:0 0 6px">${esc(b.text)}</h2>` : ""}${b.eyebrow ? `<p style="color:var(--muted,#5f6d66);margin:0 0 20px">${esc(b.eyebrow)}</p>` : ""}${fields}<button type="submit" style="background:${esc(b.buttonColor || "var(--green,#315f43)")};color:#fff;padding:13px 26px;border:none;border-radius:6px;font-weight:700;font-size:15px;cursor:pointer">${esc(b.label || "Submit")}</button></form>`);
    }
    case "video": {
      const src = b.url ? videoEmbedSrc(b.url) : "";
      if (!src) return "";
      const [aw, ah] = (b.aspect || "16/9").split("/").map(Number);
      const pb = ah && aw ? (ah / aw) * 100 : 56.25;
      return band(b, `<div style="position:relative;width:100%;padding-bottom:${pb}%;border-radius:${b.radius ?? 10}px;overflow:hidden"><iframe src="${esc(src)}" style="position:absolute;inset:0;width:100%;height:100%;border:0" allowfullscreen loading="lazy"></iframe></div>`);
    }
    case "embed": {
      if (b.html) return band(b, sanitizeHtml(b.html));
      if (b.url) return band(b, `<iframe src="${esc(b.url)}" style="width:100%;height:${b.height ?? 480}px;border:0;border-radius:${b.radius ?? 10}px" loading="lazy" allowfullscreen></iframe>`);
      return "";
    }
    case "html":
      return band(b, sanitizeHtml(b.html || ""));
    default:
      return "";
  }
}

function buttonHtml(b: CmsBlock, label: string | undefined, url: string | undefined, primary: boolean): string {
  if (!label) return "";
  const bg = primary ? esc(b.buttonColor || "var(--green,#315f43)") : "transparent";
  const fg = primary ? "#fff" : esc(b.textColor || "var(--green,#315f43)");
  const border = primary ? "none" : "2px solid currentColor";
  const style = `display:inline-block;margin:6px;background:${bg};color:${fg};border:${border};padding:13px 26px;border-radius:${b.radius ?? 6}px;${fs(b, "16px")};font-weight:700;text-decoration:none`;
  const attrs = `${b.newTab ? ' target="_blank" rel="noopener"' : ""}`;
  return url ? `<a href="${esc(url)}"${attrs} style="${style}">${esc(label)}</a>` : `<span style="${style}">${esc(label)}</span>`;
}

function usedFonts(blocks: CmsBlock[]): string[] {
  return Array.from(new Set(blocks.map((b) => b.fontFamily).filter((x): x is string => Boolean(x))));
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
${fontLinksHtml(usedFonts(blocks))}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ${renderNavStyles()}
    :root { --paper:#fbfaf7; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --green:#315f43; --gold:#c9a46e; --card:#fff; }
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
