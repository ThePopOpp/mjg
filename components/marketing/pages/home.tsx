// The homepage (home.dc.html). Server component: it reads the content and lays
// out the eleven sections; only the hero video, the read-more dialog, the
// framework explorer and the join form ship JavaScript.

import { getScopeContent } from "@/lib/marketing/content/read";
import { globalFramework, globalJoinForm } from "@/lib/marketing/content/scopes/global";
import { pageHome } from "@/lib/marketing/content/scopes/page-home";
import { Book3D } from "../book-3d";
import { ChatMock } from "../chat-mock";
import { CheckInDemo } from "../check-in-demo";
import { FrameworkExplorer } from "../framework-explorer";
import { JoinJourneyForm } from "../join-journey-form";
import { MediaFrame } from "../media";
import {
  Actions,
  Band,
  ButtonLink,
  CONTAINER,
  Eyebrow,
  Heading,
  Prose,
  SectionIntro,
  Split,
  TextLink,
  keepTogether,
} from "../primitives";
import { ReadMoreDialog } from "../read-more";
import { ClickToPlay, LoopingVideo } from "../video";
import Link from "next/link";

export async function HomePage() {
  const [c, { framework }, { joinForm }] = await Promise.all([
    getScopeContent(pageHome),
    getScopeContent(globalFramework),
    getScopeContent(globalJoinForm),
  ]);
  const { hero, awaken, firstStep, engage, blueprint, steward, grow, book, michael, join } = c;

  return (
    <>
      {/* 00 · Hero — Awaken (The Stewardship Blueprint) */}
      <section className="border-b">
        <div className={`${CONTAINER} pb-14 pt-14 text-center md:pb-20 md:pt-20`}>
          <Eyebrow pill>{awaken.eyebrow}</Eyebrow>
          <Heading title={awaken.title} level={1} accent className="mx-auto mt-6 max-w-[16ch]" />
          {awaken.lead ? <p className="mx-auto mt-6 max-w-[40rem] text-pretty text-lg font-medium leading-relaxed">{keepTogether(awaken.lead)}</p> : null}
          <Prose text={awaken.body} className="mx-auto mt-4 max-w-[40rem] text-[17px] leading-8 text-muted-foreground" />
          <Actions center>
            <ButtonLink cta={awaken.primaryCta} />
            <ButtonLink cta={awaken.secondaryCta} variant="outline" />
          </Actions>
          <ClickToPlay
            embed={awaken.film}
            poster={awaken.filmPoster}
            label={awaken.filmLabel}
            ratio="16/9"
            className="mx-auto mt-12 max-w-[1040px] text-left"
          />
          {awaken.moreBody ? (
            <ReadMoreDialog
              label={awaken.readMoreLabel}
              eyebrow={awaken.eyebrow}
              title={awaken.title}
              body={awaken.moreBody}
              primaryCta={awaken.primaryCta}
              secondaryCta={awaken.secondaryCta}
            />
          ) : null}
        </div>
      </section>

      {/* 02 · See the Framework */}
      <Band tone="muted" id="framework">
        <FrameworkExplorer
          framework={framework}
          eyebrow={c.framework.eyebrow}
          title={c.framework.title}
          layerCta={c.framework.layerCta}
          frameworkCta={c.framework.frameworkCta}
        />
      </Band>

      {/* 03 · First Step */}
      <Band>
        <Split reverse>
          <div>
            <SectionIntro eyebrow={firstStep.eyebrow} title={firstStep.title} body={firstStep.body} />
            <Actions>
              <ButtonLink cta={firstStep.primaryCta} />
              <ButtonLink cta={firstStep.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <CheckInDemo demo={firstStep.demo} href={firstStep.primaryCta.href} />
        </Split>
      </Band>

      {/* 03b · Meet Steward AI — the former hero, with its looping demo */}
      <section className="border-b">
        <div className={`${CONTAINER} py-16 text-center md:py-20`}>
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={2} accent className="mt-6 text-[clamp(2.4rem,5.2vw,3.75rem)] font-semibold leading-[1.05]" />
          {hero.subtitle ? <p className="mt-4 font-display text-[clamp(1.15rem,2vw,1.4rem)] italic text-muted-foreground">{keepTogether(hero.subtitle)}</p> : null}
          <Prose text={hero.body} className="mx-auto mt-5 max-w-[44.5rem] text-pretty text-[17px] leading-8 text-muted-foreground" />
          <Actions center>
            <ButtonLink cta={hero.secondaryCta} variant="outline" />
            <ButtonLink cta={hero.primaryCta} variant="gold" />
          </Actions>
          <LoopingVideo video={hero.video} label={hero.videoLabel} className="mx-auto mt-12 max-w-[1160px] text-left" />
        </div>
      </section>

      {/* 04 · Ways to Engage */}
      <Band tone="muted">
        <SectionIntro eyebrow={engage.eyebrow} title={engage.title} body={engage.body} className="max-w-3xl" />
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {engage.cards.map((card) => (
            <li key={card.id}>
              <Link
                href={card.href}
                className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card no-underline transition-colors hover:border-gold"
              >
                <MediaFrame
                  media={card.image}
                  ratio="3/2"
                  rounded="rounded-none"
                  sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
                  className={card.image.fit === "contain" ? "bg-[radial-gradient(circle_at_50%_40%,#f7f1e6,#ebe3d4)] dark:bg-[radial-gradient(circle_at_50%_40%,#2a2622,#1a1816)]" : undefined}
                  imageClassName={card.image.fit === "contain" ? "p-3 drop-shadow-[0_10px_18px_rgba(20,18,17,0.25)]" : undefined}
                />
                <span className="flex flex-1 flex-col p-5">
                  <span className="text-[12px] font-bold uppercase tracking-[0.14em] text-gold-deep dark:text-gold-light">{keepTogether(card.title)}</span>
                  <span className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(card.body)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Actions>
          <ButtonLink cta={engage.primaryCta} />
          <ButtonLink cta={engage.secondaryCta} variant="outline" />
        </Actions>
      </Band>

      {/* 05 · Personal Blueprint */}
      <Band>
        <Split>
          <div>
            <SectionIntro eyebrow={blueprint.eyebrow} title={blueprint.title} body={blueprint.body} />
            <Actions>
              <ButtonLink cta={blueprint.primaryCta} />
              <ButtonLink cta={blueprint.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <div className="grid grid-cols-[1.3fr_1fr] items-end gap-4">
            <MediaFrame media={blueprint.cover} ratio="3/4" sizes="(min-width: 1024px) 300px, 55vw" />
            <div className="grid gap-4">
              <MediaFrame media={blueprint.northStar} ratio="1/1" sizes="(min-width: 1024px) 230px, 40vw" />
              <MediaFrame media={blueprint.interior} ratio="1/1" sizes="(min-width: 1024px) 230px, 40vw" />
            </div>
          </div>
        </Split>
      </Band>

      {/* 06 · Meet Steward */}
      <Band tone="dark">
        <Split>
          <div>
            <SectionIntro eyebrow={steward.eyebrow} title={steward.title} lead={steward.lead} body={steward.body} />
            <Actions>
              <ButtonLink cta={steward.primaryCta} variant="gold" />
              <ButtonLink cta={steward.secondaryCta} variant="ghost" />
            </Actions>
          </div>
          <ChatMock messages={steward.messages} proposal={steward.proposal} heading="Steward · Guide conversation" />
        </Split>
      </Band>

      {/* 07 · Grow Together */}
      <Band>
        <Split reverse>
          <div>
            <SectionIntro eyebrow={grow.eyebrow} title={grow.title} body={grow.body} />
            <Actions>
              <ButtonLink cta={grow.primaryCta} />
              <ButtonLink cta={grow.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MediaFrame media={grow.photo} ratio="16/9" className="col-span-2" />
            <MediaFrame media={grow.secondPhoto} ratio="4/3" sizes="(min-width: 1024px) 260px, 50vw" />
            <MediaFrame media={grow.thirdPhoto} ratio="4/3" sizes="(min-width: 1024px) 260px, 50vw" />
          </div>
        </Split>
      </Band>

      {/* 08 · The Book */}
      <Band tone="muted">
        <Split>
          <div>
            <Eyebrow>{book.eyebrow}</Eyebrow>
            <Heading title={book.title} className="mt-3 text-[clamp(2rem,3.8vw,2.75rem)] font-semibold" />
            {book.subtitle ? <p className="mt-3 font-display text-xl italic text-muted-foreground">{keepTogether(book.subtitle)}</p> : null}
            <Prose text={book.body} className="mt-5 text-base leading-7 text-muted-foreground" />
            <Actions>
              <ButtonLink cta={book.primaryCta} />
              <ButtonLink cta={book.secondaryCta} variant="gold" />
            </Actions>
          </div>
          <div className="flex justify-center">
            <Book3D model={book.model} fallback={book.cover} className="w-full max-w-[420px]" />
          </div>
        </Split>
      </Band>

      {/* 09 · Michael */}
      <Band flush>
        <Split align="end" className="md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="flex justify-center md:justify-start">
            <MediaFrame
              media={michael.photo}
              ratio="4/5"
              rounded="rounded-none"
              fit="contain"
              className="w-full max-w-[320px] bg-transparent"
              imageClassName="object-bottom"
              sizes="320px"
            />
          </div>
          <div className="pb-16 md:pb-[72px]">
            <SectionIntro eyebrow={michael.eyebrow} title={michael.title} body={michael.body} />
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {michael.links.map((l) => (
                <TextLink key={l.id} cta={l} />
              ))}
            </div>
          </div>
        </Split>
      </Band>

      {/* 10 · Stay Connected */}
      <Band tone="dark" id="join">
        <Split className="md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <Eyebrow>{join.eyebrow}</Eyebrow>
            <Heading title={join.title} level={2} accent className="mt-3" />
            {join.lead ? <p className="mt-5 text-lg font-medium">{join.lead}</p> : null}
            <Prose text={join.body} className="mt-3 text-base leading-7 text-band-text" />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <JoinJourneyForm content={joinForm} source="homepage" />
          </div>
        </Split>
      </Band>
    </>
  );
}

