import Link from "next/link";
import type { FooterContent } from "@/lib/marketing/content/scopes/global";
import { CONTAINER } from "./primitives";

// SiteFooter.dc.html: brand column, three link columns, legal bar.

export function MarketingFooter({ footer }: { footer: FooterContent }) {
  const copyright = footer.copyright.replace("{year}", String(new Date().getFullYear()));
  return (
    <footer className="border-t bg-background">
      <div className={`${CONTAINER} grid gap-10 pb-7 pt-12 sm:grid-cols-2 lg:grid-cols-4`}>
        <div>
          <Link href="/" className="inline-flex items-center gap-3 no-underline" aria-label="Michael J. Gauthier — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_black_white.png" alt="" className="h-7 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_white.png" alt="" className="hidden h-7 w-auto dark:block" />
            <span className="font-display text-sm italic">
              Michael <span className="text-gold">J.</span> Gauthier
            </span>
          </Link>
          {footer.tagline ? <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-muted-foreground">{footer.tagline}</p> : null}
        </div>
        {footer.columns.map((col) => (
          <div key={col.id}>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{col.label}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.id}>
                  <Link href={l.href} className="text-[14px] text-muted-foreground no-underline hover:text-gold-deep dark:hover:text-gold-light">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className={`${CONTAINER} flex flex-col gap-3 py-5 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between`}>
          <p>{copyright}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {footer.legalLinks.map((l) => (
              <li key={l.id}>
                <Link href={l.href} className="no-underline hover:text-gold-deep dark:hover:text-gold-light">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
