// /assessments (assessments.dc.html): the live tools first, the planned one
// clearly marked as upcoming.

import { getScopeContent } from "@/lib/marketing/content/read";
import { pageAssessments } from "@/lib/marketing/content/scopes/page-assessments";
import { pageHome } from "@/lib/marketing/content/scopes/page-home";
import { cn } from "@/lib/utils";
import { CheckInDemo } from "../check-in-demo";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, StatusPill, keepTogether } from "../primitives";

type Assessment = Awaited<ReturnType<typeof getScopeContent<typeof pageAssessments>>>["checkIn"];

function tone(value: string) {
  return value === "live" || value === "soon" || value === "future" ? value : "future";
}

function Details({ a, variant = "primary" }: { a: Assessment; variant?: "primary" | "outline" }) {
  const facts = a.facts.split("\n").map((f) => f.trim()).filter(Boolean);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{a.label}</span>
        <StatusPill tone={tone(a.statusTone)}>{a.status}</StatusPill>
      </div>
      <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.1rem)] font-medium leading-tight">{keepTogether(a.title)}</h2>
      <Prose text={a.body} className="mt-4 text-[15.5px] leading-7 text-muted-foreground" />
      {facts.length ? (
        <ul className="mt-5 flex flex-wrap gap-2">
          {facts.map((fact) => (
            <li key={fact} className="rounded-full border bg-background px-3 py-1 text-[13px] font-medium">
              {fact}
            </li>
          ))}
        </ul>
      ) : null}
      <Actions className="mt-7">
        <ButtonLink cta={a.cta} variant={variant} />
      </Actions>
    </div>
  );
}

export async function AssessmentsPage() {
  const [{ hero, checkIn, energy, values, next }, home] = await Promise.all([getScopeContent(pageAssessments), getScopeContent(pageHome)]);

  return (
    <>
      <Band>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          <Prose text={hero.body} className="mx-auto mt-6 max-w-2xl text-[17px] leading-8 text-muted-foreground" />
          <Actions center>
            <ButtonLink cta={hero.primaryCta} />
          </Actions>
        </div>
      </Band>

      <Band tone="muted">
        <div className="space-y-6">
          {/* 1 · Created for More — the animated Check-In beside it */}
          <article className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <Split>
              <Details a={checkIn} />
              <CheckInDemo demo={home.firstStep.demo} href={checkIn.cta.href || "/created-for-more-check-in"} />
            </Split>
          </article>

          {/* 2 · Energy Audit */}
          <article className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <Split reverse>
              <Details a={energy} variant="outline" />
              <MediaFrame media={energy.image} ratio="4/3" sizes="(min-width: 1024px) 480px, 100vw" />
            </Split>
          </article>

          {/* 3 · Values — upcoming, so a dashed card and no visual */}
          <article className={cn("rounded-2xl border border-dashed border-[#d8c9a6] bg-card/60 p-6 sm:p-8 dark:border-gold/30")}>
            <div className="max-w-2xl">
              <Details a={values} variant="outline" />
            </div>
          </article>
        </div>
      </Band>

      <Band>
        <Split>
          <SectionIntro eyebrow={next.eyebrow} title={next.title} body={next.body} />
          <ol className="grid gap-3 sm:grid-cols-3">
            {next.steps.map((step, i) => (
              <li key={step.id} className="rounded-xl border bg-card p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 font-display text-gold-deep dark:text-gold-light">{i + 1}</span>
                <p className="mt-4 text-pretty font-display text-lg leading-snug">{keepTogether(step.text)}</p>
              </li>
            ))}
          </ol>
        </Split>
      </Band>
    </>
  );
}
