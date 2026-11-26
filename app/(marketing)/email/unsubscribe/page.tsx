import type { Metadata } from "next";
import Link from "next/link";
import { maskEmail, verifyUnsubscribe } from "@/lib/email/unsubscribe-token";
import { UnsubscribeConfirm } from "@/components/marketing/unsubscribe-confirm";
import { CONTAINER } from "@/components/marketing/primitives";

// The page behind the "Unsubscribe" link in marketing-series emails. Opening it
// changes nothing; the button posts to /api/public/email/unsubscribe.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

const SERIES: Record<string, string> = { annual_retreat: "Annual Retreat Guide follow-up emails and occasional Stewardship Blueprint reflections" };

export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const parsed = verifyUnsubscribe(t);
  return (
    <section className={`${CONTAINER} max-w-xl py-16 sm:py-24`}>
      <h1 className="font-display text-3xl font-medium sm:text-4xl">Unsubscribe</h1>
      {parsed ? (
        <>
          <p className="mt-4 text-pretty text-[16px] leading-relaxed text-muted-foreground">
            Stop sending <strong className="text-foreground">{SERIES[parsed.scope]}</strong> to <strong className="text-foreground">{maskEmail(parsed.email)}</strong>?
          </p>
          <UnsubscribeConfirm token={t!} />
          <p className="mt-6 text-sm text-muted-foreground">
            Your free guide stays yours: the download link keeps working. To change other email preferences, visit{" "}
            <Link href="/email/opt-out" className="underline underline-offset-2">
              Email Preferences
            </Link>
            .
          </p>
        </>
      ) : (
        <p className="mt-4 text-[16px] text-muted-foreground">
          This unsubscribe link isn&apos;t valid or is incomplete. You can unsubscribe from any MJG email on the{" "}
          <Link href="/email/opt-out" className="underline underline-offset-2">
            Email Preferences
          </Link>{" "}
          page.
        </p>
      )}
    </section>
  );
}
