// /learn-and-grow (learn-and-grow.dc.html): the book, studies, and insights, then
// the one question that turns learning into action.

import Link from "next/link";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageLearn } from "@/lib/marketing/content/scopes/page-learn";
import { cn } from "@/lib/utils";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, keepTogether } from "../primitives";

export async function LearnAndGrowPage() {
  const { hero, featured, nextStep } = await getScopeContent(pageLearn);

  return (
    <>
      <Band>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          <Prose text={hero.body} className="mx-auto mt-6 max-w-2xl text-[18px] leading-8 text-muted-foreground" />
          <Actions center>
            <ButtonLink cta={hero.primaryCta} />
            <ButtonLink cta={hero.secondaryCta} variant="outline" />
          </Actions>
        </div>
      </Band>

      {/* Featured Learning */}
      <Band tone="muted">
        <SectionIntro eyebrow={featured.eyebrow} title={featured.title} className="max-w-3xl" />
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {featured.cards.map((card) => {
            // A cut-out (the book) sits on a dark panel; photos fill the frame.
            const cutout = card.image.fit === "contain";
            return (
              <li key={card.id} className="min-w-0">
                <Link
                  href={card.href || "#"}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-gold hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <div className={cn(cutout && "bg-band p-6")}>
                    <MediaFrame
                      media={card.image}
                      ratio="4/3"
                      rounded="rounded-none"
                      sizes="(min-width: 768px) 360px, 100vw"
                      className={cn(cutout && "bg-transparent")}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="text-[11.5px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{card.label}</span>
                    <h3 className="mt-1.5 text-pretty font-display text-xl font-medium leading-snug">{keepTogether(card.title)}</h3>
                    <p className="mt-3 flex-1 text-pretty text-[15px] leading-7 text-muted-foreground">{keepTogether(card.body)}</p>
                    {card.cta ? (
                      <span className="mt-5 text-sm font-semibold text-gold-deep group-hover:underline dark:text-gold-light">{card.cta}</span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Band>

      {/* Featured Next Step */}
      <Band tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <SectionIntro eyebrow={nextStep.eyebrow} title={nextStep.title} body={nextStep.body} center />
          <Actions center>
            <ButtonLink cta={nextStep.primaryCta} variant="gold" />
          </Actions>
        </div>
      </Band>
    </>
  );
}
