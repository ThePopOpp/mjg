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
