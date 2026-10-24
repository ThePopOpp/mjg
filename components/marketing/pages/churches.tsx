// /churches (churches.dc.html). Only tracks that exist are shown as available;
// church-wide pathways are "plan with us", never a launched product.

import { getScopeContent } from "@/lib/marketing/content/read";
import { pageChurches } from "@/lib/marketing/content/scopes/page-churches";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, CheckList, Eyebrow, Heading, PillCloud, Prose, SectionIntro, Split, StatusPill, TextLink, keepTogether } from "../primitives";

const TONES = ["live", "soon", "future"] as const;
const toneOf = (value: string) => (TONES as readonly string[]).includes(value) ? (value as (typeof TONES)[number]) : "future";

export async function ChurchesPage() {
  const { hero, explore, options, receive, nextStep } = await getScopeContent(pageChurches);

  return (
    <>
      {/* Hero */}
      <Band>
        <Split>
          <div>
            <Eyebrow pill>{hero.eyebrow}</Eyebrow>
            <Heading title={hero.title} level={1} className="mt-6" />
            <Prose text={hero.body} className="mt-6 text-[17px] leading-8 text-muted-foreground" />
            <Actions>
              <ButtonLink cta={hero.primaryCta} />
              <ButtonLink cta={hero.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <MediaFrame media={hero.image} ratio="4/3" priority sizes="(min-width: 1024px) 560px, 100vw" />
        </Split>
      </Band>

      {/* What Groups Explore */}
      <Band tone="muted">
        <Split align="start">
          <div>
            <SectionIntro eyebrow={explore.eyebrow} title={explore.title} body={explore.body} />
            <TextLink cta={explore.link} className="mt-6" />
          </div>
          <PillCloud items={explore.themes.map((t) => t.label)} className="lg:pt-10" />
        </Split>
      </Band>

      {/* Experience Options */}
      <Band>
        <SectionIntro eyebrow={options.eyebrow} title={options.title} className="max-w-3xl" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {options.options.map((option) => (
            <div key={option.id} className="flex flex-col rounded-xl border bg-card p-5">
              <div>
                <StatusPill tone={toneOf(option.statusTone)}>{option.status}</StatusPill>
              </div>
              <p className="mt-4 font-display text-lg leading-snug">{keepTogether(option.title)}</p>
              <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(option.body)}</p>
            </div>
          ))}
        </div>
        <Actions>
          <ButtonLink cta={options.primaryCta} />
          <ButtonLink cta={options.secondaryCta} variant="outline" />
        </Actions>
      </Band>

      {/* What Leaders Receive */}
      <Band tone="muted">
        <Split align="start">
          <div>
            <SectionIntro eyebrow={receive.eyebrow} title={receive.title} body={receive.body} />
            <Actions>
              <ButtonLink cta={receive.primaryCta} />
              <ButtonLink cta={receive.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
            <CheckList items={receive.items.map((i) => i.label)} />
          </div>
        </Split>
      </Band>

      {/* Next Step */}
      <Band tone="dark">
        <div className="mx-auto max-w-2xl text-center">
          <SectionIntro eyebrow={nextStep.eyebrow} title={nextStep.title} body={nextStep.body} center />
          <Actions center>
            <ButtonLink cta={nextStep.primaryCta} variant="gold" />
          </Actions>
        </div>
      </Band>
    </>
  );
}
