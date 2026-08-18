"use client";

import { forwardRef, useMemo, useRef, useState } from "react";
import { Check, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LAYERS, SCALE, MAX_SCORE, TOTAL_STATEMENTS, PATHWAYS, NEXT_STEP_OPTIONS, LOWEST_LAYER_GUIDANCE, PILLAR_GUIDANCE, scoreCheckIn, type CheckInScore } from "@/lib/check-in/created-for-more";

export function CreatedForMoreAssessment({ redirectTo, dashboardHref }: { redirectTo?: string | null; dashboardHref?: string | null } = {}) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const answeredCount = Object.keys(answers).length;
  const complete = answeredCount >= TOTAL_STATEMENTS;
  const score = useMemo(() => (showResults ? scoreCheckIn(answers) : null), [showResults, answers]);

  const setAnswer = (key: string, value: number) => setAnswers((a) => ({ ...a, [key]: value }));
  const seeResults = () => { setShowResults(true); setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); };
  const retake = () => { setAnswers({}); setShowResults(false); setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60); };

  return (
    <div ref={topRef} className="space-y-6">
      {/* How to use / scale */}
      <Card>
        <CardContent className="space-y-3 p-5 text-sm leading-6 text-muted-foreground">
          <p className="text-base font-semibold text-foreground">How to use this Check-In</p>
          <p>Set aside about 15 quiet minutes. For each statement, rate yourself from 1 to 5 based on what is actually true, not what you wish were true. A lower score is not a reason for shame — it is an invitation to notice what needs attention next.</p>
          <div className="grid gap-1.5 sm:grid-cols-5">
            {SCALE.map((s) => (
              <div key={s.value} className="rounded-md border bg-muted/40 p-2 text-center">
                <div className="text-lg font-bold text-primary">{s.value}</div>
                <div className="text-[11px] font-medium text-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Layers */}
      {LAYERS.map((layer) => (
        <Card key={layer.key}>
          <CardContent className="p-5">
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Layer {layer.index}</p>
              <h3 className="text-lg font-bold">{layer.title} <span className="font-medium text-muted-foreground">· {layer.subtitle}</span></h3>
              <p className="mt-0.5 text-sm italic text-muted-foreground">{layer.coreQuestion}</p>
            </div>
            <div className="space-y-2">
              {layer.statements.map((st, i) => {
                const key = `${layer.key}:${i}`;
                const val = answers[key];
                return (
                  <div key={key} className={cn("flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between", val ? "border-primary/30 bg-primary/[0.03]" : "")}>
                    <p className="text-sm">{st.text}{st.pillar ? <span className="ml-1 text-xs text-muted-foreground">({st.pillar})</span> : null}</p>
                    <div className="flex shrink-0 gap-1">
                      {SCALE.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setAnswer(key, s.value)}
                          title={s.label}
                          aria-label={`${s.value} — ${s.label}`}
                          className={cn("h-9 w-9 rounded-md border text-sm font-semibold transition-colors", val === s.value ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:border-primary hover:text-foreground")}
                        >{s.value}</button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Score bar */}
      <div className="sticky bottom-4 z-10 flex flex-col items-center gap-2 rounded-lg border bg-card/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{answeredCount}</span> of {TOTAL_STATEMENTS} answered{!complete ? " — rate every statement to see your results." : ""}</p>
        <Button onClick={seeResults} disabled={!complete}>See my results <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </div>

      {showResults && score ? <Results ref={resultsRef} score={score} answers={answers} onRetake={retake} redirectTo={redirectTo} dashboardHref={dashboardHref} /> : null}
    </div>
  );
}

const Results = forwardRef<HTMLDivElement, { score: CheckInScore; answers: Record<string, number>; onRetake: () => void; redirectTo?: string | null; dashboardHref?: string | null }>(function Results({ score, answers, onRetake, redirectTo, dashboardHref }, ref) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pathways, setPathways] = useState<string[]>([]);
  const togglePathway = (key: string) => setPathways((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const guidance = LOWEST_LAYER_GUIDANCE[score.lowestLayerKey];

  async function send() {
    setBusy(true); setError(null);
    try {
      const res = await fetch("/api/check-in/created-for-more", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, answers, chosenPathways: pathways }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong.");
      else {
        setSent(true);
        setEmailed(Boolean(data.emailed));
        // Invite flow: after completing the Check-In, continue to their dashboard (which
        // requires a login first). Brief pause so they see the confirmation.
        if (redirectTo) setTimeout(() => window.location.assign(redirectTo), 1600);
      }
    } catch { setError("Something went wrong. Please try again."); } finally { setBusy(false); }
  }

  return (
    <div ref={ref} className="space-y-5 border-t pt-6">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Your Blueprint Snapshot</p>
        <div className="mt-2 text-5xl font-bold">{score.total}<span className="text-2xl font-medium text-muted-foreground"> / {MAX_SCORE}</span></div>
        <p className="mt-1 text-lg font-semibold">{score.stage}</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{score.stageMeaning}</p>
        <p className="mx-auto mt-2 max-w-2xl text-sm font-medium">Suggested next step: {score.stageNextStep}</p>
      </div>

      {/* Layer breakdown */}
      <Card><CardContent className="p-0">
        <div className="divide-y">
          {score.layerScores.map((l) => (
            <div key={l.key} className="flex items-center gap-3 px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.title} <span className="text-muted-foreground">· {l.subtitle}</span></p>
                <p className="text-xs text-muted-foreground">{l.status} — {l.statusMeaning}</p>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(l.score / 20) * 100}%` }} /></div>
              <div className="w-14 shrink-0 text-right text-sm font-semibold">{l.score}/20</div>
            </div>
          ))}
        </div>
      </CardContent></Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Strongest layer</p><p className="mt-1 font-medium">{score.strongestLayer}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lowest layer{score.lowestPillar ? ` · ${score.lowestPillar}` : ""}</p><p className="mt-1 font-medium">{score.lowestLayer}</p></CardContent></Card>
      </div>

      {guidance ? (
        <Card><CardContent className="space-y-2 p-4">
          <p className="text-sm font-semibold">What your lowest layer may be telling you</p>
          <p className="text-sm text-muted-foreground">{guidance.drift}</p>
          <p className="text-sm"><span className="font-medium text-primary">One faithful next step: </span>{guidance.step}</p>
          {score.lowestPillar && PILLAR_GUIDANCE[score.lowestPillar] ? (
            <p className="text-sm"><span className="font-medium text-primary">{score.lowestPillar}: </span>{PILLAR_GUIDANCE[score.lowestPillar].step}</p>
          ) : null}
        </CardContent></Card>
      ) : null}

      {/* Pathways */}
      <div>
        <p className="mb-2 text-sm font-semibold">Choose your recommended pathway</p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {PATHWAYS.map((p) => (
            <Card key={p.key}><CardContent className="flex h-full flex-col gap-1 p-4">
              <p className="font-medium text-primary">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.bestFit}</p>
              <p className="mt-1 flex-1 text-sm">{p.action}</p>
            </CardContent></Card>
          ))}
        </div>
      </div>

      {/* Capture */}
      {sent ? (
        <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-3 text-sm"><Check className="h-5 w-5 shrink-0 text-primary" /><span>Thank you — your results have been saved{emailed ? " and a copy is on its way to your inbox" : email ? " and we'll be in touch" : ""}.{redirectTo ? " Taking you to your dashboard…" : ""}</span></p>
          <Button className="shrink-0" onClick={() => window.location.assign(dashboardHref ?? "/login?next=/dashboard")}>
            {dashboardHref ? "Go to your dashboard" : "Log in to your dashboard"} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="space-y-3 p-5">
          <p className="text-sm font-semibold">Send me my results and next step</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Which next steps feel most helpful right now? <span className="italic">Select all that apply.</span></p>
            <div className="grid gap-1.5">
              {NEXT_STEP_OPTIONS.map((o) => {
                const checked = pathways.includes(o.key);
                return (
                  <button
                    key={o.key}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => togglePathway(o.key)}
                    className={cn("flex items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition-colors", checked ? "border-primary bg-primary/10" : "hover:bg-accent")}
                  >
                    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded border", checked ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                      {checked ? <Check className="h-3.5 w-3.5" /> : null}
                    </span>
                    <span>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onRetake}><RotateCcw className="mr-2 h-4 w-4" /> Retake</Button>
            <Button onClick={send} disabled={busy}>{busy ? "Saving…" : "Send my results"}</Button>
          </div>
        </CardContent></Card>
      )}
    </div>
  );
});
