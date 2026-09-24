// Frontend Editor — small shared constants for the dashboard UI.

import type { WebsitePageStatus, WebsitePageType } from "@/lib/website/types";

export const CMS_LIKE_PAGE_TYPES: { value: WebsitePageType; label: string }[] = [
  { value: "page", label: "Content page" },
  { value: "landing", label: "Landing page" },
  { value: "marketing", label: "Marketing page" },
  { value: "resource", label: "Resource page" },
  { value: "legal", label: "Legal page" },
];

export const STATUS_PILL: Record<WebsitePageStatus, string> = {
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  draft: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  scheduled: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  archived: "bg-muted text-muted-foreground",
};

export const RISK_PILL: Record<string, string> = {
  low: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  high: "bg-destructive/15 text-destructive",
};

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(iso);
}
