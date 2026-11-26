// The five Annual Retreat emails, copy verbatim from
// docs/squeeze-page/MJG_Annual_Retreat_Jeremy_Handoff/Followup_Email_Copy.txt.
// Pure: rendering only, so tests can prove every link token is resolved.
//
// Email 1 (delivery) is requested mail: no sales footer, no unsubscribe link.
// Emails 2–5 are optional follow-ups: each carries an unsubscribe link and the
// postal address, and is only sent with active permission.

import type { FollowupKey } from "./config";

export type EmailKey = "delivery" | FollowupKey;

type Block = { kind: "p"; text: string } | { kind: "list"; items: string[] } | { kind: "button"; label: string; href: "guide" | "steward" } | { kind: "modes"; items: [string, string][] };

type EmailCopy = { subject: string; preheader: string; eyebrow: string; blocks: Block[] };

export const EMAILS: Record<EmailKey, EmailCopy> = {
  delivery: {
    subject: "Your free Annual Stewardship Blueprint Retreat Guide",
    preheader: "Your guide is ready. Choose a time to begin.",
    eyebrow: "Your Retreat Guide",
    blocks: [
      { kind: "p", text: "Thank you for requesting the Annual Stewardship Blueprint Retreat Guide." },
      { kind: "p", text: "Use the link below to download your copy:" },
      { kind: "button", label: "Download My Retreat Guide", href: "guide" },
      { kind: "p", text: "The guide follows four movements:" },
      { kind: "list", items: ["Remember & Release.", "Discern & Diagnose.", "Design & Decide.", "Live & Review."] },
      { kind: "p", text: "Begin by choosing a time to reflect. Bring your Bible and a notebook, and allow room for prayer, gratitude, honest questions, and rest." },
      { kind: "p", text: "You can return to the guide as your season changes." },
    ],
  },
  remember_release: {
    subject: "Begin by remembering the season you have lived",
    preheader: "Make room for gratitude and an honest look back.",
    eyebrow: "Remember & Release",
    blocks: [
      { kind: "p", text: "As you begin the retreat guide, spend some time remembering." },
      { kind: "p", text: "Look through a few photos or calendar entries. Notice people, ordinary moments, difficult experiences, and ways you have seen God at work." },
      { kind: "p", text: "Then consider what you are still carrying. Is there an expectation, commitment, or former goal that needs to be reconsidered for the season ahead?" },
      { kind: "p", text: "Give these questions some unhurried attention:" },
      { kind: "list", items: ["What am I grateful for?", "What has changed?", "What am I ready to release?"] },
      { kind: "button", label: "Open the Retreat Guide", href: "guide" },
    ],
  },
  discern_diagnose: {
    subject: "What does this part of your life need now?",
    preheader: "Restore, Build, Protect, or Multiply.",
    eyebrow: "Discern & Diagnose",
    blocks: [
      { kind: "p", text: "Different areas of life may call for different responses." },
      {
        kind: "modes",
        items: [
          ["RESTORE", "Receive help, renewal, or repair where something is depleted, neglected, or broken."],
          ["BUILD", "Strengthen what needs attention through small faithful rhythms over time."],
          ["PROTECT", "Care for what is healthy so it is not lost through neglect or drift."],
          ["MULTIPLY", "Help others grow in what God has developed in you."],
        ],
      },
      { kind: "p", text: "These modes can overlap. A healthy area may need protection while another needs restoration." },
      { kind: "p", text: "Choose one area to reflect on as you work through Discern & Diagnose." },
      { kind: "button", label: "Continue with the Guide", href: "guide" },
    ],
  },
  design_live: {
    subject: "Give one decision a place in your week",
    preheader: "Choose a practical rhythm and a time to review it.",
    eyebrow: "Design & Decide · Live & Review",
    blocks: [
      { kind: "p", text: "As you move through Design & Decide, choose the priorities that fit this season." },
      { kind: "p", text: "Start by making one decision concrete:" },
      { kind: "list", items: ["What will I do?", "When will I do it?", "What needs to move to make room?", "Who could help me follow through?"] },
      { kind: "p", text: "Then choose when you will review it." },
      { kind: "p", text: "During that review, notice what happened, what helped, and what needs adjusting. Some weeks call for a change; others call for protecting what is working." },
      { kind: "p", text: "Use the final sections of the retreat guide to connect your decisions with ordinary life." },
      { kind: "button", label: "Return to the Guide", href: "guide" },
    ],
  },
  steward_next_step: {
    subject: "Continue building your personal Blueprint",
    preheader: "An optional next step with Steward.",
    eyebrow: "An Optional Next Step",
    blocks: [
      { kind: "p", text: "The retreat guide gives you a framework for reflection and decisions that you can return to throughout the year." },
      { kind: "p", text: "If you would like help organizing those reflections and developing your Personal Stewardship Blueprint, you can explore Steward on the MJG website." },
      { kind: "p", text: "Steward is built around the same framework. It can help you think through priorities and revisit your plan as life unfolds. You decide what belongs in your Blueprint." },
      { kind: "p", text: "The free retreat guide remains yours to use whether or not you take another step." },
      { kind: "button", label: "Explore Steward", href: "steward" },
    ],
  },
};

export type RenderInput = {
  firstName?: string | null;
  guideUrl: string;
  stewardUrl: string;
  /** Follow-ups only. Delivery passes null. */
  unsubscribe: { url: string; mailingAddress: string } | null;
  siteUrl: string;
};

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const P = "padding:0 40px 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#3a3632;";

function blockHtml(b: Block, input: RenderInput): string {
  if (b.kind === "p") return `<tr><td style="${P}">${esc(b.text)}</td></tr>`;
  if (b.kind === "list")
    return `<tr><td style="${P}"><ul style="margin:0;padding-left:20px;">${b.items.map((i) => `<li style="margin:0 0 4px;">${esc(i)}</li>`).join("")}</ul></td></tr>`;
  if (b.kind === "modes")
    return b.items
      .map(
        ([name, text]) =>
          `<tr><td style="${P}"><span style="font-weight:700;letter-spacing:0.08em;color:#9a7a45;">${esc(name)}</span> &mdash; ${esc(text)}</td></tr>`,
      )
      .join("");
  const href = b.href === "guide" ? input.guideUrl : input.stewardUrl;
  return `<tr><td style="padding:8px 40px 22px;text-align:center;"><a href="${esc(href)}" style="display:inline-block;background:#c9aa70;color:#10110f;text-decoration:none;padding:15px 34px;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;">${esc(b.label)} &rarr;</a></td></tr>`;
}

function blockText(b: Block, input: RenderInput): string {
  if (b.kind === "p") return b.text;
  if (b.kind === "list") return b.items.map((i) => `• ${i}`).join("\n");
  if (b.kind === "modes") return b.items.map(([n, t]) => `${n} — ${t}`).join("\n\n");
  return `${b.label}: ${b.href === "guide" ? input.guideUrl : input.stewardUrl}`;
}

export function renderEmail(key: EmailKey, input: RenderInput): { subject: string; html: string; text: string } {
  const copy = EMAILS[key];
  const name = (input.firstName ?? "").trim();
  const greetingHtml = name ? `<tr><td style="${P}">Hi ${esc(name)},</td></tr>` : "";
  const footerHtml = input.unsubscribe
    ? `<p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#a39b8e;">You're receiving this because you asked for follow-up emails with the Annual Retreat Guide. <a href="${esc(input.unsubscribe.url)}" style="color:#8a8275;text-decoration:underline;">Unsubscribe</a><br />${esc(input.unsubscribe.mailingAddress)}</p>`
    : `<p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#a39b8e;">You're receiving this because you requested the Annual Stewardship Blueprint Retreat Guide.</p>`;

  const html = `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(copy.preheader)}</div>
<div style="background:#faf8f4;padding:24px 0;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr><td style="padding:28px 40px 0;text-align:center;">
          <img src="${esc(input.siteUrl)}/mjg-logos/mjg_black_white.png" width="120" alt="Michael J. Gauthier" style="width:120px;height:auto;border:0;" />
        </td></tr>
        <tr><td style="padding:18px 40px 0;"><hr style="border:none;border-top:1px solid #eee7db;margin:0;" /></td></tr>
        <tr><td style="padding:22px 40px 14px;text-align:center;">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#b9975a;font-weight:700;">${esc(copy.eyebrow)}</p>
        </td></tr>
        ${greetingHtml}
        ${copy.blocks.map((b) => blockHtml(b, input)).join("\n        ")}
        <tr><td style="padding:10px 40px 30px;">
          <hr style="border:none;border-top:1px solid #eee7db;margin:0 0 16px;" />
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:15px;color:#111111;font-weight:700;">Michael J. Gauthier</p>
          <p style="margin:3px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;"><a href="${esc(input.siteUrl)}" style="color:#8a8275;text-decoration:none;">MichaelJGauthier.com</a></p>
          ${footerHtml}
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>`;

  const text = [
    name ? `Hi ${name},` : null,
    ...copy.blocks.map((b) => blockText(b, input)),
    "Michael J. Gauthier",
    input.unsubscribe
      ? `You're receiving this because you asked for follow-up emails with the Annual Retreat Guide. Unsubscribe: ${input.unsubscribe.url}\n${input.unsubscribe.mailingAddress}`
      : "You're receiving this because you requested the Annual Stewardship Blueprint Retreat Guide.",
  ]
    .filter((x): x is string => x !== null)
    .join("\n\n");

  return { subject: copy.subject, html, text };
}
