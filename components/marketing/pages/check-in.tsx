// /created-for-more-check-in, redesigned (created-for-more-check-in.dc.html).
//
// The assessment keeps the same questions, order,
// scoring, saving and deep links (?next=). Only the page around it changes:
// a new introduction, what to do with the results, and the privacy position.

import { CreatedForMoreAssessment } from "@/components/check-in/created-for-more-assessment";
import { LAYERS } from "@/lib/check-in/created-for-more";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageCheckIn } from "@/lib/marketing/content/scopes/page-assessments";
import { Actions, Band, ButtonLink, Eyebrow, Heading, SectionIntro, Split, TextLink, keepTogether } from "../primitives";
import { CheckInIntroButtons } from "../check-in-intro-buttons";

export async function CheckInPage({ redirectTo, dashboardHref, signedIn }: { redirectTo: string | null; dashboardHref: string | null; signedIn: boolean }) {
  const { hero, after, privacy } = await getScopeContent(pageCheckIn);

  return (
    <>
      <Band innerClassName="pb-10 md:pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          {hero.subtitle ? <p className="mt-4 font-display text-[clamp(1.15rem,2vw,1.4rem)] italic text-muted-foreground">{keepTogether(hero.subtitle)}</p> : null}
          <CheckInIntroButtons {...hero} />
        </div>
      </Band>

      {/* The tool: same questions, scoring and saving; presented as seven steps */}
      <section className="pb-16 md:pb-20">
        {/* No card around it: the tool draws its own cards. */}
        <div className="mx-auto w-full max-w-[880px] px-5 sm:px-8">
          <CreatedForMoreAssessment redirectTo={redirectTo} dashboardHref={dashboardHref} signedIn={signedIn} />
        </div>
      </section>

      {/* After Results */}
      <Band tone="muted">
        <Split align="start">
          <div>
            <SectionIntro eyebrow={after.eyebrow} title={after.title} body={after.body} />
            <Actions className="lg:max-w-none lg:grid-cols-1 xl:max-w-[34rem]">
              <ButtonLink cta={after.primaryCta} />
              <ButtonLink cta={after.secondaryCta} variant="outline" />
              <ButtonLink cta={after.tertiaryCta} variant="outline" />
            </Actions>
          </div>
          {/* Not a sample score: the real seven layers and the question each one asks. */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{after.layersLabel}</p>
            <ol className="mt-3 divide-y">
              {LAYERS.map((layer) => (
                <li key={layer.key} className="flex gap-4 py-3.5 last:pb-0">
                  <span className="w-6 shrink-0 font-display text-lg tabular-nums text-gold">{layer.index}</span>
                  <span>
                    <span className="block text-[14.5px] font-semibold">
                      {layer.title} <span className="font-normal text-muted-foreground">· {layer.subtitle}</span>
                    </span>
                    <span className="mt-0.5 block text-pretty text-[14px] italic leading-relaxed text-muted-foreground">{keepTogether(layer.coreQuestion)}</span>
                  </span>
                </li>
              ))}
            </ol>
            {after.layersNote ? <p className="mt-5 border-t pt-4 text-pretty text-[13.5px] text-muted-foreground">{after.layersNote}</p> : null}
          </div>
        </Split>
      </Band>

      {/* Privacy */}
      <Band>
        <div className="mx-auto max-w-2xl text-center">
          <SectionIntro eyebrow={privacy.eyebrow} title={privacy.title} body={privacy.body} center />
          <TextLink cta={privacy.link} className="mt-6" />
        </div>
      </Band>
    </>
  );
}
