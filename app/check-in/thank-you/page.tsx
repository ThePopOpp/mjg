import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { STAGE_CONTENT, LAYER_DRIFT, PATHWAYS, LEAD_INTENTS, SUPPORT_NOTE } from "@/lib/pilot/check-in-results";

export default async function CheckInThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; max?: string; lowest?: string; lowestKey?: string; category?: string }>;
}) {
  const params = await searchParams;
  const score = params.score;
  const max = params.max ?? "140";
  const category = params.category ?? "";
  const stage = category ? STAGE_CONTENT[category] : undefined;
  const drift = params.lowestKey ? LAYER_DRIFT[params.lowestKey] : undefined;

  return (
    <PilotShell
      eyebrow="Your Blueprint Snapshot"
      title="Thank you for completing the Created for More Check-In"
      description="Your score is not a judgment. It is a mirror and a map — a way to see where alignment is strong, where drift may be showing up, and what needs attention next."
    >
      {/* Score + stage */}
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle>Blueprint Alignment Score</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-4xl font-semibold tabular-nums">
              {score ?? "Saved"}<span className="text-xl text-muted-foreground"> / {max}</span>
            </p>
            {category ? <p className="text-sm font-semibold uppercase tracking-wide text-[color:var(--brand-gold,#b9975a)]">{category}</p> : null}
            {params.lowest ? <p className="text-sm text-muted-foreground">Lowest layer: <span className="font-medium text-foreground">{params.lowest}</span></p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>What your score may be telling you</CardTitle></CardHeader>
          <CardContent className="space-y-3 leading-7 text-muted-foreground">
            {stage ? (
              <>
                <p>{stage.meaning}</p>
                <p className="text-foreground"><span className="font-semibold">Suggested next step:</span> {stage.nextStep}</p>
              </>
            ) : (
              <p>Your results are saved with your submission. The point is not to judge your life — it is to see it clearly enough to steward it wisely.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lowest layer drift */}
      {drift ? (
        <Card className="mt-6">
          <CardHeader><CardTitle>What your lowest layer may be telling you</CardTitle></CardHeader>
          <CardContent className="space-y-3 leading-7 text-muted-foreground">
            <p>{drift.driftPattern}</p>
            <p className="text-foreground"><span className="font-semibold">One faithful next step:</span> {drift.nextStep}</p>
          </CardContent>
        </Card>
      ) : null}

      {/* Email journey */}
      <Card className="mt-6">
        <CardHeader><CardTitle>What happens next</CardTitle></CardHeader>
        <CardContent className="space-y-3 leading-7 text-muted-foreground">
          <p>Over the next 7 days, you will receive one short email each day. Each reflection is designed to help you slow down, think honestly, and choose one faithful next step.</p>
          <p>Your first email will arrive shortly once the Wave 0 email process is triggered. Do not try to fix every layer at once — choose the layer that needs attention, take one faithful action, and invite the right kind of support.</p>
        </CardContent>
      </Card>

      {/* Recommended pathways */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold">Choose your recommended pathway</h2>
        <p className="mt-1 text-sm text-muted-foreground">Insight becomes powerful when it turns into action. Your next step should match your season — you do not need to do everything at once.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PATHWAYS.map((p) => (
            <Card key={p.title}>
              <CardContent className="space-y-2 p-5">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Best fit</p>
                <p className="text-sm text-muted-foreground">{p.bestFit}</p>
                <p className="pt-1 text-sm">{p.action}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lead-capture intents */}
      <Card className="mt-8">
        <CardHeader><CardTitle>Which next step feels most helpful right now?</CardTitle></CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            {LEAD_INTENTS.map((intent) => (
              <li key={intent} className="flex items-start gap-2 rounded-md border bg-card/60 p-3 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand-gold,#b9975a)]" />
                <span>{intent}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Reply to any of your journey emails with the step you want, and the team will follow up.</p>
        </CardContent>
      </Card>

      <p className="mt-6 rounded-md border border-dashed p-3 text-xs leading-6 text-muted-foreground">{SUPPORT_NOTE}</p>
    </PilotShell>
  );
}
