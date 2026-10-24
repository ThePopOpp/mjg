"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import type { NavContent } from "@/lib/marketing/content/scopes/global";
import { cn } from "@/lib/utils";
import { CONTAINER, buttonClass } from "./primitives";
import { MarketingThemeToggle } from "./theme-toggle";

// The marketing header (SiteNav.dc.html): sticky 60px bar, a "Discover" mega
// menu of four columns, Steward and Contact, an account menu, the two persistent
// calls to action and the theme toggle. Below 1024px it becomes a full-screen
// menu. All labels and links come from the global:nav content scope.

/** Preview copies live under /site-preview; treat them as the page they preview. */
function normalize(path: string) {
  return path.replace(/^\/site-preview(?=\/|$)/, "").replace(/^\/home$/, "/") || "/";
}

function matches(pathname: string, href: string) {
  if (!href.startsWith("/") || href === "/") return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNav({ nav }: { nav: NavContent }) {
  const pathname = normalize(usePathname() ?? "/");
  const [megaOpen, setMegaOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const megaId = useId();
  // Hover intent: the pointer crosses a gap between the button and the panel,
  // so closing waits a moment and is cancelled if it arrives.
  const timers = useRef(new Map<(v: boolean) => void, ReturnType<typeof setTimeout>>());
  const hover = (setter: (v: boolean) => void, open: boolean) => () => {
    clearTimeout(timers.current.get(setter));
    if (open) setter(true);
    else timers.current.set(setter, setTimeout(() => setter(false), 140));
  };
  const accountId = useId();

  const discoverActive = nav.columns.some((c) => matches(pathname, c.href) || c.links.some((l) => matches(pathname, l.href)));

  // Close everything on navigation.
  useEffect(() => {
    setMegaOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setAccountOpen(false);
        setMobileOpen(false);
      }
    }
    function onClick(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) {
        setMegaOpen(false);
        setAccountOpen(false);
      }
    }
    function onResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // The full-screen menu owns the page while it is open.
  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const itemClass = (active: boolean) =>
    cn(
      "inline-flex h-10 items-center gap-1 rounded-md px-3 text-[14px] font-medium transition-colors hover:text-gold-deep dark:hover:text-gold-light",
      active && "font-semibold text-gold-deep dark:text-gold-light",
    );

  return (
    <header ref={navRef} className="sticky top-0 z-50 border-b bg-background">
      <nav aria-label="Main" className={cn(CONTAINER, "flex min-h-[60px] items-center justify-between gap-4")}>
        <Link href="/" className="flex shrink-0 items-center gap-3 no-underline" aria-label="Michael J. Gauthier — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_black_white.png" alt="" className="h-9 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_white.png" alt="" className="hidden h-9 w-auto dark:block" />
          <span className="hidden font-display text-[15px] italic sm:inline">
            Michael <span className="text-gold">J.</span> Gauthier
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          <div className="relative" onMouseEnter={hover(setMegaOpen, true)} onMouseLeave={hover(setMegaOpen, false)}>
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-controls={megaId}
              onClick={() => setMegaOpen((v) => !v)}
              className={itemClass(discoverActive)}
            >
              {nav.discoverLabel}
              <ChevronDown className={cn("h-4 w-4 transition-transform", megaOpen && "rotate-180")} aria-hidden />
            </button>
          </div>
          {nav.links.map((l) => (
            <Link key={l.id} href={l.href} className={itemClass(matches(pathname, l.href))}>
              {l.label}
            </Link>
          ))}
          <div className="relative" onMouseEnter={hover(setAccountOpen, true)} onMouseLeave={hover(setAccountOpen, false)}>
            <button
              type="button"
              aria-expanded={accountOpen}
              aria-controls={accountId}
              onClick={() => setAccountOpen((v) => !v)}
              className={cn(itemClass(false), "text-muted-foreground")}
            >
              {nav.accountLabel}
              <ChevronDown className={cn("h-4 w-4 transition-transform", accountOpen && "rotate-180")} aria-hidden />
            </button>
            {accountOpen ? (
              <div id={accountId} className="absolute right-0 top-full z-10 pt-2">
                <ul className="min-w-[180px] rounded-[10px] border bg-background p-1.5 shadow-[0_18px_48px_rgba(20,20,20,0.12)]">
                  {nav.accountLinks.map((l) => (
                    <li key={l.id}>
                      <a href={l.href} className="block rounded-md px-3 py-2 text-[14px] no-underline hover:bg-muted hover:text-gold-deep dark:hover:text-gold-light">
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="ml-2 flex items-center gap-2">
            <Link href={nav.secondaryCta.href} className={buttonClass("outline", "h-10 px-4 text-[14px]")}>
              {nav.secondaryCta.label}
            </Link>
            <Link href={nav.primaryCta.href} className={buttonClass("primary", "h-10 px-4 text-[14px]")}>
              {nav.primaryCta.label}
            </Link>
            <MarketingThemeToggle />
          </div>
        </div>

        {/* Mobile */}
        <button
          type="button"
          className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[14px] bg-muted lg:hidden"
          aria-label={mobileOpen ? "Close menu" : "Menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mega menu panel: full container width under the bar. */}
      {megaOpen ? (
        <div
          id={megaId}
          className="absolute inset-x-0 top-full z-40 hidden lg:block"
          onMouseEnter={hover(setMegaOpen, true)}
          onMouseLeave={hover(setMegaOpen, false)}
        >
          <div className={CONTAINER}>
            <div className="grid grid-cols-4 gap-6 rounded-b-[14px] rounded-t-none border border-t-0 bg-background px-6 pb-5 pt-5 shadow-[0_18px_48px_rgba(20,20,20,0.12),0_6px_12px_rgba(20,20,20,0.06)]">
              {nav.columns.map((col) => (
                <div key={col.id}>
                  <Link
                    href={col.href}
                    className="flex items-center justify-between border-b pb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep no-underline hover:text-gold dark:text-gold-light"
                  >
                    {col.label}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                  <ul className="mt-2 space-y-0.5">
                    {col.links.map((l) => (
                      <li key={l.id}>
                        <Link
                          href={l.href}
                          aria-current={matches(pathname, l.href) ? "page" : undefined}
                          className={cn(
                            "block rounded-md px-2.5 py-2 text-[14px] no-underline transition-colors hover:bg-muted hover:text-gold-deep dark:hover:text-gold-light",
                            matches(pathname, l.href) && "font-semibold text-gold-deep dark:text-gold-light",
                          )}
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Full-screen mobile menu */}
      {mobileOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[61px] z-40 overflow-y-auto bg-background px-6 pb-10 pt-5 lg:hidden">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gold-deep dark:text-gold-light">{nav.discoverLabel}</p>
          <ul className="mt-2">
            {nav.columns.map((col) => (
              <li key={col.id} className="border-b py-2">
                <Link href={col.href} className="block py-2 text-[17px] font-semibold no-underline">
                  {col.label}
                </Link>
                <ul className="pb-1 pl-4">
                  {col.links
                    .filter((l) => l.href !== col.href)
                    .map((l) => (
                      <li key={l.id}>
                        <Link href={l.href} className="block py-2 text-[15px] text-muted-foreground no-underline">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
            {nav.links.map((l) => (
              <li key={l.id} className="border-b">
                <Link href={l.href} className="block py-3.5 text-[17px] font-semibold no-underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {nav.accountLinks.map((l) => (
              <a key={l.id} href={l.href} className={buttonClass("outline", "h-11 text-sm")}>
                {l.label}
              </a>
            ))}
            <Link href={nav.secondaryCta.href} className={buttonClass("outline", "h-11 text-sm")}>
              {nav.secondaryCta.label}
            </Link>
            <Link href={nav.primaryCta.href} className={buttonClass("primary", "h-11 text-sm")}>
              {nav.primaryCta.label}
            </Link>
          </div>
          <MarketingThemeToggle full className="mt-3" />
        </div>
      ) : null}
    </header>
  );
}
