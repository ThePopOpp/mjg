// /the-life-youre-building (the-life-youre-building.dc.html). The book is not
// published yet, so every path leads to the waitlist; nothing here claims sales,
// reviews or availability.

import Link from "next/link";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageBook } from "@/lib/marketing/content/scopes/page-book";
import { Book3D } from "../book-3d";
import { MediaFrame } from "../media";
import { Actions, Band, ButtonLink, CONTAINER, Eyebrow, Heading, Prose, SectionIntro, Split, TextLink, keepTogether } from "../primitives";

export async function BookPage() {
  const { hero, inside, author, deeper } = await getScopeContent(pageBook);

  return (
    <>
      {/* Hero — the dark band, with the book turning beside the title */}
      <section className="dark-band bg-band text-[#f4f1ea]">
        <div className={`${CONTAINER} py-16 md:py-20`}>
          <Split>
            <div>
              <Eyebrow pill>{hero.eyebrow}</Eyebrow>
              <Heading title={hero.title} level={1} className="mt-6" />
              {hero.subtitle ? <p className="mt-4 text-pretty font-display text-[clamp(1.1rem,1.65vw,1.3rem)] italic text-band-text">{keepTogether(hero.subtitle)}</p> : null}
              <Prose text={hero.body} className="mt-6 max-w-xl text-[17px] leading-8 text-band-text" />
              <Actions>
                <ButtonLink cta={hero.primaryCta} variant="gold" />
              </Actions>
              {hero.byline ? <p className="mt-5 text-[13px] font-medium uppercase tracking-[0.16em] text-band-muted">{hero.byline}</p> : null}
            </div>
            <div className="flex justify-center">
              <Book3D model={hero.model} fallback={hero.cover} className="w-full max-w-[440px]" />
            </div>
          </Split>
        </div>
      </section>

      {/* Inside the Book */}
      <Band id="inside">
        <Split>
          <div>
            <SectionIntro eyebrow={inside.eyebrow} title={inside.title} body={inside.body} />
            <TextLink cta={inside.link} className="mt-6" />
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{inside.partsLabel}</p>
            <ol className="mt-4 divide-y">
              {inside.parts.map((part) => (
                <li key={part.id} className="flex gap-4 py-3.5 first:pt-1 last:pb-0">
                  <span className="w-9 shrink-0 font-display text-lg tabular-nums text-gold">{part.number}</span>
                  <span>
                    <span className="block font-display text-[17px] font-medium leading-snug">{keepTogether(part.title)}</span>
                    <span className="mt-0.5 block text-pretty text-[14px] leading-relaxed text-muted-foreground">{keepTogether(part.body)}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Split>
      </Band>

      {/* Author note — the portrait sits on the section's bottom edge */}
      <Band tone="muted" flush>
        <Split align="end" className="md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="flex justify-center md:justify-start">
            <MediaFrame
              media={author.photo}
              ratio="4/5"
              rounded="rounded-none"
              fit="contain"
              className="w-full max-w-[340px] bg-transparent"
              imageClassName="object-bottom"
              sizes="340px"
            />
          </div>
          <div className="pb-16 md:pb-[72px]">
            <SectionIntro eyebrow={author.eyebrow} title={author.title} body={author.body} />
            <TextLink cta={author.link} className="mt-6" />
          </div>
        </Split>
      </Band>

      {/* Go Deeper */}
      <Band>
        <SectionIntro eyebrow={deeper.eyebrow} title={deeper.title} body={deeper.body} className="max-w-3xl" />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {deeper.steps.map((step, i) => (
            <li key={step.id}>
              <Link
                href={step.href || "#"}
                className="group flex h-full flex-col overflow-hidden rounded-xl border bg-card no-underline transition-colors hover:border-gold"
              >
                <MediaFrame
                  media={step.image}
                  ratio="4/3"
                  rounded="rounded-none"
                  sizes="(min-width: 1024px) 270px, (min-width: 640px) 50vw, 100vw"
                  className={step.image.fit === "contain" ? "bg-[radial-gradient(circle_at_50%_40%,#f7f1e6,#ebe3d4)] dark:bg-[radial-gradient(circle_at_50%_40%,#2a2622,#1a1816)]" : undefined}
                  imageClassName={step.image.fit === "contain" ? "p-4 drop-shadow-[0_10px_18px_rgba(20,18,17,0.25)]" : undefined}
                />
                <span className="flex flex-1 items-start gap-3 p-5">
                  <span className="font-display text-lg tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[15px] font-semibold">{keepTogether(step.title)}</span>
                    <span className="mt-0.5 block text-pretty text-[14px] text-muted-foreground">{keepTogether(step.body)}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <Actions className="lg:max-w-[52rem]">
          <ButtonLink cta={deeper.primaryCta} />
          <ButtonLink cta={deeper.secondaryCta} variant="outline" />
          <ButtonLink cta={deeper.waitlistCta} variant="gold" />
        </Actions>
      </Band>
    </>
  );
}
