import type { Metadata } from "next";
import Link from "next/link";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { listChallengeVideos } from "@/lib/six-week-challenge/repository";

export const metadata: Metadata = {
  title: "The Life You're Building — 6-Week Challenge",
  description:
    "Everything you need for the 6-Week Challenge: your dates, the Participant Guide, the weekly videos, the Created for More Check-In, and how to invite another man.",
};

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-black/10 py-10 first:border-t-0 dark:border-white/10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">{title}</h2>
      <div className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  );
}

function CTA({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith("http");
  const cls =
    "mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:opacity-90";
  return external ? (
    <a href={href} className={cls}>{children}</a>
  ) : (
    <Link href={href} className={cls}>{children}</Link>
  );
}

export const dynamic = "force-dynamic";

export default async function SixWeekChallengeHubPage() {
  const challengeVideos = await listChallengeVideos();
  return (
    <PilotShell
      eyebrow="The Life You're Building"
      title="The 6-Week Challenge"
      description="An honest six-week journey for men who are willing to slow down, look at the life they are actually building, and begin stewarding it with more purpose. Everything you need is right here."
      cta={{ href: "/created-for-more-check-in", label: "Start your Check-In" }}
    >
      <Section id="dates" eyebrow="Start Here" title="Protect the six weeks">
        <p>
          The challenge is six weekly sessions. The men who get the most out of it do one simple thing first: they put
          all six dates on the calendar before the busy weeks arrive. Add your group&rsquo;s dates now, then take the
          Created for More Check-In so you have an honest baseline going into Week 1.
        </p>
        <CTA href="/created-for-more-check-in">Complete your BEFORE Check-In</CTA>
      </Section>

      <Section id="guide" eyebrow="Your Materials" title="The Participant Guide">
        <p>
          Your Participant Guide carries the weekly reading, reflection, and pre-work. Take 15&ndash;20 quiet minutes with
          it before each session &mdash; the goal isn&rsquo;t to look impressive, it&rsquo;s to tell the truth about the
          life that&rsquo;s actually being built. If your group leader hasn&rsquo;t handed you a copy yet, ask them for the
          guide and the group covenant.
        </p>
      </Section>

      <Section id="videos" eyebrow="Watch" title="The weekly videos">
        <p>
          A short teaching video anchors each week. Watch this week&rsquo;s video before your session (or your group will
          watch it together), then come ready to be honest.
        </p>
        <ul className="mt-4 grid gap-1.5">
          {challengeVideos.map((v) => (
            <li key={v.slug}>
              <Link href={`/6-week-challenge/videos/${v.slug}`} className="text-foreground underline-offset-2 hover:text-primary hover:underline">
                {v.badge} &mdash; {v.title}
              </Link>
            </li>
          ))}
        </ul>
        <CTA href="/6-week-challenge/videos">Open the video library</CTA>
      </Section>

      <Section id="invite" eyebrow="Multiply" title="Invite a man">
        <p>
          There may be a man in your life who is quietly drifting or carrying pressure alone. Your invitation may be the
          thing that helps him begin. You don&rsquo;t need to be an expert &mdash; just be honest about what helped you and
          willing to open the door. Share the invitation video with him, or reach out and ask him personally.
        </p>
        <CTA href="/6-week-challenge/videos/invitation">Share the invitation video</CTA>
      </Section>

      <Section id="book" eyebrow="Go Deeper" title="The Life You're Building — book updates">
        <p>
          The book goes deeper into this framework through story, Scripture, reflection, and practical action. Join the
          updates list for tools, previews, and behind-the-scenes pieces as it comes together. To be added, reply to any
          challenge email with &ldquo;book&rdquo; and we&rsquo;ll add you to the list.
        </p>
      </Section>

      <Section id="forgedlife" eyebrow="Keep Building" title="ForgedLife">
        <p>
          ForgedLife supports the habits, prayer, challenges, and group follow-through that keep transformation going
          after the six weeks. Early access is opening soon &mdash; reply to any challenge email with &ldquo;ForgedLife&rdquo;
          to be notified first.
        </p>
      </Section>

      <Section id="feedback" eyebrow="Help Us Build" title="Share your feedback">
        <p>
          Your honest feedback shapes future groups. What worked, what confused you, what should change, and what actually
          moved in your life &mdash; all of it helps. The simplest way to share is to reply directly to any challenge email;
          it comes straight to us.
        </p>
      </Section>
    </PilotShell>
  );
}
