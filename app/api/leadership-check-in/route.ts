import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { AssessmentSaveError, saveAssessmentResult } from "@/lib/assessments/save";
import { ASSESSMENT_KEY, MARKETING_CONSENT_TEXT, REFLECTION_QUESTIONS, parseResponses, scoreLeadership } from "@/lib/leadership-check-in/leadership-check-in";
import { sendLeadershipResultsEmail } from "@/lib/leadership-check-in/results-email";

// "Send my results" for the Leadership Check-In.
//
// One row per attempt: the results screen already saved it (signed in) or the visitor
// saved it under their email; this finds the same row by attempt id — or creates it if
// they skipped saving — and adds what only this step collects: the optional reflections,
// consent, acquisition source, cohort and test flag. Ownership is enforced by
// saveAssessmentResult (an attempt that belongs to another account is refused).
//
// The results email goes once per attempt: pressing Send again, or a double submit,
// never sends a second copy. Reflections never appear in the email, alerts or logs.

const ATTEMPT_ID = /^[A-Za-z0-9-]{8,64}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Synthetic addresses are always flagged as tests, so they never count as real participants.
const TEST_EMAIL = /(\+test[^@]*@|@example\.(com|org|net)$|@test\.)/i;
const clip = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function touch(raw: unknown) {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "path", "referrer", "at"]) {
    const v = clip(t[k], 300);
    if (v) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const parsed = parseResponses(body.answers);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const attemptId = clip(body.attemptId, 64);
    if (!ATTEMPT_ID.test(attemptId)) return NextResponse.json({ error: "Your results aren't ready yet. Please try again." }, { status: 400 });
    const score = scoreLeadership(parsed.answers);

    const current = await getCurrentProfile().catch(() => null);
    const profile = current && current.id !== "local-preview" && current.email ? current : null;
    const name = profile ? [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() : clip(body.name, 200);
    const email = (profile ? profile.email : clip(body.email, 200)).toLowerCase();
    if (!EMAIL.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    if (!profile && !name) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });

    const [firstName, ...rest] = name.split(/\s+/);
    const saved = await saveAssessmentResult({
      key: ASSESSMENT_KEY,
      profile: { id: profile?.id ?? null, email, firstName: firstName ?? "", lastName: rest.join(" ") },
      answers: parsed.answers,
      attemptId,
    });

    // Optional reflections, keyed by question index; blanks dropped.
    const reflections: Record<string, string> = {};
    const rawReflections = body.reflections && typeof body.reflections === "object" ? (body.reflections as Record<string, unknown>) : {};
    REFLECTION_QUESTIONS.forEach((_, i) => {
      const text = clip(rawReflections[String(i)], 4000);
      if (text) reflections[String(i)] = text;
    });

    const isSuperAdmin = profile?.primaryRole === ROLES.SUPER_ADMIN;
    const test = TEST_EMAIL.test(email) || (body.test === true && isSuperAdmin);
    const cohort = clip(body.cohort, 60).toLowerCase().replace(/[^a-z0-9-]/g, "") || null;
    const attribution = body.attribution && typeof body.attribution === "object" ? (body.attribution as Record<string, unknown>) : {};
    const marketingOptIn = body.marketingOptIn === true;

    const db = createSupabaseAdminClient();
    const { data: row, error: readError } = await db.from("check_in_submissions").select("details").eq("id", saved.id).single();
    if (readError) throw readError;
    const details = (row?.details ?? {}) as Record<string, unknown>;
    const now = new Date().toISOString();

    const next: Record<string, unknown> = {
      ...details,
      reflections,
      consent: {
        results_delivery: true,
        marketing_opt_in: marketingOptIn,
        ...(marketingOptIn ? { marketing_consent_text: MARKETING_CONSENT_TEXT, marketing_consented_at: now } : {}),
      },
      // First acquisition wins: a resend never rewrites where they came from.
      acquisition: details.acquisition ?? {
        first_touch: touch(attribution.first),
        session_touch: touch(attribution.session),
        page_url: clip(body.pageUrl, 500) || null,
      },
      cohort: cohort ?? details.cohort ?? null,
      test: test || details.test === true,
    };

    let emailed = Boolean(details.results_emailed_at);
    const alreadySent = emailed;
    if (!emailed && body.sendEmail !== false) {
      const sent = await sendLeadershipResultsEmail({ to: email, name, score }).catch((e) => {
        console.error("[leadership-check-in] results email failed", e instanceof Error ? e.message : e);
        return null;
      });
      emailed = Boolean(sent && sent.ok && !sent.skipped);
      if (emailed) next.results_emailed_at = now;
    }

    const { error: updateError } = await db.from("check_in_submissions").update({ details: next }).eq("id", saved.id);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, id: saved.id, emailed, alreadySent, savedToAccount: Boolean(profile) });
  } catch (error) {
    if (error instanceof AssessmentSaveError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("[leadership-check-in] save failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We couldn't save your results. Please try again." }, { status: 500 });
  }
}
