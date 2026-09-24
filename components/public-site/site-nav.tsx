"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { joinJourneyHref, publicNavItems, type NavItem } from "@/lib/public-site/nav-items";
import { cn } from "@/lib/utils";

const GOLD = "#b88a4a";

/**
 * The public site navigation, for the React app pages (/book-waitlist,
 * /stewardship-blueprint/energy-audit). It renders the same items as the server-rendered
 * HTML nav — both read them from lib/public-site/nav-items — so the two stay in step.
 *
 * Desktop: Home · About · Mission · Resources▾ · Contact · Account▾ · theme toggle.
 * "Join the Journey" is mobile-only. Mobile is a full-page menu.
 */
export function SiteNav({ siteUrl, items: itemsOverride }: { siteUrl: string; items?: NavItem[] }) {
  // "" for the app origin → app pages become relative paths so Next can soft-navigate.
  // The Frontend Editor passes `items` so CMS-owned pages follow the navigation
  // Mike manages in the dashboard; every other page keeps the code-owned nav.
  const items = itemsOverride?.length ? itemsOverride : publicNavItems(siteUrl, "");
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Lock the page behind the open full-screen menu.
  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", menuOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [menuOpen]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!navRef.current?.contains(e.target as Node)) setOpenDropdown(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMenuOpen(false);
      }
    }
    function onResize() {
      if (window.innerWidth > 768) setMenuOpen(false);
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const resources = items.find((i) => i.label === "Resources");
  const account = items.find((i) => i.label === "Account");

  return (
    <nav ref={navRef} className="sticky top-0 z-50 w-full border-b bg-background">
      {/* Matches the HTML nav's .nav-inner box exactly (max-width 1160px, 2rem gutters) so
          page content can align with the logo and the theme toggle. */}
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1160px] items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-3 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" className="h-9 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_white.png" alt="" aria-hidden className="hidden h-9 w-auto dark:block" />
          <span className="hidden font-serif text-[0.95rem] italic tracking-tight sm:inline">
            Michael <span style={{ color: GOLD }}>J.</span> Gauthier
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 md:flex">
          {items.map((item) => (
            <li
              key={item.label}
              className="relative flex items-center gap-0.5"
              onMouseEnter={item.children ? () => setOpenDropdown(item.label) : undefined}
              onMouseLeave={item.children ? () => setOpenDropdown((cur) => (cur === item.label ? null : cur)) : undefined}
            >
              <NavLabel item={item} />
              {item.children ? (
                <>
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={openDropdown === item.label}
                    aria-label={`Open ${item.label} menu`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown((cur) => (cur === item.label ? null : item.label));
                    }}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", openDropdown === item.label && "rotate-180")} />
                  </button>
                  {openDropdown === item.label ? (
                    <div className="absolute right-0 top-full pt-[0.7rem]">
                      <div className="min-w-[180px] rounded-[10px] border bg-background p-1.5 shadow-lg">
                        {item.children.map((c) => (
                          <NavChildLink key={c.label} href={c.href} label={c.label} onNavigate={() => setOpenDropdown(null)} />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </li>
          ))}
          <li>
            <ThemeToggle />
          </li>
        </ul>

        {/* Mobile trigger */}
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[14px] border bg-muted/60 text-foreground transition-colors hover:bg-muted md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Full-page mobile menu */}
      {menuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[60px] z-40 overflow-y-auto bg-background px-6 pb-10 pt-5 md:hidden">
          <ul className="flex flex-col">
            {/* Order per spec: the top-level links, Resources' children flattened, the CTA,
                then Contact, the auth pair and the toggle. */}
            {items
              .filter((i) => i.label !== "Account" && i.label !== "Contact")
              .map((item) => (
                <MobileRow key={item.label} href={item.href!} label={item.label} onNavigate={() => setMenuOpen(false)} />
              ))}
            {(resources?.children ?? []).map((c) => (
              <MobileRow key={c.label} href={c.href} label={c.label} onNavigate={() => setMenuOpen(false)} />
            ))}
            <MobileRow href={joinJourneyHref(siteUrl)} label="Join the Journey" onNavigate={() => setMenuOpen(false)} />
            <MobileRow href={items.find((i) => i.label === "Contact")!.href!} label="Contact" onNavigate={() => setMenuOpen(false)} />
            <li className="mt-4 grid grid-cols-2 gap-2.5">
              {(account?.children ?? []).map((c) => (
                <Link
                  key={c.label}
                  href={c.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg border px-4 py-3 text-center text-[0.95rem] font-semibold no-underline"
                >
                  {c.label}
                </Link>
              ))}
            </li>
            <li className="mt-4">
              <ThemeToggle full />
            </li>
          </ul>
        </div>
      ) : null}
    </nav>
  );
}

/** The parent label: a link when it has an href, otherwise a plain button ("Account"). */
function NavLabel({ item }: { item: NavItem }) {
  if (!item.href) {
    return <span className="cursor-default text-sm text-muted-foreground">{item.label}</span>;
  }
  return <NavChildLink href={item.href} label={item.label} className="text-sm" />;
}

function NavChildLink({
  href,
  label,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  className?: string;
}) {
  // Absolute hrefs point at the marketing site (a different host): plain anchors.
  const external = /^https?:\/\//.test(href);
  const classes = cn(
    "block rounded-md text-sm text-foreground no-underline transition-colors hover:text-[#b88a4a]",
    onNavigate && "px-3 py-2.5 hover:bg-muted",
    className,
  );
  if (external) {
    return (
      <a href={href} className={classes} onClick={onNavigate}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} onClick={onNavigate}>
      {label}
    </Link>
  );
}

function MobileRow({
  href,
  label,
  onNavigate,
  className,
}: {
  href: string;
  label: string;
  onNavigate: () => void;
  className?: string;
}) {
  const external = /^https?:\/\//.test(href);
  const classes = cn("block border-b py-3.5 text-[1.05rem] text-foreground no-underline", className);
  return (
    <li>
      {external ? (
        <a href={href} className={classes} onClick={onNavigate}>
          {label}
        </a>
      ) : (
        <Link href={href} className={classes} onClick={onNavigate}>
          {label}
        </Link>
      )}
    </li>
  );
}

function ThemeToggle({ full }: { full?: boolean }) {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setThemeState(stored === "dark" || stored === "light" ? stored : preferred);
  }, []);

  function setTheme(next: "light" | "dark") {
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      /* storage blocked — the toggle still applies for this page view */
    }
    setThemeState(next);
  }

  return (
    <button
      type="button"
      aria-label="Toggle light/dark mode"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "inline-flex items-center justify-center border bg-muted/60 text-foreground transition-colors hover:bg-muted",
        full ? "h-[46px] w-full rounded-lg" : "h-[42px] w-[42px] rounded-[14px]",
      )}
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}
