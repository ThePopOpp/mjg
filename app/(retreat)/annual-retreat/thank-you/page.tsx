import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MailCheck, MailWarning } from "lucide-react";
import { DownloadGuideButton } from "@/components/annual-retreat/download-button";
import { getScopeContent } from "@/lib/marketing/content/read";
import { pageAnnualRetreat } from "@/lib/marketing/content/scopes/page-annual-retreat";
import { retreatAccess } from "@/lib/annual-retreat/server";
import { GUIDE_PATH } from "@/lib/annual-retreat/config";

// After a successful request. Never indexed. `?email=sent|failed` is the real
// result of the delivery attempt; no name or address ever appears in the URL.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Your Retreat Guide | Michael J. Gauthier" },
  robots: { index: false, follow: false },
};

const paragraphs = (text: string) => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const access = await retreatAccess();
  if (!access.canView) notFound();
  const [{ thankYou }, { email }] = await Promise.all([getScopeContent(pageAnnualRetreat), searchParams]);
  const failed = email === "failed";

  return (
    <section className="mx-auto max-w-2xl px-4 pb-20 pt-12 text-center sm:px-6 sm:pt-16">
      <h1 className="text-balance font-display text-[clamp(2rem,5vw,3rem)] font-medium leading-tight">{thankYou.title}</h1>
      <div className="mx-auto mt-5 max-w-[56ch] space-y-4 text-pretty text-[17px] leading-relaxed text-[#3d4741] dark:text-[#c9cfc8]">
        {paragraphs(thankYou.body).map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      <div className="mt-8">
        <DownloadGuideButton href={GUIDE_PATH} label={thankYou.button} />
      </div>
      {email === "sent" || failed ? (
        <p
          role="status"
          className={`mx-auto mt-8 flex max-w-[52ch] items-start gap-2.5 rounded-xl border px-4 py-3 text-left text-[14.5px] ${
            failed ? "border-[#e8d6b0] bg-[#fbf3e3] text-[#6b5326] dark:border-[#4a3f27] dark:bg-[#231f15] dark:text-[#e2ca9a]" : "border-[#e6dcc9] bg-white text-[#3d4741] dark:border-[#2e2d27] dark:bg-[#151612] dark:text-[#c9cfc8]"
          }`}
        >
          {failed ? <MailWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#b9975a]" aria-hidden />}
          <span>{failed ? thankYou.emailFailed : thankYou.emailSent}</span>
        </p>
      ) : null}
    </section>
  );
}
