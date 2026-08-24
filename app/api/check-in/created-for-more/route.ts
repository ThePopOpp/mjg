import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { publicSiteUrl } from "@/lib/public-site/static-pages";
import { upsertParticipant } from "@/lib/pilot/repository";
import { PARTICIPANT_TYPES } from "@/lib/pilot/constants";
import { scoreCheckIn, MAX_SCORE, type CheckInScore } from "@/lib/check-in/created-for-more";
import { alertCheckIn } from "@/lib/notifications/check-in-alert";

// Public endpoint: saves a Created for More Check-In submission, emails the taker their
// results (if they gave an email), notifies the team, and returns the score.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const answers: Record<string, number> = {};
    if (body.answers && typeof body.answers === "object") {
      for (const [k, v] of Object.entries(body.answers)) {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 1 && n <= 5) answers[k] = n;
      }
    }
    if (!Object.keys(answers).length) return NextResponse.json({ error: "No answers were provided." }, { status: 400 });

    const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) || null : null;
    const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) || null : null;
    const validEmail = email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? email.toLowerCase() : null;
    const pathways = Array.isArray(body.chosenPathways)
      ? body.chosenPathways.filter((p: unknown) => typeof p === "string").map((p: string) => p.slice(0, 60)).slice(0, 12)
      : typeof body.chosenPathway === "string" && body.chosenPathway ? [body.chosenPathway.slice(0, 60)] : [];
    const score = scoreCheckIn(answers);
    const supabase = createSupabaseAdminClient();

    // Attach the taker as a participant (so they show in the participant list + stats),
    // linked by email — the same key the rest of the pilot uses. Best-effort.
    let participantId: string | null = null;
    if (validEmail && name) {
      const parts = name.split(/\s+/);
      const firstName = parts[0] || name;
      const lastName = parts.slice(1).join(" ");
      participantId = await upsertParticipant({
        firstName,
        lastName,
        email: validEmail,
        waveSource: "created_for_more_check_in",
        participantType: PARTICIPANT_TYPES.GENERAL,
        consent: { futureUpdatesOptIn: true, followUpPermission: true },
      })
        .then((p) => p.id)
        .catch((e) => { console.error("[created-for-more] participant upsert failed", e instanceof Error ? e.message : e); return null; });
    }

    const { error } = await supabase.from("check_in_submissions").insert({
      assessment: "created-for-more",
      name,
      email: validEmail ?? email,
      participant_id: participantId,
      answers,
      layer_scores: score.layerScores,
      total_score: score.total,
      stage: score.stage,
      strongest_layer: score.strongestLayer,
      lowest_layer: score.lowestLayer,
      lowest_pillar: score.lowestPillar,
      chosen_pathway: pathways[0] ?? null,
      chosen_pathways: pathways,
    });
    if (error) throw error;

    // Completing the Check-In is the participant's first challenge action — mark it on their
    // record so User Management / Participants / the dashboard reflect "completed", not
    // "not_started". Best-effort: the submission is already saved.
    if (participantId) {
      await supabase
        .from("participants")
        .update({ check_in_status: "completed" })
        .eq("id", participantId)
        .then(({ error: e }) => { if (e) console.error("[created-for-more] participant status update failed", e.message); });
    }

    // Emails are non-fatal: the submission is already saved, so a mail failure must not
    // turn into "something went wrong" for the visitor. We report emailed:false instead.
    let emailed = false;
    if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      const sent = await sendResultsEmail({ to: email, name, score }).catch((e) => {
        console.error("[created-for-more] results email failed", e instanceof Error ? e.message : e);
        return null;
      });
      emailed = Boolean(sent && sent.ok && !sent.skipped);
    }
    await alertCheckIn({ name, email: validEmail ?? email, score, participantId }).catch((e) => console.error("[created-for-more] alert failed", e instanceof Error ? e.message : e));

    return NextResponse.json({ ok: true, score, emailed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save your Check-In.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function sendResultsEmail({ to, name, score }: { to: string; name: string | null; score: CheckInScore }) {
  const site = publicSiteUrl();
  const first = (name ?? "").trim().split(/\s+/)[0] || "there";
  const gold = "#C9A46E";
  const ink = "#191815";
  const layerRows = score.layerScores
    .map(
      (l) => `<tr>
        <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:14px;color:#3a3632;">${escapeHtml(l.title)} <span style="color:#7a736a;">· ${escapeHtml(l.subtitle)}</span></td>
        <td style="padding:6px 0;text-align:right;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:${ink};white-space:nowrap;">${l.score}/20</td>
      </tr>`,
    )
    .join("");

  const html = `<div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#3a3632;line-height:1.6;">
    <div style="text-align:center;padding:8px 0 20px;">
      <img src="https://michaeljgauthier.com/mjg-logos/mjg_black_white.png" width="96" alt="Michael J. Gauthier" style="display:block;width:96px;max-width:100%;height:auto;margin:0 auto 6px;" />
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.22em;color:${ink};">MICHAEL J. GAUTHIER</div>
    </div>
    <p style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${gold};font-weight:700;margin:0 0 4px;">A Stewardship Blueprint Assessment</p>
    <h1 style="font-family:Georgia,serif;font-size:24px;color:${ink};margin:0 0 16px;">Your Created for More Check-In</h1>
    <p style="margin:0 0 16px;">Hi ${escapeHtml(first)}, thank you for taking the Check-In. Here is your Blueprint Snapshot.</p>
    <div style="text-align:center;border:1px solid #e7e1d5;border-radius:8px;padding:22px;margin:0 0 20px;">
      <div style="font-size:40px;font-weight:700;color:${ink};">${score.total}<span style="font-size:18px;color:#7a736a;"> / ${MAX_SCORE}</span></div>
      <div style="font-size:16px;font-weight:700;color:${ink};margin-top:4px;">${escapeHtml(score.stage)}</div>
      <p style="font-size:14px;color:#7a736a;margin:8px 0 0;">${escapeHtml(score.stageMeaning)}</p>
    </div>
    <p style="margin:0 0 6px;"><strong>Suggested next step:</strong> ${escapeHtml(score.stageNextStep)}</p>
    <p style="margin:0 0 4px;"><strong>Strongest layer:</strong> ${escapeHtml(score.strongestLayer)}</p>
    <p style="margin:0 0 18px;"><strong>Lowest layer${score.lowestPillar ? ` · ${escapeHtml(score.lowestPillar)}` : ""}:</strong> ${escapeHtml(score.lowestLayer)}</p>
    <table role="presentation" width="100%" style="border-collapse:collapse;border-top:1px solid #e7e1d5;margin:0 0 22px;">${layerRows}</table>
    <p style="text-align:center;margin:0 0 10px;"><a href="${site}/dashboard" style="display:inline-block;background:${ink};color:#fff;text-decoration:none;padding:13px 28px;border-radius:6px;font-size:14px;font-weight:700;">Go to your dashboard &rarr;</a></p>
    <p style="text-align:center;margin:0 0 8px;"><a href="${site}/created-for-more-check-in" style="display:inline-block;background:${gold};color:${ink};text-decoration:none;padding:13px 28px;border-radius:6px;font-size:14px;font-weight:700;">Try the Created for More Check-In Again</a></p>
    <p style="font-size:12px;color:#9a948b;margin:22px 0 0;">The goal isn't a perfect score — it's greater awareness. This is a mirror and a map, not a pass/fail test.</p>
    <p style="font-size:13px;color:#7a736a;margin:14px 0 0;">— Michael J. Gauthier</p>
  </div>`;

  const text = `Your Created for More Check-In\n\nHi ${first}, thank you for taking the Check-In.\n\nScore: ${score.total} / ${MAX_SCORE} — ${score.stage}\n${score.stageMeaning}\n\nSuggested next step: ${score.stageNextStep}\nStrongest layer: ${score.strongestLayer}\nLowest layer${score.lowestPillar ? ` · ${score.lowestPillar}` : ""}: ${score.lowestLayer}\n\nLayers:\n${score.layerScores.map((l) => `- ${l.title} · ${l.subtitle}: ${l.score}/20`).join("\n")}\n\nGo to your dashboard: ${site}/dashboard\nTry the Created for More Check-In again: ${site}/created-for-more-check-in\n\n— Michael J. Gauthier`;

  return sendSmtpEmail({ to, subject: "Your Created for More Check-In results", html, text });
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
