// /personal-blueprint (personal-blueprint.dc.html). The page list and the sample
// pages read BLUEPRINT_PAGES — the same thirteen pages Steward builds — so the
// site can never describe a Blueprint the product does not make.

import { getScopeContent } from "@/lib/marketing/content/read";
import { pagePersonalBlueprint } from "@/lib/marketing/content/scopes/page-blueprint";
import { formatPrice, listAllOffers, type StewardOffer } from "@/lib/steward/catalogue";
import { BLUEPRINT_PAGES } from "@/lib/steward/blueprint";
import { MediaFrame, MockArt } from "../media";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, StatusPill, TextLink, keepTogether } from "../primitives";

/** "From $19/mo" — the lowest price on sale right now, straight from the catalogue. */
async function startingPrice(): Promise<string | null> {
  const offers: StewardOffer[] = await listAllOffers().catch(() => []);
  const onSale = offers.filter((o) => o.production_enabled && !o.is_historical_record && o.price_minor > 0 && o.eligible_roles.length === 0);
  if (!onSale.length) return null;
  const cheapest = onSale.reduce((a, b) => (b.price_minor < a.price_minor ? b : a));
  const suffix = cheapest.billing === "RECURRING" ? (cheapest.interval === "YEAR" ? "/yr" : "/mo") : "";
  // Whole-dollar prices read as "$19", not "$19.00".
  return `From ${formatPrice(cheapest.price_minor, cheapest.currency).replace(/\.00$/, "")}${suffix}`;
}

export async function PersonalBlueprintPage() {
  const [{ hero, includes, process, path }, from] = await Promise.all([getScopeContent(pagePersonalBlueprint), startingPrice()]);

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
          <div className="grid grid-cols-[1.3fr_1fr] items-end gap-4">
            <MediaFrame media={hero.image} ratio="3/4" priority sizes="(min-width: 1024px) 300px, 55vw" />
            <MediaFrame media={hero.secondImage} ratio="4/5" sizes="(min-width: 1024px) 230px, 40vw" />
          </div>
        </Split>
      </Band>

      {/* What It Includes */}
      <Band tone="muted" id="sample">
        <Split align="start">
          <div>
            <SectionIntro eyebrow={includes.eyebrow} title={includes.title} body={includes.body} />
            <TextLink cta={includes.link} className="mt-6" />
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{includes.pagesLabel}</p>
            <ol className="mt-3 grid gap-x-6 sm:grid-cols-2">
              {BLUEPRINT_PAGES.map((page) => (
                <li key={page.slug} className="flex items-baseline gap-3 border-b py-2.5 text-[14.5px]">
                  <span className="w-6 shrink-0 font-display tabular-nums text-gold">{String(page.number).padStart(2, "0")}</span>
                  <span>{keepTogether(page.title)}</span>
                </li>
              ))}
            </ol>
          </div>
        </Split>

        <div className="mt-14 flex items-baseline justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{includes.galleryLabel}</p>
          <p className="text-[12.5px] text-muted-foreground">
            Scroll to see all {BLUEPRINT_PAGES.length} <span aria-hidden>→</span>
          </p>
        </div>
        {/* A row of pages to scroll through; on large screens the first five fit without scrolling. */}
        <div className="-mx-5 mt-4 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:px-8 [scrollbar-width:thin]">
          <ol className="flex snap-x snap-mandatory gap-4">
            {BLUEPRINT_PAGES.map((page) => (
              <li key={page.slug} className="w-[184px] shrink-0 snap-start sm:w-[200px]">
                <MockArt
                  mock={{ variant: "blueprint-page", title: page.title, subtitle: `Page ${page.number}` }}
                  ratio="letter"
                  className="rounded-md"
                />
              </li>
            ))}
          </ol>
        </div>
      </Band>

      {/* Building Process */}
      <Band>
        <SectionIntro eyebrow={process.eyebrow} title={process.title} className="max-w-3xl" />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {process.steps.map((step, i) => (
            <li key={step.id} className="rounded-xl border bg-card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-background">{i + 1}</span>
              <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.14em] text-gold-deep dark:text-gold-light">{keepTogether(step.title)}</p>
              <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(step.body)}</p>
            </li>
          ))}
        </ol>
        <Actions>
          <ButtonLink cta={process.primaryCta} />
          <ButtonLink cta={process.secondaryCta} variant="outline" />
        </Actions>
      </Band>

      {/* Choosing a Path */}
      <Band className="border-t">
        <Split>
          <div>
            <SectionIntro eyebrow={path.eyebrow} title={path.title} body={path.body} />
            <Actions>
              <ButtonLink cta={path.primaryCta} />
              <ButtonLink cta={path.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <div className="space-y-3">
            {[
              { option: path.free, tone: "live" as const, price: null },
              { option: path.paid, tone: "soon" as const, price: from },
            ].map(({ option, tone, price }) => (
              <div key={option.title} className="flex items-start justify-between gap-4 rounded-xl border bg-card p-5">
                <div>
                  <p className="font-display text-lg leading-snug">{keepTogether(option.title)}</p>
                  <p className="mt-1 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(option.body)}</p>
                  {price ? <p className="mt-2 text-[14px] font-semibold">{price}</p> : null}
                </div>
                <StatusPill tone={tone}>{option.pill}</StatusPill>
              </div>
            ))}
          </div>
        </Split>
      </Band>
    </>
  );
}
