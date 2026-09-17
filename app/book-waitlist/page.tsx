import type { Metadata } from "next";
import { SiteShell, SITE_CONTENT_BOX } from "@/components/public-site/site-shell";
import { BookWaitlistForm } from "@/components/book-waitlist/book-waitlist-form";
import { getCurrentProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Waitlist | The Life You're Building",
  description:
    "Be the first to know when The Life You're Building: How to Stop Drifting and Design a Life That Matters becomes available, along with early access to launch resources.",
};

export default async function BookWaitlistPage() {
  const profile = await getCurrentProfile().catch(() => null);
  const signedIn = Boolean(profile && profile.id !== "local-preview" && profile.email);

  return (
    <SiteShell>
      {/* Hero: copy on the left, the waitlist form on the right. The container is the same
          box as the nav bar, so the edges line up with the logo and the theme toggle. */}
      <section className={`${SITE_CONTENT_BOX} grid items-start gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14`}>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
            <span aria-hidden>✦</span> The Stewardship Blueprint
          </span>

          <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            The Life You&rsquo;re <em className="not-italic text-[#b88a4a]">Building</em>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            How to Stop Drifting and Design a Life That Matters — join the waitlist for launch day.
          </p>

          <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-7 text-muted-foreground">
            <p>
              Most people don&rsquo;t intentionally drift. Life simply gets full. <em>The Life You&rsquo;re Building</em> is
              the book behind the Stewardship Blueprint — a whole-life framework for stewarding what God has entrusted
              to you: your faith, relationships, health, joy, resources, habits, energy, influence, and the legacy your
              life is creating.
            </p>
            <p>
              Join the waitlist and you&rsquo;ll be the first to know when it&rsquo;s available, along with early access
              to launch resources.
            </p>
          </div>
        </div>

        <BookWaitlistForm
          signedIn={signedIn}
          defaults={
            signedIn
              ? { firstName: profile!.firstName, lastName: profile!.lastName, email: profile!.email }
              : undefined
          }
        />
      </section>
    </SiteShell>
  );
}
