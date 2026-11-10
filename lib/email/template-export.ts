import PDFDocument from "pdfkit";
import {
  AlignmentType, BorderStyle, Document, HeadingLevel, Packer, PageBreak, Paragraph, ShadingType, Table, TableCell,
  TableRow, TextRun, WidthType,
} from "docx";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// Downloads for the email template manager: the selected templates as one PDF, Word,
// plain-text or JSON file. PDF and Word carry the copy (subject, preview text, body) for
// review and editing; JSON carries everything, HTML included, so it can be re-imported.

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
const RULE = "#e7e1d5";

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
  const W = 9360; // US Letter, 1" margins
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

  const children = templates.flatMap((t, i) => {
    const out: (Paragraph | Table)[] = [
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
      new Paragraph({ spacing: { before: 200, after: 80 }, children: [run("Email copy", { bold: true, size: 18, color: "B88A4A" })] }),
      ...templateText(t)
        .split("\n")
        .filter((l) => l.trim())
        .map((l) => new Paragraph({ spacing: { after: 120, line: 300 }, children: [run(l, { size: 21 })] })),
    ];
    if (i < templates.length - 1) out.push(new Paragraph({ children: [new PageBreak()] }));
    return out;
  });

  const doc = new Document({
    creator: "Michael J. Gauthier",
    title: templates.length === 1 ? templates[0].name : "Email templates",
    styles: {
      default: { document: { run: { font: "Arial", size: 21, color: "191815" } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Georgia", size: 32, bold: true, color: "191815" }, paragraph: { spacing: { before: 0, after: 200 }, keepNext: true, outlineLevel: 0 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children: [
        new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: 240 }, children: [run(`EMAIL TEMPLATES · EXPORTED ${stamp()}`, { bold: true, size: 16, color: "B88A4A" })] }),
        ...children,
      ],
    }],
  });
  return Packer.toBuffer(doc);
}

function toPdf(templates: ExportTemplate[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const margin = 54;
    const doc = new PDFDocument({ size: "LETTER", margin, bufferPages: true, info: { Title: templates.length === 1 ? templates[0].name : "Email templates", Author: "Michael J. Gauthier" } });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    const width = doc.page.width - margin * 2;

    templates.forEach((t, i) => {
      if (i > 0) doc.addPage();
      doc.font("Helvetica-Bold").fontSize(8).fillColor(GOLD).text(label(t.category).toUpperCase(), { characterSpacing: 1.5 });
      doc.moveDown(0.3).font("Times-Bold").fontSize(20).fillColor(INK).text(t.name, { width });
      doc.moveDown(0.5);
      for (const [k, v] of [["Subject", t.subject], ["Preview", t.preheader || "—"], ["Status", t.status + (t.is_test ? " (test)" : "")]]) {
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(MUTED).text(`${k}:  `, { continued: true }).font("Helvetica").fillColor(INK).text(v, { width });
      }
      doc.moveDown(0.6);
      doc.moveTo(margin, doc.y).lineTo(margin + width, doc.y).lineWidth(0.75).strokeColor(RULE).stroke();
      doc.moveDown(0.8);
      doc.font("Helvetica").fontSize(10.5).fillColor(INK);
      for (const l of templateText(t).split("\n")) {
        if (!l.trim()) { doc.moveDown(0.4); continue; }
        doc.text(l, { width, lineGap: 2.5, paragraphGap: 3 });
      }
    });

    const range = doc.bufferedPageRange();
    for (let p = range.start; p < range.start + range.count; p++) {
      doc.switchToPage(p);
      doc.page.margins.bottom = 0; // writing inside the bottom margin would otherwise add a page
      doc.font("Helvetica").fontSize(8).fillColor(MUTED)
        .text(`Michael J. Gauthier · Email templates · ${p + 1} of ${range.count}`, margin, doc.page.height - margin + 18, { width, align: "center", lineBreak: false });
    }
    doc.end();
  });
}
