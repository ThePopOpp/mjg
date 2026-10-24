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
      {/* Text (2/3, left); the portrait (1/3, right) stands on the section's bottom edge,
          like the homepage's "09 · Michael". On phones only the text shows. */}
      <Band flush>
        <Split align="end" className="md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="pb-16 md:pb-[72px]">
            <Eyebrow pill>{hero.eyebrow}</Eyebrow>
            <Heading title={hero.title} level={1} className="mt-6" />
            <Prose text={hero.body} className="mt-6 text-[17px] leading-8 text-muted-foreground" />
            <Actions>
              <ButtonLink cta={hero.primaryCta} />
            </Actions>
          </div>
          {/* The cut-out portrait at the homepage's scale: no box, 320px. */}
          {/* Hidden on phones for now (owner's call); shown from md up. */}
          <div className="hidden md:flex md:justify-end">
            <MediaFrame
              media={hero.photo}
              ratio="4/5"
              rounded="rounded-none"
              fit="contain"
              priority
              className="w-full max-w-[320px] bg-transparent"
              imageClassName="object-bottom"
              sizes="320px"
            />
          </div>
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
          {/* The family photo is portrait (about 4:5); a landscape frame cut off their heads. */}
          <MediaFrame
            media={question.image}
            ratio="4/5"
            imageClassName="object-top"
            sizes="(min-width: 1024px) 440px, 100vw"
            className="mx-auto w-full max-w-[440px]"
          />
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
