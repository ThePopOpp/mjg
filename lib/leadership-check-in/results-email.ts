import { sendSmtpEmail } from "@/lib/email/smtp";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { ALL_TIED_NOTE, DISCLAIMER, LAYERS, LAYER_MAX, MAX_SCORE, layerName, type LeadershipScore } from "./leadership-check-in";

// Email 0 of the Leadership Check-In journey: "The Leader You're Becoming — Your
// Results" (kit §06–07). Body is Mike's draft copy from the kit, with the results
// inline. It is a delivery the person asked for, not a marketing message; the rest of
// the journey (days 2–30) is a separate draft campaign, pending Mike's approved copy.
//
// Never includes the optional reflections.

export const RESULTS_SUBJECT = "The Leader You’re Becoming — Your Results";

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

const LETTER = [
  "Thank you for taking the Leadership Check-In.",
  "One of the greatest responsibilities we have as leaders is to periodically step back and evaluate not just what we’re building, but who we’re becoming.",
  "I’ve spent much of my life building and leading businesses. Along the way, God has challenged me to think differently about what it means to be a business owner. I’m increasingly learning that leadership is stewardship.",
  "God has entrusted us with people, resources, opportunities, influence and responsibility. How we steward those things matters.",
  "Your Leadership Check-In results are an opportunity to reflect on where you’re currently aligned and where you might benefit from greater intentionality. They are not a measure of your worth in Christ.",
  "As you review your results, consider one question: What is one faithful step I can take this week to become the leader God is calling me to be?",
  "You don’t need to change everything at once. Start with one meaningful step.",
];

export async function sendLeadershipResultsEmail({ to, name, score }: { to: string; name: string | null; score: LeadershipScore }) {
  const site = publicSiteUrl();
  const first = (name ?? "").trim().split(/\s+/)[0] || "";
  const gold = "#C9A46E";
  const ink = "#191815";
  const muted = "#7a736a";

  const rows = score.layers
    .map(
      (l) => `<tr>
        <td style="padding:6px 0;font-size:14px;color:#3a3632;">${esc(l.title)} <span style="color:${muted};">· ${esc(l.label)} / ${esc(l.action)}</span></td>
        <td style="padding:6px 0;text-align:right;font-size:14px;font-weight:700;color:${ink};white-space:nowrap;">${l.score}/${LAYER_MAX}</td>
      </tr>`,
    )
    .join("");
  const pillars = Object.entries(score.pillars).map(([p, v]) => `${esc(p)} ${v}/5`).join(" &nbsp;·&nbsp; ");
  const steps = score.allTied
    ? `<p style="margin:0 0 8px;">${esc(ALL_TIED_NOTE)}</p>`
    : score.lowestKeys
        .map((key) => {
          const layer = LAYERS.find((l) => l.key === key)!;
          return `<p style="margin:0 0 8px;"><strong>${esc(layer.title)}:</strong> ${esc(layer.action)} <span style="color:${muted};">(${esc(layer.scripture)})</span></p>`;
        })
        .join("");

  const html = `<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#3a3632;line-height:1.6;">
    <div style="text-align:center;padding:8px 0 20px;">
      <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="96" alt="Michael J. Gauthier" style="display:block;width:96px;max-width:100%;height:auto;margin:0 auto 6px;" />
      <div style="font-size:10px;letter-spacing:0.22em;color:${ink};">MICHAEL J. GAUTHIER</div>
    </div>
    <p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${gold};font-weight:700;margin:0 0 4px;">The Leadership Check-In</p>
    <h1 style="font-family:Georgia,serif;font-size:24px;color:${ink};margin:0 0 16px;">The Leader You’re Becoming</h1>
    ${first ? `<p style="margin:0 0 14px;">Hi ${esc(first)},</p>` : ""}
    ${LETTER.map((p) => `<p style="margin:0 0 14px;">${esc(p)}</p>`).join("")}
    <p style="margin:0 0 22px;">Keep building,<br/>Michael J. Gauthier</p>

    <div style="text-align:center;border:1px solid #e7e1d5;border-radius:8px;padding:22px;margin:0 0 18px;">
      <div style="font-size:40px;font-weight:700;color:${ink};">${score.total}<span style="font-size:18px;color:${muted};"> / ${MAX_SCORE}</span></div>
      <div style="font-size:16px;font-weight:700;color:${ink};margin-top:4px;">${esc(score.band.label)}</div>
      <p style="font-size:14px;color:${muted};margin:8px 0 0;">${esc(score.band.copy)}</p>
    </div>
    <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #e7e1d5;margin:0 0 14px;">${rows}</table>
    <p style="margin:0 0 6px;font-size:14px;"><strong>Four Pillars:</strong> ${pillars}</p>
    ${score.allTied ? "" : `<p style="margin:0 0 4px;font-size:14px;"><strong>Highest layer${score.highestKeys.length > 1 ? "s" : ""}:</strong> ${esc(score.highestKeys.map(layerName).join(" · "))}</p>
    <p style="margin:0 0 14px;font-size:14px;"><strong>Lowest layer${score.lowestKeys.length > 1 ? "s" : ""}:</strong> ${esc(score.lowestKeys.map(layerName).join(" · "))}</p>`}
    <p style="margin:0 0 6px;font-weight:700;color:${ink};">One practical next step</p>
    ${steps}
    <p style="text-align:center;margin:22px 0 8px;"><a href="${site}/stewardship-blueprint" style="display:inline-block;background:${ink};color:#fff;text-decoration:none;padding:13px 28px;border-radius:6px;font-size:14px;font-weight:700;">Explore the Stewardship Blueprint &rarr;</a></p>
    <p style="font-size:12px;color:#9a948b;margin:22px 0 0;">${esc(DISCLAIMER)} Leadership Check-In v${esc(score.version)}.</p>
  </div>`;

  const text = [
    "The Leader You’re Becoming",
    "",
    first ? `Hi ${first},` : "",
    ...LETTER.flatMap((p) => [p, ""]),
    "Keep building,",
    "Michael J. Gauthier",
    "",
    `Your score: ${score.total} / ${MAX_SCORE} — ${score.band.label}`,
    score.band.copy,
    "",
    ...score.layers.map((l) => `- ${l.title}: ${l.score}/${LAYER_MAX} (${l.label} / ${l.action})`),
    `Four Pillars: ${Object.entries(score.pillars).map(([p, v]) => `${p} ${v}/5`).join(", ")}`,
    "",
    "One practical next step:",
    ...(score.allTied ? [ALL_TIED_NOTE] : score.lowestKeys.map((k) => { const l = LAYERS.find((x) => x.key === k)!; return `${l.title}: ${l.action} (${l.scripture})`; })),
    "",
    `Explore the Stewardship Blueprint: ${site}/stewardship-blueprint`,
    "",
    DISCLAIMER,
  ].join("\n");

  return sendSmtpEmail({ to, subject: RESULTS_SUBJECT, html, text });
}
