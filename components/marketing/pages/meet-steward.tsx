// /meet-steward (steward.dc.html) — explains Steward; /steward is the app itself.
// The paid card's price comes from the live catalogue, never from content.

import { getScopeContent } from "@/lib/marketing/content/read";
import { pageMeetSteward } from "@/lib/marketing/content/scopes/page-meet-steward";
import { formatPrice, listAllOffers, type StewardOffer } from "@/lib/steward/catalogue";
import { ChatMock } from "../chat-mock";
import { Actions, Band, ButtonLink, Eyebrow, Heading, Prose, SectionIntro, Split, StatusPill, TextLink, keepTogether } from "../primitives";
import { LoopingVideo } from "../video";

/** "From $19/mo" — the lowest price on sale right now, straight from the catalogue. */
async function startingPrice(): Promise<string | null> {
  const offers: StewardOffer[] = await listAllOffers().catch(() => []);
  const onSale = offers.filter((o) => o.production_enabled && !o.is_historical_record && o.price_minor > 0 && o.eligible_roles.length === 0);
  if (!onSale.length) return null;
  const cheapest = onSale.reduce((a, b) => (b.price_minor < a.price_minor ? b : a));
  const suffix = cheapest.billing === "RECURRING" ? (cheapest.interval === "YEAR" ? "/yr" : "/mo") : "";
  return `From ${formatPrice(cheapest.price_minor, cheapest.currency).replace(/\.00$/, "")}${suffix}`;
}

export async function MeetStewardPage() {
  const [{ hero, helps, demo, control, access }, from] = await Promise.all([getScopeContent(pageMeetSteward), startingPrice()]);

  return (
    <>
      {/* Hero */}
      <Band>
        <Split>
          <div>
            <Eyebrow pill>{hero.eyebrow}</Eyebrow>
            <Heading title={hero.title} level={1} className="mt-6" />
            {hero.lead ? <p className="mt-5 font-display text-[clamp(1.15rem,2vw,1.4rem)] italic text-foreground">{hero.lead}</p> : null}
            <Prose text={hero.body} className="mt-5 text-[17px] leading-8 text-muted-foreground" />
            <Actions>
              <ButtonLink cta={hero.primaryCta} />
              <ButtonLink cta={hero.secondaryCta} variant="outline" />
            </Actions>
          </div>
          <ChatMock messages={hero.messages} proposal={hero.proposal} heading={hero.chatHeading} tone="light" />
        </Split>
      </Band>

      {/* What It Helps With */}
      <Band tone="muted">
        <SectionIntro eyebrow={helps.eyebrow} title={helps.title} className="max-w-3xl" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {helps.items.map((item) => (
            <div key={item.id} className="rounded-xl border bg-card p-5">
              <p className="font-display text-lg leading-snug">{keepTogether(item.title)}</p>
              <p className="mt-2 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(item.body)}</p>
            </div>
          ))}
        </div>
        <Actions>
          <ButtonLink cta={helps.cta} />
        </Actions>
      </Band>

      {/* Demo */}
      <Band id="demo">
        <Split>
          <div>
            <SectionIntro eyebrow={demo.eyebrow} title={demo.title} body={demo.body} />
            <TextLink cta={demo.link} className="mt-6" />
          </div>
          <LoopingVideo video={demo.video} label={demo.videoLabel} />
        </Split>
      </Band>

      {/* Your Control + plain AI disclosure */}
      <Band tone="dark">
        <Split align="start">
          <div>
            <SectionIntro eyebrow={control.eyebrow} title={control.title} body={control.body} />
            <TextLink cta={control.link} className="mt-6" />
          </div>
          <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-light">{control.disclosureLabel}</p>
            <p className="mt-3 text-pretty font-display text-[1.35rem] leading-snug text-band-text">{control.disclosureTitle}</p>
            <Prose text={control.disclosureBody} className="mt-4 text-[15px] leading-7 text-band-muted" />
          </aside>
        </Split>
      </Band>

      {/* Access */}
      <Band id="access">
        <Split align="start">
          <SectionIntro eyebrow={access.eyebrow} title={access.title} body={access.body} />
          <div className="space-y-4">
            {[
              { plan: access.free, tone: "live" as const, price: null, variant: "primary" as const },
              { plan: access.paid, tone: "soon" as const, price: from, variant: "gold" as const },
            ].map(({ plan, tone, price, variant }) => (
              <div key={plan.title} className="rounded-xl border bg-card p-5 sm:p-6">
                <StatusPill tone={tone}>{plan.label}</StatusPill>
                <p className="mt-4 font-display text-lg leading-snug">{keepTogether(plan.title)}</p>
                <p className="mt-1 text-pretty text-[14.5px] leading-relaxed text-muted-foreground">{keepTogether(plan.body)}</p>
                {price ? <p className="mt-2 text-[14px] font-semibold">{price}</p> : null}
                <Actions className="mt-5">
                  <ButtonLink cta={plan.cta} variant={variant} />
                </Actions>
              </div>
            ))}
          </div>
        </Split>
      </Band>
    </>
  );
}
