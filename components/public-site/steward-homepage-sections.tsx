import Link from "next/link";
import { ArrowRight, BookOpen, Check, MessageCircle, Sparkles, Users } from "lucide-react";
import { JoinTheJourney } from "@/components/public-site/join-the-journey";
import { SITE_CONTENT_BOX } from "@/components/public-site/site-shell";
import { StewardHomepageLead } from "@/components/public-site/steward-homepage-lead";
import { BLUEPRINT_PAGES, CONVERSATION_CHOICES, FREE_PAGES } from "@/lib/steward/blueprint";

// Everything on the homepage below the animation.
//
// Shared, because the two candidates being reviewed differ ONLY in how the
// animation is driven — one plays itself, one is scrubbed by the scrollbar. If
// the body were duplicated per candidate, a copy fix during review would land
// on one of them and the comparison would quietly stop being a comparison.
//
// Order: the live homepage's opening (headline, positioning, the video) comes
// first, directly under the demo, so the page runs show → tell → detail. The
// sign-up closes it, just above the footer.
//
// NOTE ON THE HEADLINE. "What Kind of Life Are You Actually Building?" lives
// here, in StewardHomepageLead, and nowhere else. The animation heroes above
// deliberately carry no <h1> of their own: when both had one the page opened
// with the same sentence twice, sixty pixels apart.

function Section({
  eyebrow,
  title,
  children,
  tint,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  tint?: boolean;
}) {
  return (
    <section className={tint ? "border-y bg-muted/30" : undefined}>
      <div className={`${SITE_CONTENT_BOX} py-16 md:py-20`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl leading-tight md:text-4xl">{title}</h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export function StewardHomepageSections() {
  // The real thirteen, from the constants the product uses. Writing them out
  // again here would be a second source that drifts.
  const pages = BLUEPRINT_PAGES;
  const freePages = FREE_PAGES;

  return (
    <>
      <StewardHomepageLead />

      {/* ── Steward ───────────────────────────────────────────────────────── */}
      <Section eyebrow="How Steward works" title="It proposes. You decide what's true.">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <p className="max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Steward is an AI guide grounded in the Christian Stewardship Blueprint framework. It
              helps you think, and it writes nothing about your life that you have not approved
              word for word.
            </p>

            <div className="mt-7 space-y-4">
              {CONVERSATION_CHOICES.map((choice) => (
                <div key={choice.key} className="flex gap-3.5">
                  <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#b88a4a]" />
                  <div>
                    <p className="font-semibold">{choice.label}</p>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-muted-foreground">
                      {choice.blurb}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:inline-grid sm:w-auto sm:grid-cols-2">
              <Link
                href="/steward"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#b88a4a] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a67c42]"
              >
                Talk to Steward <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/steward/pricing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-5 py-2.5 text-sm font-semibold no-underline transition-colors hover:bg-muted"
              >
                See the plans
              </Link>
            </div>
          </div>

          {/* The one rule worth putting in a box on a marketing page, because it
              is the thing that makes the product trustworthy. */}
          <aside className="rounded-2xl border border-[#b88a4a]/40 bg-[#b88a4a]/[0.06] p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#b88a4a]">
              How anything gets written
            </p>
            <p className="mt-3 font-serif text-xl leading-snug">
              Steward proposes the words. You approve them. Only then is anything saved.
            </p>
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              It cannot write to your Blueprint on its own, change your plan, send anything, or
              delete anything — not because it is told not to, but because it has no way to.
            </p>
          </aside>
        </div>
      </Section>

      {/* ── The Blueprint ─────────────────────────────────────────────────── */}
      <Section
        eyebrow="The Personal Stewardship Blueprint"
        title="Thirteen pages. One living decision guide."
        tint
      >
        <p className="max-w-2xl text-[16px] leading-relaxed text-muted-foreground">
          Not a worksheet you finish and file. A record of what you actually stand on, what you are
          protecting, and the one next step that matters — kept honest about what you have and have
          not worked through.
        </p>

        <ol className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <li key={page.slug} className="flex gap-3 text-[14.5px]">
              <span className="w-5 shrink-0 text-right font-serif tabular-nums text-muted-foreground">
                {page.number}
              </span>
              <span>{page.title}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-xl border bg-background p-6">
          <p className="font-semibold">Start free, with three real pages</p>
          <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            There are two depths and no middle edition. The Free Blueprint is genuinely useful on
            its own — a whole-life summary and one next faithful step:
          </p>
          <ul className="mt-4 space-y-2">
            {freePages.map((page) => (
              <li key={page.slug} className="flex gap-2.5 text-[14.5px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#b88a4a]" />
                <span>{page.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── Experiences ───────────────────────────────────────────────────── */}
      <Section eyebrow="Experiences" title="Nobody builds a life alone.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border bg-card p-6">
            <Users className="h-5 w-5 text-[#b88a4a]" />
            <h3 className="mt-3 font-serif text-xl">The 6-Week Challenge</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
              Six weeks, one theme at a time, with teaching and a weekly step. Built to be done
              alongside other people rather than alone.
            </p>
            <Link
              href="/6-week-challenge"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#b88a4a] no-underline hover:underline"
            >
              See the challenge <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <Sparkles className="h-5 w-5 text-[#b88a4a]" />
            <h3 className="mt-3 font-serif text-xl">Facilitator-led cohorts</h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">
              Churches, teams and small groups running the Blueprint together, with a facilitator
              guiding the weeks and tracking where everyone is.
            </p>
            <Link
              href="/contact"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#b88a4a] no-underline hover:underline"
            >
              Talk to us about a cohort <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── The Book ──────────────────────────────────────────────────────── */}
      <Section eyebrow="The Book" title="The Stewardship Blueprint" tint>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <p className="max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              The framework in full: what it means to steward a whole life — faith, relationships,
              health, joy, resources, habits, energy, influence and legacy — rather than optimise
              one corner of it.
            </p>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              It is being written now. Join the waitlist and you will hear first, including the
              chapters as they are ready.
            </p>
            <div className="mt-7 grid w-full grid-cols-1 gap-3 sm:inline-grid sm:w-auto">
              <Link
                href="/book-waitlist"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#b88a4a] px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-[#a67c42]"
              >
                <BookOpen className="h-4 w-4" /> Join the book waitlist
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Michael ───────────────────────────────────────────────────────── */}
      {/* Not the shared Section wrapper: this one has no bottom padding, because
          the photo is full-length and stands ON the section's floor. The live
          homepage does the same thing (main/index.html, `.author` has
          padding-bottom: 0 and `.author-avatar` is align-self: flex-end) and it
          is the difference between Michael standing in the section and Michael
          floating in it. Copy is his, verbatim from that page. */}
      <section className="border-y bg-muted/30">
        <div className={`${SITE_CONTENT_BOX} pt-16 md:pt-20`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
            Who&apos;s behind it
          </p>
          <div className="mt-6 grid items-end gap-8 md:grid-cols-[240px_1fr] md:gap-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/media/mike-gauthier-profile-photo.png"
              alt="Michael J. Gauthier"
              // Natural height, no crop — the whole photo, resting on the baseline.
              className="order-2 w-[200px] justify-self-center md:order-1 md:w-[240px] md:justify-self-start"
            />
            <div className="order-1 max-w-2xl pb-12 md:order-2 md:pb-20">
              <h2 className="font-serif text-3xl font-medium leading-tight md:text-4xl">
                Michael J. Gauthier
              </h2>
              <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Author &middot; Financial Planner &middot; Life Designer
              </p>
              <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
                In 2013, I stepped away from a secure career on Wall Street to pursue something more
                aligned with my values. That leap taught me that success without purpose is hollow
                &mdash; and that a meaningful life doesn&rsquo;t happen by accident.
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
                I&rsquo;m now writing The Stewardship Blueprint to share what I&rsquo;ve learned
                about designing a life that integrates faith, family, finances, and legacy into
                something whole.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                <Link href="/about" className="text-[#b88a4a] underline-offset-4 hover:underline">
                  Read My Story
                </Link>
                <Link href="/mission" className="text-[#b88a4a] underline-offset-4 hover:underline">
                  Our Mission
                </Link>
                <Link href="/contact" className="text-[#b88a4a] underline-offset-4 hover:underline">
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────────────────── */}
      <section className="border-t">
        <div className={`${SITE_CONTENT_BOX} py-16 text-center md:py-20`}>
          <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight md:text-4xl">
            Start where you actually are.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-muted-foreground">
            The Created for More check-in takes a few minutes and gives you somewhere honest to
            begin.
          </p>
          <div className="mt-8 mx-auto grid w-full max-w-[20rem] grid-cols-1 gap-3 sm:inline-grid sm:w-auto sm:max-w-none sm:grid-cols-2">
            <Link
              href="/created-for-more-check-in"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background no-underline transition-opacity hover:opacity-90"
            >
              Take the Created for More Check-In
            </Link>
            <Link
              href="/steward"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold no-underline transition-colors hover:bg-muted"
            >
              Talk to Steward
            </Link>
          </div>
        </div>
      </section>

      <JoinTheJourney />
    </>
  );
}

export default StewardHomepageSections;
