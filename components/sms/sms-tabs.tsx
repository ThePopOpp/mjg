"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard/sms", label: "Inbox" },
  { href: "/dashboard/sms/compose", label: "Compose" },
  { href: "/dashboard/sms/templates", label: "Templates" },
  { href: "/dashboard/sms/broadcasts", label: "Broadcasts" },
];

export function SmsTabs() {
  const pathname = usePathname();
  return (
    <div className="flex gap-1 border-b pb-0">
      {tabs.map((tab) => {
        const active = tab.href === "/dashboard/sms" ? pathname === tab.href : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              active
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
