import type { Metadata } from "next";
import Link from "next/link";
import { getScopeContent } from "@/lib/marketing/content/read";
import { globalFooter } from "@/lib/marketing/content/scopes/global";
import { MARKETING_FONT_VARS } from "@/lib/marketing/fonts";
import { publicSiteUrl } from "@/lib/public-site/static-pages";

// Focused landing pages (the Annual Retreat Guide). Mike's brief: a simple MJG
// header and the existing privacy/legal footer, with one main action on the
// page, so no full navigation and no Steward button here.

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl()),
  title: { template: "%s | Michael J. Gauthier", default: "Michael J. Gauthier" },
  openGraph: { siteName: "Michael J. Gauthier", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default async function RetreatLayout({ children }: { children: React.ReactNode }) {
  const { footer } = await getScopeContent(globalFooter);
  const copyright = footer.copyright.replace("{year}", String(new Date().getFullYear()));
  return (
    <div className={`${MARKETING_FONT_VARS} flex min-h-screen flex-col bg-[#faf8f4] font-marketing text-[16px] text-[#111111] antialiased dark:bg-[#10110f] dark:text-[#f3efe7]`}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-[#111111] focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <header className="border-b border-[#e9e1d2] dark:border-[#2a2925]">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" aria-label="Michael J. Gauthier home" className="inline-flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" width={132} height={40} className="h-9 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_white.png" alt="Michael J. Gauthier" width={132} height={40} className="hidden h-9 w-auto dark:block" />
          </Link>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-[#e9e1d2] dark:border-[#2a2925]">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-[13px] text-[#5f6d66] sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-[#a7b0aa]">
          <p>{copyright}</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {footer.legalLinks.map((l) => (
              <Link key={l.id} href={l.href} className="hover:text-[#111111] hover:underline dark:hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
