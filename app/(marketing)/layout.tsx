import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";
import { StewardFab } from "@/components/public-site/steward-fab";
import { getScopeContent } from "@/lib/marketing/content/read";
import { globalFooter, globalNav } from "@/lib/marketing/content/scopes/global";
import { MARKETING_FONT_VARS } from "@/lib/marketing/fonts";
import { appUrl, publicSiteUrl } from "@/lib/public-site/static-pages";

// The marketing site's chrome. Fonts (lib/marketing/fonts) are applied here,
// scoped to these pages: the dashboard keeps its own type.

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl()),
  title: { template: "%s | Michael J. Gauthier", default: "Michael J. Gauthier — The Stewardship Blueprint" },
  description: "A whole-life framework that helps you stop drifting, steward what God has entrusted to you, and build a life that matters.",
  openGraph: { siteName: "Michael J. Gauthier", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [{ nav }, { footer }] = await Promise.all([getScopeContent(globalNav), getScopeContent(globalFooter)]);

  return (
    <div className={`${MARKETING_FONT_VARS} flex min-h-screen flex-col bg-background font-marketing text-[15px] text-foreground antialiased`}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <MarketingNav nav={nav} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <MarketingFooter footer={footer} />
      <StewardFab siteUrl={publicSiteUrl()} appUrl={appUrl()} />
    </div>
  );
}
