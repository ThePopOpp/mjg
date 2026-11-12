import { PDFDocument, StandardFonts, clip, endPath, popGraphicsState, pushGraphicsState, rectangle, rgb, type PDFFont } from "pdf-lib";
import {
  AlignmentType, BorderStyle, Document, HeadingLevel, ImageRun, Packer, PageBreak, Paragraph, ShadingType, Table, TableCell,
  TableRow, TextRun, WidthType,
} from "docx";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EMAIL_VIEWPORT, launchRenderer, layoutPages, loadEmail } from "@/lib/email/render-html";

// Downloads for the email template manager: the selected templates as one PDF, Word,
// plain-text or JSON file. PDF and Word show each email exactly as the dashboard preview
// does (rendered in Chromium); Word adds the copy as editable text after each email. JSON
// carries everything, HTML included, so it can be re-imported.

export const EXPORT_FORMATS = ["pdf", "docx", "txt", "json"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

const CONTENT_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain; charset=utf-8",
  json: "application/json; charset=utf-8",
};

type ExportTemplate = {
  id: string;
  name: string;
  slug: string;
  subject: string;
  preheader: string | null;
  category: string | null;
  status: string;
  is_test: boolean | null;
  available_fields: string[] | null;
  html_body: string;
  text_body: string | null;
  updated_at: string | null;
};

const GOLD = "#b88a4a";
const INK = "#191815";
const MUTED = "#7a736a";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", mdash: "—", ndash: "–", hellip: "…", middot: "·" };

/** The template's plain-text body, or a readable text version of its HTML. */
export function templateText(t: Pick<ExportTemplate, "text_body" | "html_body">): string {
  if (t.text_body?.trim()) return t.text_body.trim();
  return (t.html_body ?? "")
    .replace(/<(style|script|head|title)[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|div|tr|h[1-6]|li|table|blockquote)>/gi, "\n")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href: string, label: string) => {
      const text = label.replace(/<[^>]+>/g, "").trim();
      return text && !/^https?:/.test(text) && !/unsubscribe|preferences/i.test(text) ? `${text} (${href})` : text;
    })
    .replace(/<[^>]+>/g, "")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e: string) =>
      e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITIES[e.toLowerCase()] ?? m,
    )
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((l, i, all) => l || (i > 0 && all[i - 1]))
    .join("\n")
    .trim();
}

const stamp = () => new Date().toISOString().slice(0, 10);
const LABELS: Record<string, string> = {
  six_week_challenge: "The 6 Week Challenge",
  six_week_challenge_participant: "6WC · Participant",
  six_week_challenge_facilitator: "6WC · Facilitator",
  email_journey: "7-Day Journey",
};
const label = (s: string | null) => LABELS[s || ""] ?? (s || "general").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

/** Load the templates in the order they were selected. Unknown ids are skipped. */
export async function loadTemplatesForExport(ids: string[]): Promise<ExportTemplate[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("email_templates")
    .select("id,name,slug,subject,preheader,category,status,is_test,available_fields,html_body,text_body,updated_at")
    .in("id", ids);
  if (error) throw error;
  const byId = new Map((data ?? []).map((t) => [t.id, t as ExportTemplate]));
  return ids.map((id) => byId.get(id)).filter((t): t is ExportTemplate => Boolean(t));
}

export async function exportTemplates(templates: ExportTemplate[], format: ExportFormat) {
  const base = templates.length === 1 ? templates[0].slug || "email-template" : `email-templates-${stamp()}`;
  const filename = `${base}.${format}`;
  const contentType = CONTENT_TYPES[format];
  switch (format) {
    case "json":
      return { filename, contentType, body: Buffer.from(JSON.stringify({ exported_at: new Date().toISOString(), templates }, null, 2)) };
    case "txt":
      return { filename, contentType, body: Buffer.from(toTxt(templates)) };
    case "docx":
      return { filename, contentType, body: await toDocx(templates) };
    case "pdf":
      return { filename, contentType, body: await toPdf(templates) };
  }
}

function toTxt(templates: ExportTemplate[]) {
  return templates
    .map((t) =>
      [
        t.name.toUpperCase(),
        `Subject: ${t.subject}`,
        `Preview: ${t.preheader || "—"}`,
        `Category: ${label(t.category)} · Status: ${t.status}`,
        "",
        templateText(t),
      ].join("\n"),
    )
    .join(`\n\n${"=".repeat(72)}\n\n`);
}

async function toDocx(templates: ExportTemplate[]) {
  const W = 10800; // US Letter, 0.5" margins: 7.5" = 720px wide, the email's own width
  const run = (text: string, o: Record<string, unknown> = {}) => new TextRun({ text, font: "Arial", ...o });
  const line = { style: BorderStyle.SINGLE, size: 4, color: "D9D0C0" };
  const metaRow = (k: string, v: string, shade: boolean) =>
    new TableRow({
      cantSplit: true,
      children: [
        new TableCell({ width: { size: 1800, type: WidthType.DXA }, borders: { top: line, bottom: line, left: line, right: line }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, shading: { fill: "F6F1E7", type: ShadingType.CLEAR, color: "auto" }, children: [new Paragraph({ children: [run(k, { bold: true, size: 18 })] })] }),
        new TableCell({ width: { size: W - 1800, type: WidthType.DXA }, borders: { top: line, bottom: line, left: line, right: line }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, shading: shade ? { fill: "FBF9F4", type: ShadingType.CLEAR, color: "auto" } : undefined, children: [new Paragraph({ children: [run(v, { size: 18 })] })] }),
      ],
    });

  const children: (Paragraph | Table)[] = [];
  const browser = await launchRenderer();
  try {
    const page = await browser.newPage();
    for (const [i, t] of templates.entries()) {
      // The email itself, as the preview renders it, cut into page-sized pictures.
      const email = await loadEmail(page, t.html_body, 2);
      const fit = Math.min(1, EMAIL_VIEWPORT / email.width);
      const { scale, slices } = layoutPages(email, 750 / fit, 935 / fit);
      const k = fit * scale;
      const shots: Paragraph[] = [];
      for (const [y1, y2] of slices) {
        const data = await page.screenshot({ type: "png", clip: { x: 0, y: y1, width: email.width, height: y2 - y1 }, captureBeyondViewport: true });
        shots.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 }, children: [new ImageRun({ type: "png", data, transformation: { width: Math.round(email.width * k), height: Math.round((y2 - y1) * k) } })] }));
      }
      children.push(
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [run(t.name)] }),
        new Table({
          width: { size: W, type: WidthType.DXA },
          columnWidths: [1800, W - 1800],
          rows: [
            metaRow("Subject", t.subject, false),
            metaRow("Preview text", t.preheader || "—", true),
            metaRow("Category", label(t.category), false),
            metaRow("Status", t.status + (t.is_test ? " (test)" : ""), true),
          ],
        }),
        new Paragraph({ spacing: { before: 0, after: 120 }, children: [] }),
        ...shots,
        // The same copy as editable text, so wording changes can be marked up in Word.
        new Paragraph({ pageBreakBefore: true, spacing: { after: 80 }, children: [run(`Plain-text copy · ${t.name}`, { bold: true, size: 18, color: "B88A4A" })] }),
        ...templateText(t)
          .split("\n")
          .filter((l) => l.trim())
          .map((l) => new Paragraph({ spacing: { after: 120, line: 300 }, children: [run(l, { size: 21 })] })),
      );
      if (i < templates.length - 1) children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  } finally {
    await browser.close();
  }

  const doc = new Document({
    creator: "Michael J. Gauthier",
    title: templates.length === 1 ? templates[0].name : "Email templates",
    styles: {
      default: { document: { run: { font: "Arial", size: 21, color: "191815" } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Georgia", size: 32, bold: true, color: "191815" }, paragraph: { spacing: { before: 0, after: 160 }, keepNext: true, outlineLevel: 0 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 160 }, children: [run(`EMAIL TEMPLATES · EXPORTED ${stamp()}`, { bold: true, size: 16, color: "B88A4A" })] }),
        ...children,
      ],
    }],
  });
  return Packer.toBuffer(doc);
}

const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

/** Text a standard PDF font can draw, cut to fit `width` with an ellipsis. */
function fitText(font: PDFFont, text: string, size: number, width: number) {
  let s = [...text].filter((ch) => { try { font.encodeText(ch); return true; } catch { return false; } }).join("");
  if (font.widthOfTextAtSize(s, size) <= width) return s;
  while (s && font.widthOfTextAtSize(`${s}…`, size) > width) s = s.slice(0, -1);
  return `${s.trimEnd()}…`;
}

async function toPdf(templates: ExportTemplate[]): Promise<Buffer> {
  const PW = 612, PH = 792, M = 36, CW = PW - M * 2, HEAD = 66;
  const out = await PDFDocument.create();
  out.setTitle(templates.length === 1 ? templates[0].name : "Email templates");
  out.setAuthor("Michael J. Gauthier");
  const bold = await out.embedFont(StandardFonts.HelveticaBold);
  const regular = await out.embedFont(StandardFonts.Helvetica);

  const browser = await launchRenderer();
  try {
    const page = await browser.newPage();
    await page.emulateMediaType("screen");
    for (const t of templates) {
      // Print the whole email as one tall vector page, exactly as the preview shows it…
      const email = await loadEmail(page, t.html_body);
      const pdf = await page.pdf({ width: `${email.width}px`, height: `${email.height + 2}px`, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, pageRanges: "1" });
      const [emb] = await out.embedPdf(pdf, [0]);
      const s = emb.width / email.width; // points per CSS pixel in the printed page
      const fit = CW / emb.width;
      // …then lay it across Letter pages, cutting between sections rather than through them.
      const { scale, slices } = layoutPages(email, (PH - M * 2 - HEAD) / (s * fit), (PH - M * 2) / (s * fit));
      const k = fit * scale;
      const x = M + (CW - emb.width * k) / 2;
      slices.forEach(([y1, y2], i) => {
        const p = out.addPage([PW, PH]);
        let top = PH - M;
        if (i === 0) {
          p.drawText(fitText(bold, label(t.category).toUpperCase(), 7.5, CW), { x: M, y: top - 8, size: 7.5, font: bold, color: hex(GOLD) });
          p.drawText(fitText(bold, t.name, 14, CW), { x: M, y: top - 26, size: 14, font: bold, color: hex(INK) });
          p.drawText(fitText(regular, `Subject: ${t.subject}`, 8.5, CW), { x: M, y: top - 41, size: 8.5, font: regular, color: hex(MUTED) });
          p.drawText(fitText(regular, `Preview: ${t.preheader || "—"}`, 8.5, CW), { x: M, y: top - 53, size: 8.5, font: regular, color: hex(MUTED) });
          top -= HEAD;
        }
        const h = (y2 - y1) * s * k;
        p.pushOperators(pushGraphicsState(), rectangle(x, top - h, emb.width * k, h), clip(), endPath());
        p.drawPage(emb, { x, y: top - (emb.height - y1 * s) * k, xScale: k, yScale: k });
        p.pushOperators(popGraphicsState());
      });
    }
  } finally {
    await browser.close();
  }
  return Buffer.from(await out.save());
}

