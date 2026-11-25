"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAssessmentAutosave } from "@/components/assessments/use-assessment-autosave";
import { AutosaveNote, SaveResultsModal } from "@/components/assessments/save-results-modal";
import { readAttribution, trackEvent } from "@/components/analytics/site-analytics";
import {
  ALL_TIED_NOTE,
  ASSESSMENT_KEY,
  ASSESSMENT_LABEL,
  CATEGORY_NOTE,
  DISCLAIMER,
  INSTRUCTIONS,
  LAYERS,
  LAYER_MAX,
  MARKETING_CONSENT_TEXT,
  MAX_SCORE,
  REFLECTION_QUESTIONS,
  SCALE,
  TOTAL_STATEMENTS,
  layerName,
  scoreLeadership,
  type LeadershipScore,
} from "@/lib/leadership-check-in/leadership-check-in";

const GOLD = "#b88a4a";
const REFLECT_STEP = LAYERS.length; // the optional, unscored step after the seven layers

type Props = {
  signedIn: boolean;
  /** Leadership Mode released for this viewer: the Steward hand-off may appear. */
  steward: boolean;
  cohort?: string | null;
  /** Super-admin preview with ?test=1 — the result is flagged as a test. */
  test?: boolean;
};

/**
 * The Leadership Check-In: seven layers of four statements, then optional reflections.
 * Each statement is a native radio group (arrow keys move between choices, Tab moves
 * between statements). Results save to a signed-in member's account as soon as they're
 * shown; signed-out visitors are offered the save modal.
 */
export function LeadershipCheckInAssessment({ signedIn, steward, cohort = null, test = false }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  const answered = Object.keys(answers).length;
  const complete = answered === TOTAL_STATEMENTS;
  const score = useMemo(() => (showResults && complete ? scoreLeadership(answers) : null), [showResults, complete, answers]);
  const autosave = useAssessmentAutosave({ assessment: ASSESSMENT_KEY, label: ASSESSMENT_LABEL, signedIn, answers, ready: showResults && complete });
  const answeredIn = (i: number) => LAYERS[i].statements.filter((_, j) => answers[`${LAYERS[i].key}:${j}`]).length;

  const scrollTop = () =>
    setTimeout(() => {
      const top = topRef.current?.getBoundingClientRect().top ?? 0;
      if (top < 0 || top > window.innerHeight * 0.4) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 30);
  const goTo = (n: number) => { setError(null); setStep(Math.max(0, Math.min(REFLECT_STEP, n))); scrollTop(); };

  const setAnswer = (key: string, value: number) => {
    if (!started.current) { started.current = true; trackEvent("assessment_start"); }
    setError(null);
    setAnswers((a) => ({ ...a, [key]: value }));
  };

  const seeResults = () => {
    if (!complete) {
      const first = LAYERS.findIndex((_, i) => answeredIn(i) < 4);
      setError(`Please answer all ${TOTAL_STATEMENTS} statements — ${TOTAL_STATEMENTS - answered} still need a response.`);
      if (first >= 0) setStep(first);
      scrollTop();
      return;
    }
    setShowResults(true);
    trackEvent("assessment_complete");
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };
  const retake = () => {
    autosave.newAttempt();
    setAnswers({}); setReflections({}); setStep(0); setShowResults(false); setError(null);
    started.current = false;
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  };

  const layer = LAYERS[step];
  const pct = Math.round((answered / TOTAL_STATEMENTS) * 100);

  return (
    <div ref={topRef} className="scroll-mt-24 space-y-6">
      <p className="text-pretty rounded-lg border bg-muted/40 px-4 py-3 text-sm leading-6 text-muted-foreground">{INSTRUCTIONS}</p>

      {/* Progress 0–28 */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold">{step < REFLECT_STEP ? `Step ${step + 1} of ${LAYERS.length}` : "Optional reflections"}</span>
          <span className="text-muted-foreground">{answered} of {TOTAL_STATEMENTS} answered</span>
        </div>
        <div role="progressbar" aria-label="Statements answered" aria-valuemin={0} aria-valuemax={TOTAL_STATEMENTS} aria-valuenow={answered} className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-[width]" style={{ width: `${pct}%`, background: GOLD }} />
        </div>
        <ol className="mt-3 grid grid-cols-8 gap-1.5" aria-label="Check-In steps">
          {[...LAYERS.map((l) => l.title), "Reflect"].map((title, i) => {
            const done = i < REFLECT_STEP ? answeredIn(i) === 4 : false;
            return (
              <li key={title}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === step ? "step" : undefined}
                  aria-label={`${i < REFLECT_STEP ? `Step ${i + 1}: ` : ""}${title}${done ? " (complete)" : ""}`}
                  className={cn(
                    "flex h-9 w-full items-center justify-center rounded-md px-1 text-center text-[11px] leading-tight transition-colors md:h-11",
                    done ? "bg-[#b88a4a] text-white" : "bg-muted text-muted-foreground hover:text-foreground",
                    i === step && "font-semibold ring-2 ring-[#b88a4a] ring-offset-2 ring-offset-background",
                    i === step && !done && "text-foreground",
                  )}
                >
                  <span className="md:hidden">{i < REFLECT_STEP ? i + 1 : "✎"}</span>
                  <span className="hidden md:line-clamp-2">{title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {error ? <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      {step < REFLECT_STEP ? (
        <Card key={layer.key}>
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#b88a4a]">Layer {layer.index}</p>
            <h3 className="mb-4 text-lg font-bold">{layer.title} <span className="font-medium text-muted-foreground">· {layer.subtitle}</span></h3>
            <div className="space-y-3">
              {layer.statements.map((st, i) => {
                const key = `${layer.key}:${i}`;
                const n = (step * 4) + i + 1;
                const val = answers[key];
                return (
                  <fieldset key={key} className={cn("rounded-md border p-3", val ? "border-[#b88a4a]/40 bg-[#b88a4a]/[0.04]" : "")}>
                    <legend className="sr-only">{`${n}. ${st.text}`}</legend>
                    <p aria-hidden className="text-sm"><span className="mr-1 font-semibold tabular-nums text-muted-foreground">{n}.</span>{st.text}</p>
                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                      {SCALE.map((s) => {
                        const id = `lci-${key.replace(":", "-")}-${s.value}`;
                        const checked = val === s.value;
                        return (
                          <div key={s.value}>
                            <input
                              type="radio"
                              id={id}
                              name={`lci-${key}`}
                              value={s.value}
                              checked={checked}
                              onChange={() => setAnswer(key, s.value)}
                              className="peer sr-only"
                            />
                            <label
                              htmlFor={id}
                              className={cn(
                                "flex h-full cursor-pointer flex-col items-center justify-center rounded-md border px-1 py-2 text-center transition-colors",
                                "peer-focus-visible:ring-2 peer-focus-visible:ring-[#b88a4a] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
                                checked ? "border-[#b88a4a] bg-[#b88a4a] text-white" : "text-muted-foreground hover:border-[#b88a4a] hover:text-foreground",
                              )}
                            >
                              <span className="text-sm font-semibold">{s.value}</span>
                              <span className="mt-0.5 hidden text-[10.5px] leading-tight sm:block">{s.label}</span>
                              <span className="sr-only sm:hidden">{s.label}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[11px] text-muted-foreground sm:hidden">1 = Strongly disagree · 5 = Strongly agree</p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 sm:flex sm:justify-between">
              <Button type="button" variant="outline" onClick={() => goTo(step - 1)} disabled={step === 0} className="sm:min-w-[9rem]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button type="button" variant={answeredIn(step) === 4 ? "default" : "outline"} onClick={() => goTo(step + 1)} className="sm:min-w-[9rem]">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#b88a4a]">Optional · Not scored</p>
              <h3 className="text-lg font-bold">Reflect</h3>
              <p className="mt-1 text-sm text-muted-foreground">Answer any, all or none. Your reflections stay private to your results.</p>
            </div>
            {REFLECTION_QUESTIONS.map((q, i) => (
              <div key={q} className="space-y-1.5">
                <Label htmlFor={`lci-reflection-${i}`} className="text-sm font-medium leading-6">{q}</Label>
                <Textarea id={`lci-reflection-${i}`} rows={3} maxLength={4000} value={reflections[String(i)] ?? ""} onChange={(e) => setReflections((r) => ({ ...r, [String(i)]: e.target.value }))} />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 border-t pt-4 sm:flex sm:justify-between">
              <Button type="button" variant="outline" onClick={() => goTo(step - 1)} className="sm:min-w-[9rem]"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              <Button type="button" onClick={seeResults} className="sm:min-w-[9rem]">See my results <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="sticky bottom-[5.5rem] z-10 flex flex-col items-center gap-2 rounded-lg border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground">{answered}</span> of {TOTAL_STATEMENTS} answered
          {complete ? " — ready for your results." : ""}
        </p>
        <Button onClick={seeResults}>See my results <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>

      {showResults && score ? (
        <Results
          ref={resultsRef}
          score={score}
          answers={answers}
          reflections={reflections}
          signedIn={signedIn}
          steward={steward}
          cohort={cohort}
          test={test}
          attemptId={autosave.attemptId}
          onRetake={retake}
          note={<AutosaveNote status={autosave.status} onSignIn={() => autosave.setModalOpen(true)} onRetry={autosave.retry} assessment={ASSESSMENT_KEY} steward={steward} />}
        />
      ) : null}
      <SaveResultsModal open={autosave.modalOpen} onOpenChange={autosave.setModalOpen} onSaveAsGuest={autosave.saveAsGuest} guestEmail={autosave.guestEmail} assessment={ASSESSMENT_KEY} label={ASSESSMENT_LABEL} steward={steward} />
    </div>
  );
}

type ResultsProps = {
  score: LeadershipScore;
  answers: Record<string, number>;
  reflections: Record<string, string>;
  signedIn: boolean;
  steward: boolean;
  cohort: string | null;
  test: boolean;
  attemptId: string | null;
  onRetake: () => void;
  note: React.ReactNode;
};

const Results = forwardRef<HTMLDivElement, ResultsProps>(function Results({ score, answers, reflections, signedIn, steward, cohort, test, attemptId, onRetake, note }, ref) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | { emailed: boolean }>(null);
  const [error, setError] = useState<string | null>(null);
  const lowest = score.lowestKeys.map((k) => LAYERS.find((l) => l.key === k)!);

  async function send() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/leadership-check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, attemptId, name, email, reflections, marketingOptIn: optIn, attribution: readAttribution(), cohort, test, pageUrl: window.location.href }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Something went wrong. Please try again.");
      else { setSent({ emailed: Boolean(data.emailed) }); trackEvent("form_success"); }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={ref} className="scroll-mt-24 space-y-5 border-t pt-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#b88a4a]">Your Leadership Check-In</p>
        <div className="mt-2 text-5xl font-bold tabular-nums">{score.total}<span className="text-2xl font-medium text-muted-foreground"> / {MAX_SCORE}</span></div>
        <p className="mt-1 text-lg font-semibold">{score.band.label}</p>
        <p className="mx-auto mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">{score.band.copy}</p>
        <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm font-medium">{DISCLAIMER}</p>
      </div>

      {note}

      {/* Seven layers, each out of 20 */}
      <Card><CardContent className="p-0">
        <ul className="divide-y">
          {score.layers.map((l) => (
            <li key={l.key} className="flex items-center gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{l.title} <span className="font-normal text-muted-foreground">· {l.subtitle}</span></p>
                <p className="text-xs text-muted-foreground">{l.label} — {l.action}</p>
              </div>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-muted sm:w-28" aria-hidden>
                <div className="h-full rounded-full" style={{ width: `${(l.score / LAYER_MAX) * 100}%`, background: GOLD }} />
              </div>
              <div className="w-12 shrink-0 text-right text-sm font-semibold tabular-nums">{l.score}/{LAYER_MAX}</div>
            </li>
          ))}
        </ul>
      </CardContent></Card>

      {/* Four Pillars */}
      <Card><CardContent className="space-y-2 p-4">
        <p className="text-sm font-semibold">Your Four Pillars</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(score.pillars).map(([pillar, value]) => (
            <div key={pillar} className="rounded-md border p-3 text-center">
              <p className="text-xs text-muted-foreground">{pillar}</p>
              <p className="text-lg font-semibold tabular-nums">{value}<span className="text-sm font-normal text-muted-foreground">/5</span></p>
            </div>
          ))}
        </div>
      </CardContent></Card>

      {score.allTied ? (
        <Card><CardContent className="p-4 text-sm">{ALL_TIED_NOTE}</CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card><CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Highest layer{score.highestKeys.length > 1 ? "s" : ""}</p>
            {score.highestKeys.map((k) => <p key={k} className="mt-1 font-medium">{layerName(k)}</p>)}
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lowest layer{score.lowestKeys.length > 1 ? "s" : ""}</p>
            {score.lowestKeys.map((k) => <p key={k} className="mt-1 font-medium">{layerName(k)}</p>)}
          </CardContent></Card>
        </div>
      )}

      {/* One practical next step */}
      <Card className="border-[#b88a4a]/40"><CardContent className="space-y-2 p-4">
        <p className="text-sm font-semibold">One practical next step</p>
        {score.allTied ? (
          <p className="text-sm text-muted-foreground">Choose the layer that matters most in this season, then pick one small action for this week.</p>
        ) : (
          lowest.map((l) => (
            <p key={l.key} className="text-sm"><span className="font-medium">{l.title}: </span>{l.action} <span className="text-muted-foreground">({l.scripture})</span></p>
          ))
        )}
        {lowest.length > 1 && !score.allTied ? <p className="text-xs text-muted-foreground">These layers tied. Begin with whichever matters most right now.</p> : null}
      </CardContent></Card>

      <p className="text-pretty text-xs leading-5 text-muted-foreground">{CATEGORY_NOTE}</p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline" className="sm:w-64"><Link href="/stewardship-blueprint">Explore Stewardship Blueprint</Link></Button>
        {steward ? <Button asChild className="sm:w-64"><Link href={`/steward?from=${ASSESSMENT_KEY}`}>Talk with Steward about it</Link></Button> : null}
      </div>

      {/* Email the results */}
      {sent ? (
        <Card><CardContent className="flex items-center gap-3 p-5 text-sm">
          <Check className="h-5 w-5 shrink-0 text-[#b88a4a]" />
          <span>{sent.emailed ? "Your results are saved and on their way to your inbox." : "Your results are saved. We couldn’t send the email just now."}</span>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold">{signedIn ? "Email me my results" : "Send me my results"}</p>
          {!signedIn ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lci-name">Name</Label>
                <Input id="lci-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lci-email">Email</Label>
                <Input id="lci-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
            </div>
          ) : null}
          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="mt-1 h-4 w-4 accent-[#b88a4a]" />
            <span>{MARKETING_CONSENT_TEXT} <span className="italic">(Optional — you’ll receive your results either way.)</span></span>
          </label>
          {Object.values(reflections).some((r) => r.trim()) ? <p className="text-xs text-muted-foreground">Your optional reflections are saved with your results. They are not included in the email.</p> : null}
          {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onRetake}><RotateCcw className="mr-2 h-4 w-4" /> Retake</Button>
            <Button onClick={send} disabled={busy || !attemptId || (!signedIn && (!name.trim() || !email.trim()))}>{busy ? "Sending…" : signedIn ? "Email my results" : "Send my results"}</Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
});
