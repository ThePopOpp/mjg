// /start (start.dc.html): five paths in, one faithful next step out.

import Link from "next/link";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageStart } from "@/lib/marketing/content/scopes/page-start";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, keepTogether } from "../primitives";

export async function StartPage() {
  const { hero, paths, reassurance } = await getScopeContent(pageStart);

  return (
    <>
      <Band>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          <Prose text={hero.body} className="mx-auto mt-6 max-w-2xl text-[18px] leading-8 text-muted-foreground" />
          <Actions center>
            <ButtonLink cta={hero.primaryCta} />
          </Actions>
        </div>
      </Band>

      {/* Choose a Path */}
      <Band tone="muted">
        <SectionIntro eyebrow={paths.eyebrow} title={paths.title} className="max-w-3xl" />
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {paths.cards.map((card) => (
            <li key={card.id} className="min-w-0">
              <Link
                href={card.href || "#"}
                className="group flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition hover:border-gold hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span className="font-display text-2xl tabular-nums text-gold">{card.label}</span>
                <h3 className="mt-4 text-pretty font-display text-lg font-medium leading-snug">{keepTogether(card.title)}</h3>
                <p className="mt-2 flex-1 text-pretty text-[14.5px] leading-6 text-muted-foreground">{keepTogether(card.body)}</p>
                {card.cta ? (
                  <span className="mt-5 text-sm font-semibold text-gold-deep group-hover:underline dark:text-gold-light">
                    {card.cta} →
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ol>
      </Band>

      {/* Reassurance */}
      <Band tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <SectionIntro eyebrow={reassurance.eyebrow} title={reassurance.title} body={reassurance.body} center />
          <Actions center>
            <ButtonLink cta={reassurance.primaryCta} variant="gold" />
          </Actions>
        </div>
      </Band>
    </>
  );
}
