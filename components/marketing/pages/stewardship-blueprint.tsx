// /stewardship-blueprint (stewardship-blueprint.dc.html). The seven layer cards
// read the same Framework content as the temple and the homepage tabs, and each
// one is an anchor (#layer-1 … #layer-7) those link to.

import { getScopeContent } from "@/lib/marketing/content/read";
import { globalFramework, LAYER_KEYS } from "@/lib/marketing/content/scopes/global";
import { pageStewardshipBlueprint } from "@/lib/marketing/content/scopes/page-blueprint";
import { cn } from "@/lib/utils";
import { FrameworkTemple } from "../framework-temple";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, TextLink, keepTogether } from "../primitives";

/** "Bedrock — Faith & Identity" → "Faith & Identity" (the card already names the layer). */
function subtitleOf(title: string) {
  const i = title.indexOf("—");
  return i >= 0 ? title.slice(i + 1).trim() : title;
}

export async function StewardshipBlueprintPage() {
  const [{ hero, building, howToUse, faith }, { framework }] = await Promise.all([
    getScopeContent(pageStewardshipBlueprint),
    getScopeContent(globalFramework),
  ]);

  return (
    <>
      {/* Hero, with the building beneath it */}
      <Band>
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          <Prose text={hero.body} className="mx-auto mt-6 max-w-2xl text-[18px] leading-8 text-muted-foreground" />
          <Actions center>
            <ButtonLink cta={hero.primaryCta} />
          </Actions>
        </div>
        <div className="mx-auto mt-14 max-w-[620px]">
          <FrameworkTemple framework={framework} />
          <p className="mt-3 text-center text-[12px] text-muted-foreground">{framework.hint}</p>
        </div>
      </Band>

      {/* The Building — one card per layer */}
      <Band tone="muted">
        <SectionIntro eyebrow={building.eyebrow} title={building.title} body={building.body} className="max-w-3xl" />
        <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {LAYER_KEYS.map((key, i) => {
            const layer = framework.layers[key];
            return (
              <li
                key={key}
                id={`layer-${i + 1}`}
                className={cn(
                  "scroll-mt-24 rounded-xl border bg-card p-6 shadow-sm target:border-gold target:ring-2 target:ring-gold/30",
                  // Seven cards: the last one spans the row on large screens so the grid ends cleanly.
                  i === LAYER_KEYS.length - 1 && "lg:col-span-3",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-3xl tabular-nums text-gold">{layer.number}</span>
                  <span className="rounded-full border px-2.5 py-0.5 text-[11px] text-muted-foreground">{layer.part}</span>
                </div>
                <p className="mt-4 text-[11.5px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{layer.name}</p>
                <h3 className="mt-1.5 font-display text-xl font-medium leading-snug">{subtitleOf(layer.title)}</h3>
                <p className="mt-3 text-pretty text-[15px] leading-7 text-muted-foreground">{keepTogether(layer.body)}</p>
              </li>
            );
          })}
        </ol>
        <Actions>
          <ButtonLink cta={building.primaryCta} />
          <ButtonLink cta={building.secondaryCta} variant="outline" />
        </Actions>
      </Band>

      {/* How to Use It */}
      <Band>
        <Split>
          <div>
            <SectionIntro eyebrow={howToUse.eyebrow} title={howToUse.title} body={howToUse.body} />
            <Actions>
              <ButtonLink cta={howToUse.primaryCta} />
              <ButtonLink cta={howToUse.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3">
            {howToUse.steps.map((step, i) => (
              <li
                key={step.id}
                className={cn(
                  "flex flex-col rounded-xl border p-5",
                  step.highlight ? "border-gold bg-gold/10" : "bg-card",
                )}
              >
                <span className="font-display text-sm tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="mt-6 text-[11.5px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{step.label}</span>
                <span className="mt-1.5 text-pretty font-display text-lg leading-snug">{keepTogether(step.text)}</span>
              </li>
            ))}
          </ol>
        </Split>
      </Band>

      {/* Faith & Welcome */}
      <Band tone="dark">
        <div className="mx-auto max-w-3xl text-center">
          <SectionIntro eyebrow={faith.eyebrow} title={faith.title} body={faith.body} center />
          <TextLink cta={faith.link} className="mt-7" />
        </div>
      </Band>
    </>
  );
}
