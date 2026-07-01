// Shared, client-safe helpers (no node deps) used by both the server renderer
// and the live editor canvas so they stay consistent.

export function escHtml(value: string) {
  return String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

// Lightweight, safe rich text: escape first, then a small Markdown subset
// (**bold**, *italic*, [text](url), - lists, blank-line paragraphs, line breaks).
export function mdToHtml(src: string): string {
  const inline = (s: string) =>
    escHtml(s)
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>');
  return String(src ?? "").split(/\n{2,}/).map((block: string) => {
    const lines = block.split("\n");
    if (lines.length && lines.every((l) => /^\s*-\s+/.test(l))) {
      return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*-\s+/, ""))}</li>`).join("")}</ul>`;
    }
    return `<p>${lines.map(inline).join("<br/>")}</p>`;
  }).join("");
}

// Convert a YouTube/Vimeo watch URL to an embeddable src; pass through others.
export function videoEmbedSrc(url: string): string {
  const u = String(url || "").trim();
  const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return u;
}

// Remove <script> tags/handlers from author-provided HTML (HTML block is
// Super-Admin-only, but scripts stay disabled per the block spec).
export function sanitizeHtml(html: string): string {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}
