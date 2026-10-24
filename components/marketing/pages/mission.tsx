// /mission (mission.dc.html).

import { getScopeContent } from "@/lib/marketing/content/read";
import { pageMission } from "@/lib/marketing/content/scopes/page-mission";
import { Actions, Band, ButtonLink, Eyebrow, Heading, PillCloud, Prose, SectionIntro, Split, keepTogether } from "../primitives";

export async function MissionPage() {
  const { hero, why, convictions, vision, welcome } = await getScopeContent(pageMission);
  const reach = vision.reach.split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <>
      {/* Hero */}
      <Band tone="dark">
        <div className="max-w-3xl">
          <Eyebrow pill>{hero.eyebrow}</Eyebrow>
          <Heading title={hero.title} level={1} className="mt-6" />
          <Prose text={hero.lead} className="mt-6 font-display text-[22px] leading-snug text-gold-light" />
          <Prose text={hero.body} className="mt-5 text-[17px] leading-8 text-band-text" />
          <Actions>
            <ButtonLink cta={hero.primaryCta} variant="gold" />
          </Actions>
        </div>
      </Band>

      {/* Why It Exists */}
      <Band>
        <Split>
          <SectionIntro eyebrow={why.eyebrow} title={why.title} body={why.body} />
          <div className="grid gap-4">
            <div className="rounded-xl border bg-card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{keepTogether(why.scoreboard.title)}</p>
              <p className="mt-3 text-pretty text-[16px] leading-relaxed text-muted-foreground">{keepTogether(why.scoreboard.text)}</p>
            </div>
            <div className="rounded-xl border-2 border-gold bg-card p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{keepTogether(why.purpose.title)}</p>
              <p className="mt-3 text-pretty font-display text-xl leading-snug">{keepTogether(why.purpose.text)}</p>
            </div>
          </div>
        </Split>
      </Band>

      {/* Our Convictions */}
      <Band tone="muted">
        <SectionIntro eyebrow={convictions.eyebrow} title={convictions.title} className="max-w-3xl" />
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {convictions.items.map((c, i) => (
            <li key={c.id} className="rounded-xl border bg-card p-6">
              <span className="font-display text-2xl tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-lg leading-snug">{keepTogether(c.title)}</p>
              <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(c.body)}</p>
            </li>
          ))}
        </ol>
        <Actions>
          <ButtonLink cta={convictions.cta} />
        </Actions>
      </Band>

      {/* Our Vision */}
      <Band>
        <Split>
          <div>
            <SectionIntro eyebrow={vision.eyebrow} title={vision.title} body={vision.body} />
            <Actions>
              <ButtonLink cta={vision.primaryCta} />
              <ButtonLink cta={vision.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <PillCloud items={reach} className="justify-center lg:justify-start" />
        </Split>
      </Band>

      {/* Welcome */}
      <Band className="border-t">
        <div className="mx-auto max-w-2xl text-center">
          <SectionIntro eyebrow={welcome.eyebrow} title={welcome.title} body={welcome.body} center />
          {welcome.closing ? <p className="mt-5 text-pretty font-display text-lg italic">{welcome.closing}</p> : null}
        </div>
      </Band>
    </>
  );
}
