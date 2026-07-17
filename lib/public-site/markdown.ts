// Minimal markdown → HTML for the legal pages (docs/legal/*.md).
//
// Deliberately narrow: it covers exactly what those documents use — h1–h3, bold,
// italics, links, bullet and numbered lists, hard line breaks (two trailing
// spaces) and paragraphs. No tables, code fences or blockquotes, because the
// source documents contain none. If a legal doc ever grows one of those, this
// needs extending rather than silently dropping it.
//
// Input is escaped before any markdown is applied, so a stray "<" in a document
// renders as text instead of markup.

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function inline(s: string) {
  return (
    s
      // [text](href) — external links open in a new tab.
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text, href) => {
        const external = /^https?:\/\//i.test(href);
        return `<a href="${href}"${external ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
  );
}

export function markdownToHtml(markdown: string): string {
  const lines = escapeHtml(markdown.replace(/\r\n/g, "\n")).split("\n");
  const out: string[] = [];

  let listType: "ul" | "ol" | null = null;
  let paragraph: string[] = [];

  const closeList = () => {
    if (listType) { out.push(`</${listType}>`); listType = null; }
  };
  const flushParagraph = () => {
    if (!paragraph.length) return;
    // Two trailing spaces = hard break (used for the address blocks).
    out.push(`<p>${paragraph.join("<br />")}</p>`);
    paragraph = [];
  };
  const flushAll = () => { flushParagraph(); closeList(); };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const hardBreak = /\s{2,}$/.test(raw);

    if (!line.trim()) { flushAll(); continue; }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(heading[1].length, 6);
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) { flushAll(); out.push("<hr />"); continue; }

    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) {
      flushParagraph();
      if (listType !== "ul") { closeList(); out.push("<ul>"); listType = "ul"; }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }

    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (numbered) {
      flushParagraph();
      if (listType !== "ol") { closeList(); out.push("<ol>"); listType = "ol"; }
      out.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }

    closeList();
    paragraph.push(inline(line.trim()) + (hardBreak ? "" : ""));
  }

  flushAll();
  return out.join("\n");
}

// First "**Label:** value" pair, used to surface the effective date under the title.
export function extractEffectiveDate(markdown: string): string | null {
  const m = markdown.match(/\*\*Effective Date:\*\*\s*([^\n*]+)/i);
  return m ? m[1].trim() : null;
}
