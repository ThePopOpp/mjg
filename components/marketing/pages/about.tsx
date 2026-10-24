// /about (about.dc.html).

import { getScopeContent } from "@/lib/marketing/content/read";
import { pageAbout } from "@/lib/marketing/content/scopes/page-about";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, TextLink, keepTogether } from "../primitives";

export async function AboutPage() {
  const { hero, question, journey, invitation } = await getScopeContent(pageAbout);

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
            </Actions>
          </div>
          <MediaFrame media={hero.photo} ratio="4/5" priority sizes="(min-width: 1024px) 520px, 100vw" className="mx-auto w-full max-w-md lg:max-w-none" />
        </Split>
      </Band>

      {/* The Question */}
      <Band tone="muted">
        <Split reverse>
          <div>
            <Eyebrow>{question.eyebrow}</Eyebrow>
            <Heading title={question.title} italic className="mt-3" />
            <Prose text={question.body} className="mt-6 text-[16px] leading-8 text-muted-foreground" />
          </div>
          <MediaFrame media={question.image} ratio="4/3" sizes="(min-width: 1024px) 520px, 100vw" />
        </Split>
      </Band>

      {/* The Journey */}
      <Band>
        <Split align="start">
          <div>
            <SectionIntro eyebrow={journey.eyebrow} title={journey.title} body={journey.body} />
            <TextLink cta={journey.link} className="mt-6" />
          </div>
          <ol className="relative space-y-8 border-l-2 border-gold/40 pl-8 lg:mt-14">
            {journey.milestones.map((m) => (
              <li key={m.id} className="relative">
                <span aria-hidden className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-4 border-background bg-gold" />
                <p className="font-display text-2xl leading-none text-gold-deep dark:text-gold-light">{m.label}</p>
                <p className="mt-2 text-pretty text-[15.5px] leading-relaxed">{keepTogether(m.text)}</p>
              </li>
            ))}
          </ol>
        </Split>
      </Band>

      {/* Invitation */}
      <Band tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>{invitation.eyebrow}</Eyebrow>
          <Heading title={invitation.title} className="mt-3" />
          <Prose text={invitation.body} className="mt-6 text-[17px] leading-8 text-band-text" />
          <Actions center>
            <ButtonLink cta={invitation.primaryCta} variant="gold" />
            <ButtonLink cta={invitation.secondaryCta} variant="ghost" />
          </Actions>
        </div>
      </Band>
    </>
  );
}
