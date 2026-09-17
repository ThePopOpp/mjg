import Link from "next/link";
import { SiteNav } from "@/components/public-site/site-nav";
import { publicSiteUrl } from "@/lib/public-site/static-pages";

/**
 * Public page chrome for the React app pages that belong to the marketing site rather than
 * the pilot micro-site — /book-waitlist and /stewardship-blueprint/energy-audit. It puts the
 * real frontend navigation on them instead of the PilotShell nav (Home/Pilot/Check-In/Survey).
 *
 * `contentClassName` defaults to the same box as the nav bar (max-width 1160px, 2rem gutters)
 * so page content lines up with the logo on the left and the theme toggle on the right.
 */
export function SiteShell({
  children,
  contentClassName = "mx-auto w-full max-w-[1160px] px-8",
}: {
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const siteUrl = publicSiteUrl();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav siteUrl={siteUrl} />
      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t">
        <div className="mx-auto flex w-full max-w-[1160px] flex-col items-center justify-between gap-4 px-8 py-8 text-sm sm:flex-row">
          <Link href="/" className="flex items-center gap-3 no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" className="h-7 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_white.png" alt="" aria-hidden className="hidden h-7 w-auto dark:block" />
            <span className="font-serif text-sm italic">
              Michael <span className="text-[#b88a4a]">J.</span> Gauthier
            </span>
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-5 text-muted-foreground">
            <a href={`${siteUrl}/about`} className="hover:text-[#b88a4a]">About</a>
            <a href={`${siteUrl}/mission`} className="hover:text-[#b88a4a]">Mission</a>
            <a href={`${siteUrl}/resources`} className="hover:text-[#b88a4a]">Resources</a>
            <a href={`${siteUrl}/contact`} className="hover:text-[#b88a4a]">Contact</a>
            <Link href="/privacy" className="hover:text-[#b88a4a]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#b88a4a]">Terms</Link>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Michael J. Gauthier</p>
        </div>
      </footer>
    </div>
  );
}

/** The page-content box that lines up with the nav bar. */
export const SITE_CONTENT_BOX = "mx-auto w-full max-w-[1160px] px-8";

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
      <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b88a4a]/40 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b88a4a]">
            <span aria-hidden>✦</span> {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {lead ? `${lead} ` : ""}
          <em className="not-italic text-[#b88a4a]">{last}</em>
        </h1>
        {description ? (
          <p className={`mt-5 text-lg leading-8 text-muted-foreground ${centered ? "mx-auto max-w-2xl" : "max-w-2xl"}`}>
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
