"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageCircle, MoreHorizontal } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

// Member navigation.
//
// The docset lists Home | Blueprint | Steward | More. The owner moved Steward to
// the front door, which makes a separate Home redundant — the "where you are"
// strip that Home carried now sits above the conversation. So: three items, with
// Steward as the index.

const ITEMS = [
  { href: "/steward", label: "Steward", icon: MessageCircle },
  { href: "/steward/blueprint", label: "Blueprint", icon: BookOpen },
  { href: "/steward/more", label: "More", icon: MoreHorizontal },
];

export function MemberNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/steward" ? pathname === "/steward" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop */}
      <header className="sticky top-0 z-40 hidden border-b bg-background/85 backdrop-blur md:block">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-8 px-6 py-3">
          <Link href="/steward" className="flex items-center gap-2.5 no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_black_white.png" alt="" aria-hidden className="h-6 w-auto dark:hidden" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mjg-logos/mjg_white.png" alt="" aria-hidden className="hidden h-6 w-auto dark:block" />
            <span className="font-serif text-base">Steward</span>
          </Link>

          <nav className="flex items-center gap-1">
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium no-underline transition-colors",
                  isActive(item.href)
                    ? "bg-[#b88a4a]/15 text-[#b88a4a]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Phone: a title row plus a bottom bar, padded clear of the home indicator. */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/85 px-5 py-2.5 backdrop-blur md:hidden">
        <Link href="/steward" className="flex items-center gap-2 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_black_white.png" alt="" aria-hidden className="h-5 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_white.png" alt="" aria-hidden className="hidden h-5 w-auto dark:block" />
          <span className="font-serif text-sm">Steward</span>
        </Link>
        <ThemeToggle />
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium no-underline",
                  active ? "text-[#b88a4a]" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
