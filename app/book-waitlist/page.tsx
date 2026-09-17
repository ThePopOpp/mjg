import type { Metadata } from "next";
import { PilotShell } from "@/components/pilot/pilot-shell";
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
    <PilotShell
      heroVariant="centered"
      eyebrow="The Stewardship Blueprint"
      title="The Life You're Building"
      description="How to Stop Drifting and Design a Life That Matters — join the waitlist for launch day."
    >
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4 text-center text-[15px] leading-7 text-muted-foreground">
          <p>
            Most people don&rsquo;t intentionally drift. Life simply gets full. <em>The Life You&rsquo;re Building</em> is the
            book behind the Stewardship Blueprint — a whole-life framework for stewarding what God has entrusted to you:
            your faith, relationships, health, joy, resources, habits, energy, influence, and the legacy your life is
            creating.
          </p>
          <p>
            Join the waitlist and you&rsquo;ll be the first to know when it&rsquo;s available, along with early access to
            launch resources.
          </p>
        </div>

        <BookWaitlistForm
          signedIn={signedIn}
          defaults={
            signedIn
              ? { firstName: profile!.firstName, lastName: profile!.lastName, email: profile!.email }
              : undefined
          }
        />
      </div>
    </PilotShell>
  );
}
