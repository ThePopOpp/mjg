import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/footer";
import { MarketingNav } from "@/components/marketing/nav";
import { StewardFab } from "@/components/public-site/steward-fab";
import { SITE_CONTENT_BOX } from "@/lib/public-site/content-box";
import type { NavItem } from "@/lib/public-site/nav-items";
import { appUrl, publicSiteUrl } from "@/lib/public-site/static-pages";
import { getScopeContent } from "@/lib/marketing/content/read";
import { globalFooter, globalNav } from "@/lib/marketing/content/scopes/global";
import { MARKETING_FONT_VARS } from "@/lib/marketing/fonts";

/**
 * Public page chrome for the React pages that sit outside the marketing route
 * group — /book-waitlist, /6-week-challenge, /steward/pricing, the Energy Audit,
 * Frontend Editor pages and their draft previews. It renders the same navigation
 * and footer as the marketing pages (components/marketing/nav + footer, from the
 * global:nav and global:footer content), so every public page shares one header.
 *
 * The Frontend Editor's own navigation tables (website_navigation_items) held a
 * copy of the old menu; the site navigation is now edited as content, so those
 * props are accepted for compatibility and ignored. The footer note still applies.
 */
export async function SiteShell({
  children,
  footerNote,
}: {
  children: React.ReactNode;
  /** @deprecated Ignored; pages lay out their own content. */
  contentClassName?: string;
  /** @deprecated Ignored; the site navigation (global:nav) is used everywhere. */
  navItems?: NavItem[];
  /** @deprecated Ignored; the site footer (global:footer) is used everywhere. */
  footerLinks?: { label: string; href: string }[];
  /** Replaces the footer's copyright line. */
  footerNote?: string;
}) {
  const siteUrl = publicSiteUrl();
  const [{ nav }, { footer }] = await Promise.all([getScopeContent(globalNav), getScopeContent(globalFooter)]);
  return (
    <div className={`${MARKETING_FONT_VARS} flex min-h-screen flex-col bg-background text-foreground`}>
      <MarketingNav nav={nav} />
      <main className="flex-1">{children}</main>
      <MarketingFooter footer={footerNote ? { ...footer, copyright: footerNote } : footer} />
      <StewardFab siteUrl={siteUrl} appUrl={appUrl()} />
    </div>
  );
}

/** The page-content box that lines up with the nav bar. */
// Re-exported so the many pages that already import it from here keep working.
export { SITE_CONTENT_BOX };

/**
 * The standard frontend hero: eyebrow chip, serif headline with the last word in gold,
 * supporting copy, and an optional CTA. Mirrors the shape PilotShell's hero had so pages can
 * move onto the frontend chrome without rewriting their headers.
 */
export function SiteHero({
  eyebrow,
  title,
  description,
  cta,
  align = "center",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  cta?: { href: string; label: string };
  align?: "center" | "left";
  children?: React.ReactNode;
}) {
  const words = title.trim().split(" ");
  const lead = words.slice(0, -1).join(" ");
  const last = words[words.length - 1];
  const centered = align === "center";

  return (
    <section className={`${SITE_CONTENT_BOX} py-12 md:py-16`}>
      {/* max-w-5xl rather than 3xl: a 3xl (768px) box forced a headline such as
          "Created for More Check-In" to wrap on desktop. The supporting copy keeps
          its own max-w-2xl below, so reading measure is unchanged. */}
      <div className={centered ? "mx-auto max-w-5xl text-center" : "max-w-5xl"}>
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
            <span aria-hidden>✦</span> {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-6 text-balance font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {lead ? `${lead} ` : ""}
          {/* whitespace-nowrap keeps a hyphenated accent word whole — without it a
              browser happily breaks "Check-In" after the hyphen. It only ever wraps
              a single word, so it cannot cause a long line to overflow. */}
          <em className="whitespace-nowrap not-italic text-[#b88a4a]">{last}</em>
        </h1>
        {description ? (
          <p className={`mt-5 text-pretty text-lg leading-8 text-muted-foreground ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
            {description}
          </p>
        ) : null}
        {cta ? (
          <div className={`mt-8 ${centered ? "flex justify-center" : ""}`}>
            <Link
              href={cta.href}
              className="inline-flex h-12 items-center rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground no-underline transition-opacity hover:opacity-90"
            >
              {cta.label}
            </Link>
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}
