// /leadership-check-in — The Leadership Check-In (kit §02). Copy from the
// page:leadership-check-in scope; the assessment itself is
// components/leadership-check-in/leadership-check-in-assessment.tsx.

import { LeadershipCheckInAssessment } from "@/components/leadership-check-in/leadership-check-in-assessment";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageLeadershipCheckIn } from "@/lib/marketing/content/scopes/page-leadership-check-in";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, keepTogether } from "../primitives";

export async function LeadershipCheckInPage({
  signedIn,
  steward,
  preview,
  cohort,
  test,
}: {
  signedIn: boolean;
  steward: boolean;
  /** Switched off publicly; a super admin is previewing. */
  preview: boolean;
  cohort: string | null;
  test: boolean;
}) {
  const { hero, audience } = await getScopeContent(pageLeadershipCheckIn);
  const facts = hero.facts.split("\n").map((f) => f.trim()).filter(Boolean);

  return (
    <>
      {preview ? (
        <div className="border-b border-[#b88a4a]/40 bg-[#b88a4a]/10 px-4 py-2.5 text-center text-sm">
          <strong>Preview</strong> — only super admins can see this page until the Leadership Check-In is switched on.
          {test ? " Test mode: results are flagged as tests." : " Add ?test=1 to flag your results as a test."}
        </div>
      ) : null}

      <Band innerClassName="pb-10 md:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          {hero.subtitle ? <p className="mt-4 text-pretty font-display text-[clamp(1.15rem,2vw,1.45rem)] italic text-muted-foreground">{keepTogether(hero.subtitle)}</p> : null}
          <Prose text={hero.body} className="mx-auto mt-6 max-w-2xl text-left text-[16.5px] leading-8 text-muted-foreground sm:text-center" />
          {facts.length ? (
            <ul className="mt-6 flex flex-wrap justify-center gap-2">
              {facts.map((fact) => (
                <li key={fact} className="rounded-full border bg-background px-3 py-1 text-[13px] font-medium">{fact}</li>
              ))}
            </ul>
          ) : null}
          <Actions center>
            <ButtonLink cta={hero.primaryCta} />
            <ButtonLink cta={hero.secondaryCta} variant="outline" />
          </Actions>
        </div>
      </Band>

      <section id="check-in" className="scroll-mt-20 pb-16 md:pb-20">
        <div className="mx-auto w-full max-w-[880px] px-5 sm:px-8">
          <LeadershipCheckInAssessment signedIn={signedIn} steward={steward} cohort={cohort} test={test} />
        </div>
      </section>

      <Band tone="muted">
        <div className="mx-auto max-w-2xl text-center">
          <SectionIntro eyebrow={audience.eyebrow} title={audience.title} body={audience.body} center />
          {audience.closing ? <p className="mt-6 text-pretty font-display text-lg italic">{keepTogether(audience.closing)}</p> : null}
        </div>
      </Band>
    </>
  );
}
