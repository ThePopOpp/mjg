import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/emails", label: "Stats" },
  { href: "/dashboard/emails/send", label: "Send Email" },
  { href: "/dashboard/emails/templates", label: "Templates" },
  { href: "/dashboard/emails/editor", label: "Template Editor" },
  { href: "/dashboard/emails/automations", label: "Email Automations" },
  { href: "/dashboard/emails/journey", label: "Journey" },
  { href: "/dashboard/emails/inbox", label: "Inbox" },
  { href: "/dashboard/emails/history", label: "History" },
  { href: "/dashboard/emails/wizard", label: "Wizard" },
];

export function EmailTabs({ active }: { active: "overview" | "send" | "templates" | "editor" | "automations" | "journey" | "inbox" | "history" | "wizard" }) {
  const activeHref =
    active === "overview"
      ? "/dashboard/emails"
      : active === "send"
        ? "/dashboard/emails/send"
      : active === "templates"
        ? "/dashboard/emails/templates"
        : active === "editor"
          ? "/dashboard/emails/editor"
        : active === "automations"
          ? "/dashboard/emails/automations"
          : active === "journey"
            ? "/dashboard/emails/journey"
            : active === "inbox"
              ? "/dashboard/emails/inbox"
              : active === "history"
                ? "/dashboard/emails/history"
                : "/dashboard/emails/wizard";

  return (
    <div className="flex flex-wrap gap-2 rounded-md border bg-card p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            tab.href === activeHref && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
