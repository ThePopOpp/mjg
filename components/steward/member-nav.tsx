"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MessageCircle, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// The member navigation the docset specifies: Home | Blueprint | Steward | More.
//
// Four items, fixed. On a phone it becomes a bottom bar, because this is
// something people open in a spare five minutes rather than sit down at.

const ITEMS = [
  { href: "/steward", label: "Home", icon: Home },
  { href: "/steward/blueprint", label: "Blueprint", icon: BookOpen },
  { href: "/steward/conversation", label: "Steward", icon: MessageCircle },
  { href: "/steward/more", label: "More", icon: MoreHorizontal },
];

export function MemberNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/steward" ? pathname === "/steward" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop: a quiet top bar. */}
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
                  isActive(item.href) ? "bg-[#b88a4a]/12 text-[#b88a4a]" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Phone: a bottom bar, padded clear of the home indicator. */}
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
