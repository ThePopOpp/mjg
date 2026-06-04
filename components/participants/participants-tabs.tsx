import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/dashboard/participants", label: "Participants" },
  { href: "/dashboard/participants/tags-segments", label: "Tags & Segments" },
] as const;

export function ParticipantsTabs({ active }: { active: "participants" | "tags-segments" }) {
  const activeHref = active === "participants" ? "/dashboard/participants" : "/dashboard/participants/tags-segments";

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
