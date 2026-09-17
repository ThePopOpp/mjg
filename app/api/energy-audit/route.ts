import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/server";
import {
  REFLECTION_QUESTIONS,
  SECTIONS,
  answerKey,
  isComplete,
  isRating,
  scoreEnergyAudit,
  type EnergySource,
} from "@/lib/energy-audit/energy-audit";
import { ENERGY_AUDIT_ASSESSMENT } from "@/lib/energy-audit/submissions";
import { sendEnergyAuditResultsEmail } from "@/lib/energy-audit/results-email";
import { alertEnergyAudit } from "@/lib/notifications/energy-audit-alert";

// Public endpoint: saves an Energy Audit Check-In. Signed-in users are saved to their MJG
// account automatically (by profile email); anonymous visitors may leave a name + email to
// receive their results. Scores are always recomputed here — never trusted from the client.

const SOURCES = SECTIONS.map((s) => s.key) as EnergySource[];
const clip = (v: unknown, max = 1000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Keep only the 20 known response keys with a valid 1–5 rating.
    const answers: Record<string, number> = {};
    const raw = body.answers && typeof body.answers === "object" ? body.answers : {};
    for (const section of SECTIONS) {
      section.statements.forEach((_, i) => {
        const key = answerKey(section.key, i);
        const n = Number(raw[key]);
        if (isRating(n)) answers[key] = n;
      });
    }
    if (!isComplete(answers)) {
      return NextResponse.json({ error: "Please rate all 20 statements before saving." }, { status: 400 });
    }

    const score = scoreEnergyAudit(answers);

    const ns = body.nextStep && typeof body.nextStep === "object" ? body.nextStep : {};
    const focusSource: EnergySource = SOURCES.includes(ns.lowestEnergySource) ? ns.lowestEnergySource : score.lowest;
    const nextStep = {
      lowestEnergySource: focusSource,
      renewalFocus: clip(ns.renewalFocus),
      nextAction: clip(ns.nextAction),
      conversationPerson: clip(ns.conversationPerson, 200),
      renewalRhythm: clip(ns.renewalRhythm),
    };

    // Reflections are optional and keyed by question index; drop anything blank or unknown.
    const reflections: Record<string, string> = {};
    const rawReflections = body.reflections && typeof body.reflections === "object" ? body.reflections : {};
    REFLECTION_QUESTIONS.forEach((_, i) => {
      const text = clip(rawReflections[String(i)], 4000);
      if (text) reflections[String(i)] = text;
    });

    // Signed in → save to their account. Otherwise use whatever the visitor chose to share.
    const profile = await getCurrentProfile().catch(() => null);
    const signedIn = Boolean(profile && profile.id !== "local-preview" && profile.email);
    const name = signedIn
      ? [profile!.firstName, profile!.lastName].filter(Boolean).join(" ").trim() || null
      : clip(body.name, 200) || null;
    const rawEmail = signedIn ? profile!.email : clip(body.email, 200);
    const email = rawEmail && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(rawEmail) ? rawEmail.toLowerCase() : null;

    const supabase = createSupabaseAdminClient();
    const { data: saved, error } = await supabase
      .from("check_in_submissions")
      .insert({
        assessment: ENERGY_AUDIT_ASSESSMENT,
        name,
        email,
        answers,
        // The shared columns, reused for the four energy sources.
        layer_scores: score.sections.map((s) => ({ key: s.key, title: s.title, score: s.score, level: s.level })),
        total_score: score.total,
        stage: score.interpretation.title,
        strongest_layer: score.strongest,
        lowest_layer: score.lowest,
        details: { interpretationKey: score.interpretation.key, lowestTied: score.lowestTied, nextStep, reflections },
      })
      .select("id")
      .single();
    if (error) throw error;

    const auditId = (saved?.id as string) ?? null;

    // Everything below is best-effort: the audit is already saved, so a mail or alert
    // failure must never surface as "something went wrong" to the person who took it.
    let emailed = false;
    if (email && auditId && body.sendEmail !== false) {
      const sent = await sendEnergyAuditResultsEmail({
        to: email,
        name,
        score,
        nextStep,
        auditId,
        profileId: signedIn ? profile!.id : null,
      }).catch((e) => {
        console.error("[energy-audit] results email failed", e instanceof Error ? e.message : e);
        return { sent: false } as const;
      });
      emailed = sent.sent;
    }

    // Notify the taker's facilitator (if they're on a team) plus Mike + super admins.
    if (auditId) {
      await alertEnergyAudit({
        name,
        email,
        score,
        auditId,
        focusSource: nextStep.lowestEnergySource,
      }).catch((e) => console.error("[energy-audit] alert failed", e instanceof Error ? e.message : e));
    }

    return NextResponse.json({ ok: true, id: auditId, savedToAccount: signedIn, emailed, score });
  } catch (error) {
    console.error("[energy-audit] save failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We couldn't save your Energy Audit. Please try again." }, { status: 500 });
  }
}
