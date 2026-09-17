import PDFDocument from "pdfkit";
import {
  REFLECTION_QUESTIONS, SECTIONS, SECTION_MAX, TOTAL_MAX,
  interpretationFor, sectionByKey, type EnergySource,
} from "@/lib/energy-audit/energy-audit";
import type { EnergyAuditSubmission } from "@/lib/energy-audit/submissions";

// Brand palette (see lib/brand/assets.ts — gold + ink/warm neutrals, never green).
const GOLD = "#b88a4a";
const INK = "#191815";
const MUTED = "#7a736a";
const RULE = "#e7e1d5";
const PAGE_MARGIN = 54;

/**
 * Render one Energy Audit as a branded PDF buffer.
 *
 * Uses pdfkit's built-in Times/Helvetica families rather than the brand webfonts: no font
 * files ship with the app, and the standard faces keep the file small and the build portable.
 */
export function renderEnergyAuditPdf(audit: EnergyAuditSubmission): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: PAGE_MARGIN,
      // Required to revisit pages for the footer pass via switchToPage().
      bufferPages: true,
      info: {
        Title: "The Energy Audit Check-In",
        Author: "Michael J. Gauthier",
        Subject: "A Stewardship Blueprint Assessment",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const width = doc.page.width - PAGE_MARGIN * 2;
    const total = audit.total_score ?? 0;
    const interpretation = interpretationFor(total);
    const sections = audit.layer_scores ?? [];
    const nextStep = audit.details?.nextStep ?? {};
    const reflections = audit.details?.reflections ?? {};
    const taken = new Date(audit.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    // ── Header ─────────────────────────────────────────────────────────────────
    doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text("MICHAEL J. GAUTHIER", { characterSpacing: 2 });
    doc.moveDown(0.2);
    doc.font("Helvetica").fontSize(8).fillColor(MUTED).text("A STEWARDSHIP BLUEPRINT ASSESSMENT", { characterSpacing: 1.4 });
    doc.moveDown(0.8);
    doc.font("Times-Bold").fontSize(26).fillColor(INK).text("The Energy Audit Check-In");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(10).fillColor(MUTED)
      .text(`${audit.name || audit.email || "Anonymous"}${audit.email && audit.name ? ` · ${audit.email}` : ""} · ${taken}`);
    doc.moveDown(0.8);
    rule(doc, width);

    // ── Score ──────────────────────────────────────────────────────────────────
    doc.moveDown(1);
    doc.font("Times-Bold").fontSize(40).fillColor(INK).text(`${total}`, { continued: true });
    doc.font("Helvetica").fontSize(14).fillColor(MUTED).text(`  / ${TOTAL_MAX}`);
    doc.moveDown(0.2);
    doc.font("Helvetica-Bold").fontSize(14).fillColor(INK).text(interpretation.title);
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(10.5).fillColor("#3a3632").text(interpretation.meaning, { width, lineGap: 3 });
    doc.moveDown(0.7);
    doc.font("Times-Italic").fontSize(11.5).fillColor(INK).text(interpretation.reflection, { width, lineGap: 2 });

    // ── Where your tank sits ───────────────────────────────────────────────────
    doc.moveDown(1.2);
    heading(doc, "Where your tank sits");
    doc.moveDown(0.5);

    const lowestKey = (nextStep.lowestEnergySource ?? audit.lowest_layer) as EnergySource | null;
    for (const s of sections) {
      const y = doc.y;
      const barX = PAGE_MARGIN + 150;
      const barW = width - 150 - 60;
      const pct = Math.max(0, Math.min(1, (s.score ?? 0) / SECTION_MAX));

      doc.font("Helvetica-Bold").fontSize(10).fillColor(INK).text(s.title, PAGE_MARGIN, y + 1, { width: 145 });
      // Track, then fill.
      doc.roundedRect(barX, y, barW, 11, 5.5).fill("#f1eee7");
      if (pct > 0) doc.roundedRect(barX, y, Math.max(barW * pct, 3), 11, 5.5).fill(GOLD);
      doc.font("Helvetica-Bold").fontSize(10).fillColor(INK)
        .text(`${s.score}/${SECTION_MAX}`, barX + barW + 8, y + 1, { width: 52, align: "right" });
      // Level label under the bar, and a marker on the source they're renewing.
      doc.font("Helvetica").fontSize(8).fillColor(MUTED)
        .text(s.level + (lowestKey === s.key ? "  ·  renewing this" : ""), barX, y + 13, { width: barW });
      doc.y = y + 27;
    }

    // ── Next step ──────────────────────────────────────────────────────────────
    const focus = lowestKey ? sectionByKey(lowestKey) : null;
    doc.moveDown(0.8);
    rule(doc, width);
    doc.moveDown(0.9);
    heading(doc, "Your next step");
    doc.moveDown(0.5);

    if (focus) {
      field(doc, width, "Renewing", focus.title);
      // The document's own starting points for this energy — the actionable half of the report.
      doc.moveDown(0.2);
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor(INK).text(`What refills ${focus.title}`);
      doc.moveDown(0.25);
      for (const r of focus.refills) {
        doc.font("Helvetica").fontSize(9.5).fillColor("#3a3632").text(`•  ${r}`, { width, lineGap: 2 });
      }
      doc.moveDown(0.5);
    }
    if (nextStep.renewalFocus) field(doc, width, "The energy I most need to renew", nextStep.renewalFocus);
    if (nextStep.nextAction) field(doc, width, "This week, I will", nextStep.nextAction);
    if (nextStep.conversationPerson) field(doc, width, "One person to talk with", nextStep.conversationPerson);
    if (nextStep.renewalRhythm) field(doc, width, "One rhythm to renew this energy", nextStep.renewalRhythm);

    // ── Reflections (only what they actually wrote) ─────────────────────────────
    const written = Object.entries(reflections).filter(([, v]) => (v ?? "").trim());
    if (written.length) {
      doc.moveDown(0.6);
      rule(doc, width);
      doc.moveDown(0.9);
      heading(doc, "Reflections");
      doc.moveDown(0.5);
      for (const [index, text] of written) {
        const question = REFLECTION_QUESTIONS[Number(index)];
        if (!question) continue;
        if (doc.y > doc.page.height - PAGE_MARGIN - 90) doc.addPage();
        doc.font("Helvetica-Bold").fontSize(9.5).fillColor(MUTED).text(question, { width, lineGap: 2 });
        doc.moveDown(0.15);
        doc.font("Helvetica").fontSize(10).fillColor("#3a3632").text(text, { width, lineGap: 3 });
        doc.moveDown(0.6);
      }
    }

    // ── Footer on every page ───────────────────────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i += 1) {
      doc.switchToPage(i);
      // The footer sits inside the bottom margin. pdfkit auto-appends a page whenever text is
      // written past the bottom margin, so drop that margin to zero for the footer pass —
      // otherwise each footer spawns a blank page (and those pages get footers too).
      doc.page.margins.bottom = 0;
      const footerY = doc.page.height - PAGE_MARGIN + 10;
      doc.lineWidth(0.5).strokeColor(RULE)
        .moveTo(PAGE_MARGIN, footerY - 10).lineTo(doc.page.width - PAGE_MARGIN, footerY - 10).stroke();
      doc.font("Times-Italic").fontSize(8.5).fillColor(MUTED)
        .text("You were not created to run on empty. You were created to be fully engaged in a life that matters.", PAGE_MARGIN, footerY, { width, align: "center", lineBreak: false });
      doc.font("Helvetica").fontSize(8).fillColor(MUTED)
        .text("michaeljgauthier.com", PAGE_MARGIN, footerY + 11, { width, align: "center", lineBreak: false });
    }

    doc.end();
  });
}

function rule(doc: PDFKit.PDFDocument, width: number) {
  doc.lineWidth(0.7).strokeColor(RULE).moveTo(PAGE_MARGIN, doc.y).lineTo(PAGE_MARGIN + width, doc.y).stroke();
}

function heading(doc: PDFKit.PDFDocument, text: string) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(GOLD).text(text.toUpperCase(), PAGE_MARGIN, doc.y, { characterSpacing: 1.3 });
}

function field(doc: PDFKit.PDFDocument, width: number, label: string, value: string) {
  doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED).text(label, PAGE_MARGIN, doc.y, { width });
  doc.moveDown(0.15);
  doc.font("Helvetica").fontSize(10.5).fillColor(INK).text(value, { width, lineGap: 3 });
  doc.moveDown(0.5);
}

/** Download filename, e.g. MJG-Energy-Audit-John-Doe-2026-09-17.pdf */
export function energyAuditPdfFilename(audit: EnergyAuditSubmission) {
  const who = (audit.name || audit.email || "report").replace(/[^A-Za-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const date = new Date(audit.created_at).toISOString().slice(0, 10);
  return `MJG-Energy-Audit-${who}-${date}.pdf`;
}

export const ENERGY_AUDIT_SECTION_KEYS = SECTIONS.map((s) => s.key);
