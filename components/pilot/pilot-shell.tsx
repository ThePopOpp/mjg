import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PilotThemeToggle } from "@/components/pilot/theme-toggle";

type PilotShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  cta?: {
    href: string;
    label: string;
  };
};

export function PilotShell({ eyebrow, title, description, children, cta }: PilotShellProps) {
  return (
    <main className="pilot-page min-h-screen">
      <header className="pilot-topbar sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-end gap-3 text-foreground no-underline">
            <span className="pilot-logo">MJG</span>
            <span className="pilot-signature hidden pb-1 text-sm sm:inline">Michael J. Gauthier</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
              <Link href="/" className="hover:text-[color:var(--brand-gold)]">Home</Link>
              <Link href="/created-for-more-7-day-stewardship-pilot" className="hover:text-[color:var(--brand-gold)]">Pilot</Link>
              <Link href="/check-in" className="hover:text-[color:var(--brand-gold)]">Check-In</Link>
              <Link href="/surveys/general" className="hover:text-[color:var(--brand-gold)]">Survey</Link>
              <Button asChild className="h-10 rounded-md px-5">
                <Link href="/check-in">Join the Journey</Link>
              </Button>
            </nav>
            <PilotThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="pilot-eyebrow">
              <span aria-hidden="true">✦</span>
              {eyebrow}
            </div>
          ) : null}
          <h1 className="pilot-heading mt-6 text-5xl sm:text-6xl lg:text-7xl">{formatPilotTitle(title)}</h1>
          <p className="pilot-hero-copy mt-6 max-w-2xl">{description}</p>
          {cta ? (
            <Button asChild size="lg" className="mt-8 h-12 rounded-md px-6 text-base">
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ) : null}
        </div>
        <VideoPlaceholder />
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">{children}</div>
    </main>
  );
}

export function VideoPlaceholder() {
  return (
    <div className="pilot-video flex min-h-80 items-center justify-center rounded-lg p-6 text-center">
      <div>
        <p className="pilot-eyebrow">Video placeholder</p>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
          This page is ready to launch without video. A short personal video can be added here later.
        </p>
      </div>
    </div>
  );
}

function formatPilotTitle(title: string) {
  const words = ["Blueprint", "Journey", "Matters", "Discern", "Building"];
  const word = words.find((candidate) => title.includes(candidate));

  if (!word) return title;

  const [before, after] = title.split(word);
  return (
    <>
      {before}
      <em>{word}</em>
      {after}
    </>
  );
}
