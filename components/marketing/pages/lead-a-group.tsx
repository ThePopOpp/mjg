// /lead-a-group (lead-a-group.dc.html) — the facilitator entry point.

import { getScopeContent } from "@/lib/marketing/content/read";
import { pageLeadAGroup } from "@/lib/marketing/content/scopes/page-lead-a-group";
import { FaqAccordion } from "../faq-accordion";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, TextLink, keepTogether } from "../primitives";

export async function LeadAGroupPage() {
  const { hero, leadersDo, path, faq } = await getScopeContent(pageLeadAGroup);

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
              <ButtonLink cta={hero.secondaryCta} variant="gold" />
            </Actions>
          </div>
          <div className="grid grid-cols-[1fr_1.4fr] items-end gap-4">
            <MediaFrame media={hero.guide} ratio="3/4" sizes="(min-width: 1024px) 230px, 40vw" />
            <MediaFrame media={hero.image} ratio="16/10" priority sizes="(min-width: 1024px) 330px, 60vw" />
          </div>
        </Split>
      </Band>

      {/* What Leaders Do */}
      <Band tone="muted">
        <Split align="start">
          <div>
            <SectionIntro eyebrow={leadersDo.eyebrow} title={leadersDo.title} body={leadersDo.body} />
            <TextLink cta={leadersDo.link} className="mt-6" />
          </div>
          <div className="grid gap-4">
            {leadersDo.roles.map((role) => (
              <div key={role.id} className="rounded-xl border bg-card p-5">
                <p className="font-display text-lg leading-snug">{keepTogether(role.title)}</p>
                <p className="mt-1 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(role.body)}</p>
              </div>
            ))}
          </div>
        </Split>
      </Band>

      {/* Simple Path */}
      <Band>
        <SectionIntro eyebrow={path.eyebrow} title={path.title} className="max-w-3xl" />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {path.steps.map((step, i) => (
            <li key={step.id} className="rounded-xl border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-background">{i + 1}</span>
              <p className="mt-4 text-pretty text-[15px] leading-relaxed">{keepTogether(step.text)}</p>
            </li>
          ))}
        </ol>
        <Actions>
          <ButtonLink cta={path.primaryCta} />
          <ButtonLink cta={path.secondaryCta} variant="outline" />
        </Actions>
      </Band>

      {/* Facilitator FAQ */}
      <Band tone="muted" id="faq">
        <Split align="start">
          <div>
            <SectionIntro eyebrow={faq.eyebrow} title={faq.title} />
            <Actions>
              <ButtonLink cta={faq.cta} />
            </Actions>
          </div>
          <FaqAccordion items={faq.items} />
        </Split>
      </Band>
    </>
  );
}
