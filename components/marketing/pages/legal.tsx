// /legal and the policy pages (/privacy, /terms, /sms-terms, /ai-trust), inside
// the marketing layout so they carry the site's navigation and footer.
//
// The content comes from lib/public-site/legal.ts (published legal_documents
// rows, with the A2P markdown as the fallback for /privacy and /terms). The body
// is HTML rendered from markdown we control — CMS -> Legal or docs/legal — so it
// is inserted as-is, as the previous HTML pages did.

import Link from "next/link";
import { LEGAL_ENTITY, PRIVACY_EMAIL, SUPPORT_EMAIL } from "@/lib/legal/addresses";
import type { LegalDocumentView } from "@/lib/public-site/legal";
import { CONTAINER, Eyebrow, Heading } from "../primitives";

/** Typography for the rendered policy markdown (h2/h3, lists, links, rules). */
const PROSE = [
  "text-[16px] leading-[1.75] text-muted-foreground",
  "[&_h2]:mb-3.5 [&_h2]:mt-11 [&_h2]:border-t [&_h2]:pt-5 [&_h2]:font-display [&_h2]:text-[26px] [&_h2]:leading-tight [&_h2]:text-foreground first:[&_h2]:mt-0 first:[&_h2]:border-t-0 first:[&_h2]:pt-0",
  "[&_h3]:mb-2.5 [&_h3]:mt-7 [&_h3]:text-[17px] [&_h3]:font-bold [&_h3]:text-foreground",
  "[&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_a]:text-gold-deep [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-80 dark:[&_a]:text-gold-light",
  "[&_hr]:my-8 [&_hr]:border-border",
  "[&_code]:rounded [&_code]:border [&_code]:bg-card [&_code]:px-1.5 [&_code]:text-[14px]",
].join(" ");

const NARROW = `${CONTAINER} max-w-[860px]`;
const CARD = "rounded-xl border bg-card p-6";
const PILL =
  "inline-flex items-center rounded-lg border px-3.5 py-2 text-[14px] font-semibold text-foreground no-underline transition-colors hover:border-gold hover:text-gold-deep dark:hover:text-gold-light";

function Hero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <section className="border-b">
      <div className={`${NARROW} pb-10 pt-16 md:pt-[72px]`}>
        <Eyebrow pill>{eyebrow}</Eyebrow>
        <Heading title={title} level={1} accent={false} className="mt-6" />
        {children}
      </div>
    </section>
  );
}

export function LegalDocumentPage({ doc }: { doc: LegalDocumentView }) {
  return (
    <>
      <Hero eyebrow={doc.eyebrow} title={doc.title}>
        {doc.effective ? <p className="mt-4 text-[14px] text-muted-foreground">Effective {doc.effective}</p> : null}
      </Hero>

      <article className={`${NARROW} py-11`}>
        <div className={PROSE} dangerouslySetInnerHTML={{ __html: doc.bodyHtml }} />
      </article>

      <section className={`${NARROW} space-y-4 pb-20`}>
        {/* Quick links to the consent pages Twilio reviews alongside these documents. */}
        <div className={CARD}>
          <h2 className="font-display text-[19px]">Manage your communication preferences</h2>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
            You can opt in or out of text messages and emails at any time. Opting out of one doesn’t affect the other.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/sms/opt-in" className={PILL}>SMS opt-in</Link>
            <Link href="/sms/opt-out" className={PILL}>SMS opt-out</Link>
            <Link href="/email/opt-in" className={PILL}>Email opt-in</Link>
            <Link href="/email/opt-out" className={PILL}>Email opt-out</Link>
          </div>
        </div>
        {doc.related.length ? (
          <div className={CARD}>
            <h2 className="font-display text-[19px]">Other policies</h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">The rest of the documents that govern this service.</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {doc.related.map((d) => (
                <Link key={d.slug} href={`/${d.slug}`} className={PILL}>
                  {d.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}

export function LegalIndexPage({ docs }: { docs: Array<{ slug: string; title: string; summary: string; effective: string | null }> }) {
  return (
    <>
      <Hero eyebrow="Legal & Trust" title="Legal & Trust">
        <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-muted-foreground">
          The policies that govern services operated by {LEGAL_ENTITY.name}.
        </p>
      </Hero>

      <section className={`${NARROW} grid gap-3.5 pt-11`}>
        {docs.length ? (
          docs.map((d) => (
            <Link key={d.slug} href={`/${d.slug}`} className={`${CARD} block transition-colors hover:border-gold`}>
              <h2 className="font-display text-[21px]">{d.title}</h2>
              {d.summary ? <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d.summary}</p> : null}
              {d.effective ? (
                <p className="mt-3 text-[12px] font-bold uppercase tracking-[0.08em] text-gold-deep dark:text-gold-light">Effective {d.effective}</p>
              ) : null}
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground">No policies have been published yet.</p>
        )}
      </section>

      <section className={`${NARROW} pb-20 pt-6`}>
        {/* The part a person needs to exercise a privacy right; shown even when no policy loads. */}
        <div className={`${CARD} text-[15px] leading-relaxed text-muted-foreground`}>
          <h2 className="font-display text-[19px] text-foreground">Contact</h2>
          <p className="mt-2.5">
            General account and product support:{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-gold-deep underline underline-offset-2 dark:text-gold-light">{SUPPORT_EMAIL}</a>
          </p>
          <p className="mt-1.5">
            To access, correct, export or delete your personal information:{" "}
            <a href={`mailto:${PRIVACY_EMAIL}`} className="text-gold-deep underline underline-offset-2 dark:text-gold-light">{PRIVACY_EMAIL}</a>
          </p>
          <address className="mt-3 not-italic">
            {LEGAL_ENTITY.name}
            {LEGAL_ENTITY.addressLines.map((line) => (
              <span key={line} className="block">{line}</span>
            ))}
          </address>
        </div>
      </section>
    </>
  );
}
