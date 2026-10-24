// /sms/opt-in, /sms/opt-out, /email/opt-in, /email/opt-out — the consent pages
// Twilio's A2P 10DLC review checks. Copy: lib/public-site/consent.ts.

import Link from "next/link";
import { CONSENT_COPY, type ConsentKind, type ConsentMode } from "@/lib/public-site/consent";
import { CONTAINER, Eyebrow, Heading } from "../primitives";
import { ConsentForm } from "../consent-form";

export function ConsentPage({ kind, mode }: { kind: ConsentKind; mode: ConsentMode }) {
  const copy = CONSENT_COPY[kind][mode];
  const isOptIn = mode === "opt-in";
  const noun = kind === "sms" ? "texts" : "emails";
  const otherHref = `/${kind}/${isOptIn ? "opt-out" : "opt-in"}`;
  const otherLabel = isOptIn ? `Unsubscribe from ${noun} instead` : `Subscribe to ${noun} instead`;
  const footLink = "text-muted-foreground no-underline transition-colors hover:text-gold-deep dark:hover:text-gold-light";

  return (
    <section className={`${CONTAINER} max-w-[600px] pb-20 pt-14 md:pt-16`}>
      <Eyebrow pill>{kind === "sms" ? "Text messages" : "Email"}</Eyebrow>
      <Heading title={copy.title} level={1} accent={false} className="mt-6 text-[clamp(2rem,5vw,2.75rem)]" />
      <p className="mt-3 text-pretty text-[16px] leading-relaxed text-muted-foreground">{copy.lede}</p>

      <div className="mt-7 rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
        <ConsentForm kind={kind} mode={mode} />
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]">
        <Link href={otherHref} className={footLink}>
          {otherLabel}
        </Link>
        <Link href="/privacy" className={footLink}>
          Privacy Policy
        </Link>
        <Link href="/terms" className={footLink}>
          Terms of Service
        </Link>
      </div>
    </section>
  );
}
