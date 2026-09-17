"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, Compass, Copy, Flame, Loader2,
  MessageCircle, RotateCcw, Share2, Sparkles, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  REFLECTION_QUESTIONS, SCALE, SECTIONS, SECTION_MAX, TOTAL_MAX, TOTAL_STATEMENTS,
  answerKey, isComplete, isSectionComplete, scoreEnergyAudit, sectionByKey,
  type EnergyAuditNextStep, type EnergySource,
} from "@/lib/energy-audit/energy-audit";

// intro → teaching → the four energy sources (one per screen) → results → next step →
// reflection + save → continue the journey. Interpretation is withheld until all four
// sections are complete, per the source document.
const STEPS = ["intro", "teaching", ...SECTIONS.map((s) => s.key), "results", "next-step", "reflect", "journey"] as const;
type Step = (typeof STEPS)[number];

const STORAGE_KEY = "mjg-energy-audit-v1";

type Saved = {
  step: Step;
  answers: Record<string, number>;
  nextStep: EnergyAuditNextStep | null;
  reflections: Record<string, string>;
};

function readSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Saved;
    return parsed && typeof parsed === "object" && parsed.answers ? parsed : null;
  } catch {
    return null;
  }
}

function writeSaved(value: Saved | null) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable (private mode, blocked) — progress just isn't persisted */
  }
}

export function EnergyAuditFlow({
  signedIn,
  firstName,
  dashboardHref,
}: {
  signedIn: boolean;
  firstName?: string | null;
  dashboardHref?: string | null;
}) {
  const [step, setStep] = useState<Step>("intro");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [nextStep, setNextStep] = useState<EnergyAuditNextStep | null>(null);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [resumable, setResumable] = useState<Saved | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // Offer to resume a partially completed audit from this browser.
  useEffect(() => {
    const saved = readSaved();
    if (saved && saved.step !== "intro" && saved.step !== "journey") setResumable(saved);
    setHydrated(true);
  }, []);

  // Persist progress between steps (only once the visitor has actually begun).
  useEffect(() => {
    if (!hydrated || step === "intro") return;
    writeSaved(step === "journey" ? null : { step, answers, nextStep, reflections });
  }, [hydrated, step, answers, nextStep, reflections]);

  const score = useMemo(() => (isComplete(answers) ? scoreEnergyAudit(answers) : null), [answers]);

  function go(next: Step) {
    setStep(next);
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  const goOffset = (delta: number) => go(STEPS[Math.max(0, Math.min(STEPS.length - 1, STEPS.indexOf(step) + delta))]);

  function resume() {
    if (!resumable) return;
    setAnswers(resumable.answers ?? {});
    setNextStep(resumable.nextStep ?? null);
    setReflections(resumable.reflections ?? {});
    setResumable(null);
    // Never resume past the point the saved answers actually support.
    const target = !isComplete(resumable.answers ?? {}) && ["results", "next-step", "reflect"].includes(resumable.step)
      ? firstIncompleteSection(resumable.answers ?? {})
      : resumable.step;
    go(target);
  }

  function startOver() {
    writeSaved(null);
    setResumable(null);
    setAnswers({});
    setNextStep(null);
    setReflections({});
    go("intro");
  }

  const sectionIndex = SECTIONS.findIndex((s) => s.key === step);

  return (
    <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-24">
      {step === "intro" ? (
        <Intro resumable={resumable} onBegin={() => go("teaching")} onResume={resume} onStartOver={startOver} />
      ) : null}

      {step === "teaching" ? <Teaching onBack={() => go("intro")} onContinue={() => go(SECTIONS[0].key)} /> : null}

      {sectionIndex >= 0 ? (
        <SectionStep
          index={sectionIndex}
          answers={answers}
          onAnswer={(key, value) => setAnswers((a) => ({ ...a, [key]: value }))}
          onBack={() => goOffset(-1)}
          onNext={() => goOffset(1)}
        />
      ) : null}

      {step === "results" && score ? (
        <Results score={score} onBack={() => go(SECTIONS[SECTIONS.length - 1].key)} onContinue={() => go("next-step")} />
      ) : null}

      {step === "next-step" && score ? (
        <NextStepForm
          lowest={score.lowest}
          lowestTied={score.lowestTied}
          value={nextStep}
          onChange={setNextStep}
          onBack={() => go("results")}
          onContinue={() => go("reflect")}
        />
      ) : null}

      {step === "reflect" && score ? (
        <ReflectAndSave
          answers={answers}
          nextStep={nextStep ?? defaultNextStep(score.lowest)}
          reflections={reflections}
          onReflectionsChange={setReflections}
          signedIn={signedIn}
          firstName={firstName}
          onBack={() => go("next-step")}
          onSaved={() => go("journey")}
        />
      ) : null}

      {step === "journey" ? <Journey dashboardHref={dashboardHref} signedIn={signedIn} onRetake={startOver} /> : null}

      {/* A results/next-step screen reached without complete answers (e.g. stale storage). */}
      {["results", "next-step", "reflect"].includes(step) && !score ? (
        <Card>
          <CardContent className="space-y-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">A few statements still need a rating before your results are ready.</p>
            <Button onClick={() => go(firstIncompleteSection(answers))}>Finish the audit <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function firstIncompleteSection(answers: Record<string, number>): Step {
  return (SECTIONS.find((s) => !isSectionComplete(answers, s.key))?.key ?? "results") as Step;
}

function defaultNextStep(lowest: EnergySource): EnergyAuditNextStep {
  return { lowestEnergySource: lowest, renewalFocus: "", nextAction: "", conversationPerson: "", renewalRhythm: "" };
}

/* ─────────────────────────────── Intro ─────────────────────────────── */

function Intro({
  resumable,
  onBegin,
  onResume,
  onStartOver,
}: {
  resumable: Saved | null;
  onBegin: () => void;
  onResume: () => void;
  onStartOver: () => void;
}) {
  return (
    <div className="space-y-6">
      {resumable ? (
        <Card className="border-[#b88a4a]/50">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Pick up where you left off?</p>
              <p className="text-sm text-muted-foreground">
                You&rsquo;ve answered {Object.keys(resumable.answers ?? {}).length} of {TOTAL_STATEMENTS} statements on this device.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" size="sm" onClick={onStartOver}>Start over</Button>
              <Button size="sm" onClick={onResume}>Resume <ArrowRight className="ml-1.5 h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b88a4a]">Welcome from Michael</p>
        <p className="text-lg font-medium leading-8 text-foreground">Most people do not run out of purpose all at once. They run out of energy first.</p>
        <p>They still love their family. They still care about their work. They still believe in their calling. They still want to make wise decisions, build meaningful relationships, honor God, and lead well. But they are tired — not only physically, but emotionally worn down, mentally scattered, and spiritually dry.</p>
        <p>The Energy Audit is a companion to the Created for More Check-In. Where that check-in gives you a wide-angle view of your whole life, this audit zooms in on one specific layer of the Stewardship Blueprint: the energy that makes everything else possible.</p>
        <p>You can have a clear purpose, a strong marriage, disciplined finances, and good intentions, and still find the whole structure straining if your energy is depleted. Energy is not a side issue in a well-built life. It is the current that makes everything else livable.</p>
        <p>I approach this work from a Christian faith perspective, because that is the lens through which I have learned to understand rest, purpose, and renewal. But this tool is faith-based, not faith-exclusive. Wherever you are starting from, you are welcome here. The invitation is simple: slow down, tell yourself the truth, and start paying attention to what is fueling — or draining — the life you are building.</p>
        <p className="border-l-2 border-[#b88a4a] pl-4 font-serif text-lg italic text-foreground">
          You were not created to run on empty. You were created to be fully engaged in a life that matters.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <Fact label="Time" value="10–15 minutes" />
          <Fact label="Statements" value={`${TOTAL_STATEMENTS}, rated 1–5`} />
          <Fact label="You'll see" value="Four energy scores + one next step" />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" className="h-12 px-8 text-base" onClick={onBegin}>
          Begin Energy Audit <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

/* ────────────────────────────── Teaching ───────────────────────────── */

function Teaching({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="space-y-6">
      <StepHeader eyebrow="Before you begin" title="Why this audit matters" />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "Busyness can disguise depletion", body: "Most people are not running on empty because they are lazy. They keep saying yes, keep pushing, and keep telling themselves they will rest later. The danger is rarely a lack of effort. It is effort without renewal." },
          { title: "Energy debt is real", body: "Energy is entrusted capital, and it runs on deposits and withdrawals. Skip the sleep, the workout, the quiet moment, the honest conversation — the withdrawal covers the moment, but no deposit follows. Eventually the debt comes due." },
          { title: "You cannot steward what you never renew", body: "Time and money get most of the attention in stewardship conversations. But energy is the resource beneath both. You can have time on the calendar and money in the bank and still lack the capacity to use either one well." },
        ].map((c) => (
          <Card key={c.title}>
            <CardContent className="space-y-2 p-4">
              <p className="font-semibold leading-snug">{c.title}</p>
              <p className="text-sm leading-6 text-muted-foreground">{c.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b88a4a]">Two patterns</p>
          <p className="text-sm leading-6 text-muted-foreground">
            Every tank runs on the same principle, whether it holds gasoline or personal energy: what you draw out has to be put back in, or eventually you run dry.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/40 p-4">
              <p className="font-semibold">Running on Empty</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Chronic output with no refueling — pushing continuously, never stopping to fill back up, until the tank hits zero. Fatigue quietly turns into errors, short tempers, and eventually burnout.</p>
            </div>
            <div className="rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/[0.06] p-4">
              <p className="font-semibold">The Refueling Cycle</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">Seasons of full output followed by real refueling, so capacity is renewed instead of slowly drained.</p>
            </div>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Life itself was designed around refueling: day and night, work and rest, planting and harvest. Sabbath is not a suggestion. It is architecture.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b88a4a]">The four energies</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <Card key={s.key}>
              <CardContent className="p-4">
                <p className="font-semibold">{s.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          None of these operate in isolation. Stewarding energy means paying attention to all four — not just the one that is loudest right now.
        </p>
      </div>

      <StepNav onBack={onBack} next={<Button onClick={onContinue}>Start the audit <ArrowRight className="ml-2 h-4 w-4" /></Button>} />
    </div>
  );
}

/* ─────────────────────────── Assessment steps ──────────────────────── */

function SectionStep({
  index,
  answers,
  onAnswer,
  onBack,
  onNext,
}: {
  index: number;
  answers: Record<string, number>;
  onAnswer: (key: string, value: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const section = SECTIONS[index];
  const answered = section.statements.filter((_, i) => answers[answerKey(section.key, i)]).length;
  const complete = answered === section.statements.length;
  const last = index === SECTIONS.length - 1;

  return (
    <div className="space-y-5">
      {/* Progress: which section, and how far through the whole audit */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Section {index + 1} of {SECTIONS.length}</span>
          <span>{Object.keys(answers).length} of {TOTAL_STATEMENTS} answered</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SECTIONS.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                "h-1.5 rounded-full transition-colors",
                i < index || isSectionComplete(answers, s.key) ? "bg-[#b88a4a]" : i === index ? "bg-[#b88a4a]/40" : "bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      <StepHeader eyebrow={`Section ${index + 1}`} title={section.title} subtitle={section.coreQuestion} italic />

      <p className="rounded-md bg-muted/50 px-3 py-2 text-xs leading-5 text-muted-foreground">
        Answer based on what is actually true, not what you wish were true. <span className="hidden sm:inline">1 = Strongly Disagree · 5 = Strongly Agree.</span>
      </p>

      <div className="space-y-3">
        {section.statements.map((text, i) => {
          const key = answerKey(section.key, i);
          const value = answers[key];
          const chosen = SCALE.find((s) => s.value === value);
          return (
            <Card key={key} className={cn("transition-colors", value ? "border-[#b88a4a]/40" : "")}>
              <CardContent className="space-y-3 p-4">
                <p className="text-[15px] leading-6">
                  <span className="mr-2 font-semibold text-muted-foreground">{i + 1}.</span>
                  {text}
                </p>
                <div role="radiogroup" aria-label={text} className="grid grid-cols-5 gap-1.5 sm:max-w-sm">
                  {SCALE.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      role="radio"
                      aria-checked={value === s.value}
                      aria-label={`${s.value} — ${s.label}`}
                      title={`${s.label}: ${s.description}`}
                      onClick={() => onAnswer(key, s.value)}
                      className={cn(
                        "h-11 rounded-md border text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b88a4a]",
                        value === s.value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:border-[#b88a4a] hover:text-foreground",
                      )}
                    >
                      {s.value}
                    </button>
                  ))}
                </div>
                <p className={cn("text-xs text-muted-foreground", chosen ? "" : "invisible")} aria-live="polite">
                  {chosen ? <><span className="font-medium text-foreground">{chosen.label}</span> — {chosen.description}</> : " "}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <StepNav
        onBack={onBack}
        hint={complete ? null : `Rate all five statements to continue (${answered} of 5).`}
        next={
          <Button onClick={onNext} disabled={!complete}>
            {last ? "See my results" : `Next: ${SECTIONS[index + 1].title}`} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}

/* ─────────────────────────────── Results ────────────────────────────── */

function Results({
  score,
  onBack,
  onContinue,
}: {
  score: ReturnType<typeof scoreEnergyAudit>;
  onBack: () => void;
  onContinue: () => void;
}) {
  const lowest = sectionByKey(score.lowest);
  const strongest = sectionByKey(score.strongest);
  const allEqual = score.lowestTied.length === SECTIONS.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b88a4a]">Your Energy Audit</p>
        <div className="mt-3 font-serif text-6xl font-semibold tabular-nums">
          {score.total}
          <span className="text-2xl font-normal text-muted-foreground"> / {TOTAL_MAX}</span>
        </div>
        <p className="mt-2 text-xl font-semibold">{score.interpretation.title}</p>
        <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">{score.interpretation.meaning}</p>
        <p className="mx-auto mt-4 max-w-xl rounded-lg border border-[#b88a4a]/40 bg-[#b88a4a]/[0.06] px-4 py-3 font-serif text-base italic">
          {score.interpretation.reflection}
        </p>
      </div>

      {/* All four tanks side by side, so strongest and lowest read at a glance */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 text-sm font-semibold">Where your tank sits</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {score.sections.map((s) => {
              const isLowest = !allEqual && score.lowestTied.includes(s.key);
              const isStrongest = !allEqual && s.key === score.strongest;
              const pct = (s.score / SECTION_MAX) * 100;
              return (
                <div key={s.key} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "relative flex h-40 w-16 items-end overflow-hidden rounded-2xl border-2 bg-muted/40",
                      isLowest ? "border-[#b88a4a]" : "border-border",
                    )}
                    role="img"
                    aria-label={`${s.title}: ${s.score} of ${SECTION_MAX}, ${s.level}`}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-[#b88a4a] to-[#c9a96e] transition-[height] duration-700 ease-out"
                      style={{ height: `${Math.max(pct, 4)}%`, opacity: 0.35 + (pct / 100) * 0.65 }}
                    />
                    <span className="absolute inset-x-0 top-2 text-sm font-bold tabular-nums">{s.score}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-tight">{s.title.replace(" Energy", "")}</p>
                  <p className="text-xs text-muted-foreground">{s.level}</p>
                  {isLowest ? (
                    <span className="mt-1.5 rounded-full bg-[#b88a4a]/15 px-2 py-0.5 text-[11px] font-semibold text-[#b88a4a]">Start here</span>
                  ) : isStrongest ? (
                    <span className="mt-1.5 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Strongest</span>
                  ) : (
                    <span className="mt-1.5 h-[22px]" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {allEqual ? (
        <Card>
          <CardContent className="p-5 text-sm leading-6 text-muted-foreground">
            Your four energies scored evenly. On the next screen, choose the one you sense most needs renewal right now.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Where you&rsquo;re strong</p>
              <p className="mt-1 font-semibold">{strongest.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">Protect what&rsquo;s working here — it&rsquo;s carrying more than you may realize.</p>
            </CardContent>
          </Card>
          <Card className="border-[#b88a4a]/50">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#b88a4a]">Where to begin renewing</p>
              <p className="mt-1 font-semibold">
                {score.lowestTied.length > 1 ? score.lowestTied.map((k) => sectionByKey(k).title).join(" & ") : lowest.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Not a failure — the most faithful place to start.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* What refills the tank — for the lowest source */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-[#b88a4a]" />
            <p className="font-semibold">Refilling {lowest.title}</p>
          </div>
          <p className="text-sm text-muted-foreground">You don&rsquo;t need all of these. You need one.</p>
          <ul className="space-y-2">
            {lowest.refills.map((r) => (
              <li key={r} className="flex gap-2.5 text-sm leading-6">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[#b88a4a]" />
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <StepNav
        onBack={onBack}
        backLabel="Review answers"
        next={<Button onClick={onContinue}>Identify my next step <ArrowRight className="ml-2 h-4 w-4" /></Button>}
      />
    </div>
  );
}

/* ────────────────────────────── Next step ───────────────────────────── */

function NextStepForm({
  lowest,
  lowestTied,
  value,
  onChange,
  onBack,
  onContinue,
}: {
  lowest: EnergySource;
  lowestTied: EnergySource[];
  value: EnergyAuditNextStep | null;
  onChange: (v: EnergyAuditNextStep) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const current = value ?? defaultNextStep(lowest);
  const focus = sectionByKey(current.lowestEnergySource);
  const set = <K extends keyof EnergyAuditNextStep>(key: K, v: EnergyAuditNextStep[K]) => onChange({ ...current, [key]: v });

  // Seed the state once so the pre-selected lowest source is recorded even if untouched.
  useEffect(() => {
    if (!value) onChange(defaultNextStep(lowest));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Identify your next step"
        title="Begin with one faithful next step"
        subtitle="Insight becomes powerful when it turns into action. Do not try to renew every energy source in one day."
      />

      <Card>
        <CardContent className="space-y-3 p-5">
          <NumberedLabel n={1}>Circle your lowest energy source</NumberedLabel>
          <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
            {SECTIONS.map((s) => {
              const selected = current.lowestEnergySource === s.key;
              return (
                <button
                  key={s.key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => set("lowestEnergySource", s.key)}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                    selected ? "border-primary bg-primary text-primary-foreground" : "hover:border-[#b88a4a]",
                  )}
                >
                  <span className="font-medium">{s.title}</span>
                  {lowestTied.includes(s.key) ? (
                    <span className={cn("text-[11px] font-semibold", selected ? "text-primary-foreground/80" : "text-[#b88a4a]")}>
                      Your lowest
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {current.lowestEnergySource !== lowest && !lowestTied.includes(current.lowestEnergySource) ? (
            <p className="text-xs text-muted-foreground">That&rsquo;s okay — you know your season better than a score does.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 p-5">
          <Field n={2} label="In this season, the energy I most need to renew is:">
            <Textarea
              value={current.renewalFocus}
              onChange={(e) => set("renewalFocus", e.target.value)}
              placeholder={`e.g. my ${focus.title.toLowerCase()} — because…`}
              className="min-h-20"
            />
          </Field>

          <Field n={3} label="This week, I will:">
            <Textarea
              value={current.nextAction}
              onChange={(e) => set("nextAction", e.target.value)}
              placeholder="One small, specific action."
              className="min-h-20"
            />
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Need a starting point? Tap one from <span className="font-medium">Refilling {focus.title}</span>:</p>
              <div className="flex flex-wrap gap-1.5">
                {focus.refills.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("nextAction", r)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-left text-xs transition-colors",
                      current.nextAction === r ? "border-[#b88a4a] bg-[#b88a4a]/10" : "hover:border-[#b88a4a]",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field n={4} label="One person I may need to talk with about this is:">
            <Input
              value={current.conversationPerson}
              onChange={(e) => set("conversationPerson", e.target.value)}
              placeholder="A spouse, friend, mentor, pastor, or group member"
            />
          </Field>

          <Field n={5} label="One rhythm, habit, or calendar adjustment that could help renew this energy is:">
            <Textarea
              value={current.renewalRhythm}
              onChange={(e) => set("renewalRhythm", e.target.value)}
              placeholder="Refilling the tank is rarely one big change — it's a small, repeated rhythm."
              className="min-h-20"
            />
          </Field>
        </CardContent>
      </Card>

      <StepNav onBack={onBack} next={<Button onClick={onContinue}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>} />
    </div>
  );
}

/* ─────────────────────────── Reflection + save ───────────────────────── */

function ReflectAndSave({
  answers,
  nextStep,
  reflections,
  onReflectionsChange,
  signedIn,
  firstName,
  onBack,
  onSaved,
}: {
  answers: Record<string, number>;
  nextStep: EnergyAuditNextStep;
  reflections: Record<string, string>;
  onReflectionsChange: (v: Record<string, string>) => void;
  signedIn: boolean;
  firstName?: string | null;
  onBack: () => void;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ emailed: boolean; savedToAccount: boolean } | null>(null);
  const answeredReflections = Object.values(reflections).filter((v) => v.trim()).length;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/energy-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, nextStep, reflections, name, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSaved({ emailed: Boolean(data.emailed), savedToAccount: Boolean(data.savedToAccount) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <StepHeader
        eyebrow="Go deeper · optional"
        title="Reflection questions"
        subtitle="You do not need to answer them all at once. Let one or two become a starting point for prayer, journaling, conversation, or planning."
      />

      <Card>
        <CardContent className="divide-y p-0">
          {REFLECTION_QUESTIONS.map((q, i) => {
            const isOpen = open === i;
            const hasText = Boolean(reflections[String(i)]?.trim());
            return (
              <div key={q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-muted/40"
                >
                  <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]", hasText ? "border-[#b88a4a] bg-[#b88a4a] text-white" : "text-muted-foreground")}>
                    {hasText ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className="flex-1 leading-6">{q}</span>
                  <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen ? (
                  <div className="px-4 pb-4">
                    <Textarea
                      autoFocus
                      value={reflections[String(i)] ?? ""}
                      onChange={(e) => onReflectionsChange({ ...reflections, [String(i)]: e.target.value })}
                      placeholder="Write as much or as little as you like."
                      className="min-h-28"
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {saved ? (
        <Card className="border-[#b88a4a]/50">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm leading-6">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#b88a4a]" />
              <span>
                {saved.savedToAccount ? "Saved to your MJG account" : "Your Energy Audit has been saved"}
                {saved.emailed ? " — and a copy is on its way to your inbox" : ""}.
              </span>
            </p>
            <Button className="shrink-0" onClick={onSaved}>Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-3 p-5">
            <p className="font-semibold">{signedIn ? "Save your audit" : "Save your results"}</p>
            {signedIn ? (
              <p className="text-sm text-muted-foreground">
                {firstName ? `${firstName}, your` : "Your"} scores, next step{answeredReflections ? `, and ${answeredReflections} reflection${answeredReflections === 1 ? "" : "s"}` : ""} will be saved to your MJG account, and we&rsquo;ll email you a copy.
              </p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Leave your name and email to receive your results and next step. Both are optional.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" autoComplete="email" />
                </div>
              </>
            )}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="outline" onClick={onSaved} disabled={busy}>Skip saving</Button>
                <Button onClick={save} disabled={busy}>
                  {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : signedIn ? "Save to my account" : "Save my results"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────── Continue the journey ─────────────────────── */

function Journey({ dashboardHref, signedIn, onRetake }: { dashboardHref?: string | null; signedIn: boolean; onRetake: () => void }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/stewardship-blueprint/energy-audit`;
    const text = "Running on empty? This 15-minute Energy Audit helps you see where your tank is full, where it's leaking, and what renewal you need next.";
    try {
      if (navigator.share) {
        await navigator.share({ title: "The Energy Audit Check-In", text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* share sheet dismissed or clipboard blocked — nothing to do */
    }
  }

  const cards = [
    { icon: Users, title: "Join the Community", body: "Follow along as The Life You're Building is written — articles, reflection questions, practical tools, and behind-the-scenes updates.", href: "/#join", cta: "Join the community" },
    { icon: BookOpen, title: "Join the Book Waitlist", body: "Be the first to know when The Life You're Building: How to Stop Drifting and Design a Life That Matters becomes available.", href: "/book-waitlist", cta: "Join the waitlist" },
    { icon: Compass, title: "Join or Facilitate a 6-Week Study", body: "Go through the Stewardship Blueprint study with a small group, a men's group, or your church — or lead one yourself.", href: "/6-week-challenge", cta: "Explore the 6-Week Challenge" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[#b88a4a]" />
        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#b88a4a]">Continue the journey</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold">The Energy Audit is only a beginning</h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
          Insight fades fast without community, structure, and a next step. Here are a few ways to keep going.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardContent className="flex h-full flex-col gap-2 p-5">
              <c.icon className="h-5 w-5 text-[#b88a4a]" />
              <p className="font-semibold">{c.title}</p>
              <p className="flex-1 text-sm leading-6 text-muted-foreground">{c.body}</p>
              <Button asChild variant="outline" size="sm" className="mt-2 self-start">
                <Link href={c.href}>{c.cta} <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="flex h-full flex-col gap-2 p-5">
            <MessageCircle className="h-5 w-5 text-[#b88a4a]" />
            <p className="font-semibold">Share This Audit</p>
            <p className="flex-1 text-sm leading-6 text-muted-foreground">
              Think of one person who is running on empty right now. Sometimes the most stewarding thing you can do is hand them permission to slow down.
            </p>
            <Button variant="outline" size="sm" className="mt-2 self-start" onClick={share}>
              {copied ? <><Copy className="mr-1.5 h-4 w-4" /> Link copied</> : <><Share2 className="mr-1.5 h-4 w-4" /> Share the audit</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-center font-serif text-lg italic">
        You were not created to run on empty. You were created to be fully engaged in a life that matters.
      </p>

      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
        {signedIn && dashboardHref ? (
          <Button asChild>
            <Link href={dashboardHref}>Go to your dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        ) : null}
        <Button variant="ghost" onClick={onRetake}><RotateCcw className="mr-2 h-4 w-4" /> Take the audit again</Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Shared bits ──────────────────────────── */

function StepHeader({ eyebrow, title, subtitle, italic }: { eyebrow: string; title: string; subtitle?: string; italic?: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#b88a4a]">{eyebrow}</p>
      <h2 className="mt-1.5 font-serif text-3xl font-semibold leading-tight">{title}</h2>
      {subtitle ? <p className={cn("mt-2 text-[15px] leading-7 text-muted-foreground", italic && "italic")}>{subtitle}</p> : null}
    </div>
  );
}

function StepNav({
  onBack,
  backLabel = "Back",
  next,
  hint,
}: {
  onBack: () => void;
  backLabel?: string;
  next: React.ReactNode;
  hint?: string | null;
}) {
  return (
    <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-lg border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
      <Button variant="ghost" onClick={onBack} className="order-2 sm:order-1">
        <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
      </Button>
      <div className="order-1 flex flex-col items-stretch gap-1.5 sm:order-2 sm:flex-row sm:items-center">
        {hint ? <p className="text-center text-xs text-muted-foreground sm:text-right">{hint}</p> : null}
        {next}
      </div>
    </div>
  );
}

function NumberedLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-sm font-semibold">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b88a4a]/15 text-xs text-[#b88a4a]">{n}</span>
      {children}
    </p>
  );
}

function Field({ n, label, children }: { n: number; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <NumberedLabel n={n}>{label}</NumberedLabel>
      {children}
    </div>
  );
}
