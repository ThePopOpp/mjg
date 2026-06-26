import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS: { seg: string; href: string; label: string }[] = [
  { seg: "overview", href: "/dashboard/social-media", label: "Stats" },
  { seg: "compose", href: "/dashboard/social-media/compose", label: "Compose" },
  { seg: "templates", href: "/dashboard/social-media/templates", label: "Templates" },
  { seg: "editor", href: "/dashboard/social-media/editor", label: "Block Editor" },
  { seg: "automations", href: "/dashboard/social-media/automations", label: "Automations" },
  { seg: "inbox", href: "/dashboard/social-media/inbox", label: "Inbox" },
  { seg: "history", href: "/dashboard/social-media/history", label: "History" },
  { seg: "analytics", href: "/dashboard/social-media/analytics", label: "Analytics" },
  { seg: "wizard", href: "/dashboard/social-media/wizard", label: "Wizard" },
  { seg: "settings", href: "/dashboard/social-media/settings", label: "Settings" },
];

export type SocialTab =
  | "overview" | "compose" | "templates" | "editor" | "automations"
  | "inbox" | "history" | "analytics" | "wizard" | "settings";

export function SocialTabs({ active }: { active: SocialTab }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-md border bg-card p-1">
      {TABS.map((tab) => (
        <Link
          key={tab.seg}
          href={tab.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            tab.seg === active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
