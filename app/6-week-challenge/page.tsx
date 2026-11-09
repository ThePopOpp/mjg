import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CalendarCheck,
  Hammer,
  MessageSquareHeart,
  PlayCircle,
  Send,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SiteShell, SITE_CONTENT_BOX } from "@/components/public-site/site-shell";
import { Reveal, VideoSlider } from "@/components/six-week-challenge/hub-motion";
import { videoAvailability } from "@/components/six-week-challenge/availability-chip";
import { listChallengeVideos } from "@/lib/six-week-challenge/repository";

export const metadata: Metadata = {
  title: "The Life You're Building — 6-Week Challenge",
  description:
    "Everything you need for the 6-Week Challenge: your dates, the Participant Guide, the weekly videos, the Created for More Check-In, and how to invite another man.",
};

export const dynamic = "force-dynamic";

function CTA({ href, children, variant = "solid" }: { href: string; children: React.ReactNode; variant?: "solid" | "outline" }) {
  const cls =
    variant === "solid"
      ? "group/cta inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-all hover:opacity-90 motion-safe:active:scale-[0.98]"
      : "group/cta inline-flex items-center gap-2 rounded-md border bg-card px-5 py-2.5 text-sm font-semibold text-foreground no-underline transition-all hover:border-gold hover:text-gold motion-safe:active:scale-[0.98]";
  return (
    <Link href={href} className={cls}>
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover/cta:translate-x-1" />
    </Link>
  );
}

function IconBadge({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#b88a4a]/15 text-gold ring-1 ring-[#b88a4a]/25 transition-all duration-300 group-hover:bg-gold group-hover:text-white motion-safe:group-hover:-rotate-3 motion-safe:group-hover:scale-105">
      <Icon className="h-5 w-5" />
    </span>
  );
}

/** One card: icon, eyebrow, title, copy, and an optional action pinned to the bottom. */
function HubCard({
  id,
  icon,
  eyebrow,
  title,
  children,
  action,
}: {
  id: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className="group flex h-full scroll-mt-24 flex-col rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:border-[#b88a4a]/60 hover:shadow-md motion-safe:hover:-translate-y-1 sm:p-7"
    >
      <IconBadge icon={icon} />
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">{eyebrow}</p>
      <h2 className="mt-1.5 text-pretty font-serif text-2xl font-semibold leading-tight">{title}</h2>
      <div className="mt-3 flex-1 text-pretty text-[15px] leading-7 text-muted-foreground">{children}</div>
      {action ? <div className="mt-6">{action}</div> : null}
    </article>
  );
}

/** For the cards whose action is "reply to any challenge email with a word". */
function ReplyHint({ word }: { word: string }) {
  return (
    <p className="inline-flex items-center gap-2 rounded-md border border-dashed border-[#b88a4a]/50 bg-[#b88a4a]/[0.06] px-3 py-2 text-sm text-foreground">
      <Send className="h-4 w-4 text-gold" /> Reply to any challenge email with <strong className="font-semibold">&ldquo;{word}&rdquo;</strong>
    </p>
  );
}

export default async function SixWeekChallengeHubPage() {
  const challengeVideos = await listChallengeVideos();
  const sliderVideos = challengeVideos.map((v) => ({
    slug: v.slug,
    badge: v.badge,
    title: v.title,
    durationLabel: v.durationLabel ?? null,
    available: videoAvailability(v) === "available",
  }));

  return (
    <SiteShell>
      {/* Hero: a defined band with a soft gold glow, two ways in, and the shape of the six weeks. */}
      <section className={`${SITE_CONTENT_BOX} pt-8 md:pt-12`}>
        <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-12 shadow-sm sm:px-10 md:px-14 md:py-16">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#b88a4a]/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#b88a4a]/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 bg-background/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
              <span aria-hidden>✦</span> The Life You&rsquo;re Building
            </span>
            <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              The 6-Week <em className="not-italic text-gold">Challenge</em>
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              An honest six-week journey for men who are willing to slow down, look at the life they are actually building,
              and begin stewarding it with more purpose. Everything you need is right here.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CTA href="/created-for-more-check-in">Start your Check-In</CTA>
              <CTA href="/groups" variant="outline">Find a group</CTA>
            </div>
          </div>
          <dl className="relative mt-10 grid gap-3 border-t pt-8 sm:grid-cols-3">
            {[
              { icon: CalendarCheck, term: "6 weekly sessions", detail: "One honest step each week" },
              { icon: PlayCircle, term: "A short video", detail: "Anchors every session" },
              { icon: Users, term: "Walked together", detail: "In a small group of men" },
            ].map(({ icon: Icon, term, detail }) => (
              <div key={term} className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#b88a4a]/15 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <dt className="text-sm font-semibold">{term}</dt>
                  <dd className="text-sm text-muted-foreground">{detail}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className={`${SITE_CONTENT_BOX} space-y-16 py-14 md:space-y-20 md:py-20`}>
        {/* Getting started: three cards. */}
        <div className="grid gap-5 md:grid-cols-3">
          <Reveal className="h-full">
            <HubCard id="find-a-group" icon={Users} eyebrow="Join a Group" title="Find a group near you" action={<CTA href="/groups">Find a group</CTA>}>
              The challenge is built to be walked with other men. Browse the groups forming near you &mdash; see the day, time,
              area, and how many spots are left &mdash; and save your spot in one that fits your schedule.
            </HubCard>
          </Reveal>
          <Reveal className="h-full" delay={100}>
            <HubCard id="dates" icon={CalendarCheck} eyebrow="Start Here" title="Protect the six weeks" action={<CTA href="/created-for-more-check-in">Complete your BEFORE Check-In</CTA>}>
              The challenge is six weekly sessions. The men who get the most out of it do one simple thing first: they put all
              six dates on the calendar before the busy weeks arrive. Add your group&rsquo;s dates now, then take the Created for
              More Check-In so you have an honest baseline going into Week 1.
            </HubCard>
          </Reveal>
          <Reveal className="h-full" delay={200}>
            <HubCard id="guide" icon={BookOpen} eyebrow="Your Materials" title="The Participant Guide">
              Your Participant Guide carries the weekly reading, reflection, and pre-work. Take 15&ndash;20 quiet minutes with it
              before each session &mdash; the goal isn&rsquo;t to look impressive, it&rsquo;s to tell the truth about the life
              that&rsquo;s actually being built. If your group leader hasn&rsquo;t handed you a copy yet, ask them for the guide
              and the group covenant.
            </HubCard>
          </Reveal>
        </div>

        {/* The weekly videos: their own band, with a horizontal slider of small linked cards. */}
        <Reveal>
          <section id="videos" className="scroll-mt-24 rounded-3xl border bg-[#b88a4a]/[0.05] p-6 sm:p-8 md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                  <PlayCircle className="h-4 w-4" /> Watch
                </p>
                <h2 className="mt-1.5 font-serif text-3xl font-semibold">The weekly videos</h2>
                <p className="mt-3 text-pretty text-[15px] leading-7 text-muted-foreground">
                  A short teaching video anchors each week. Watch this week&rsquo;s video before your session (or your group will
                  watch it together), then come ready to be honest.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <VideoSlider videos={sliderVideos} />
            </div>
            <div className="mt-4">
              <CTA href="/6-week-challenge/videos">Open the video library</CTA>
            </div>
          </section>
        </Reveal>

        {/* Two pairs of columns. */}
        <div className="grid gap-5 md:grid-cols-2">
          <Reveal className="h-full">
            <HubCard id="invite" icon={Send} eyebrow="Multiply" title="Invite a man" action={<CTA href="/6-week-challenge/videos/invitation">Share the invitation video</CTA>}>
              There may be a man in your life who is quietly drifting or carrying pressure alone. Your invitation may be the thing
              that helps him begin. You don&rsquo;t need to be an expert &mdash; just be honest about what helped you and willing to
              open the door. Share the invitation video with him, or reach out and ask him personally.
            </HubCard>
          </Reveal>
          <Reveal className="h-full" delay={100}>
            <HubCard id="book" icon={BookMarked} eyebrow="Go Deeper" title="The Life You're Building — book updates" action={<ReplyHint word="book" />}>
              The book goes deeper into this framework through story, Scripture, reflection, and practical action. Join the
              updates list for tools, previews, and behind-the-scenes pieces as it comes together.
            </HubCard>
          </Reveal>
          <Reveal className="h-full">
            <HubCard id="forgedlife" icon={Hammer} eyebrow="Keep Building" title="ForgedLife" action={<ReplyHint word="ForgedLife" />}>
              ForgedLife supports the habits, prayer, challenges, and group follow-through that keep transformation going after
              the six weeks. Early access is opening soon &mdash; be the first to know.
            </HubCard>
          </Reveal>
          <Reveal className="h-full" delay={100}>
            <HubCard id="feedback" icon={MessageSquareHeart} eyebrow="Help Us Build" title="Share your feedback">
              Your honest feedback shapes future groups. What worked, what confused you, what should change, and what actually
              moved in your life &mdash; all of it helps. The simplest way to share is to reply directly to any challenge email; it
              comes straight to us.
            </HubCard>
          </Reveal>
        </div>
      </div>
    </SiteShell>
  );
}
