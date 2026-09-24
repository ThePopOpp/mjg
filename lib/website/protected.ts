// Frontend Editor — protected routes and change-risk classification.
//
// Spec §28/§29: the app shell keeps its own routes. Anything under a protected
// prefix is code-owned and can never be created, renamed, overwritten or deleted
// through the editor — by Mike or by Steward. Spec §32: every write is classified
// so the UI and Steward know what needs preview vs. explicit confirmation.

import type { ChangeRisk } from "./types";

/**
 * Code-owned route prefixes. A CMS page can never claim a slug that starts with
 * one of these. Keep this in sync when new application areas are added; the
 * cost of an extra entry is only that the slug is unavailable to the CMS.
 */
export const PROTECTED_ROUTES = [
  "/api",
  "/dashboard",
  "/portal",
  "/login",
  "/register",
  "/accept-invite",
  "/reset-password",
  "/auth",
  "/access-restricted",
  "/account",
  "/checkout",
  "/billing",
  "/_next",
  "/website-preview",
  // Existing code-owned public routes (React pages + static-HTML routes).
  "/about",
  "/mission",
  "/contact",
  "/resources",
  "/events",
  "/book",
  "/book-waitlist",
  "/c",
  "/post",
  "/media",
  "/listen",
  "/surveys",
  "/check-in",
  "/email",
  "/sms",
  "/animation",
  "/privacy",
  "/terms",
  "/join-the-movement",
  "/created-for-more",
  "/created-for-more-check-in",
  "/created-for-more-7-day-stewardship-pilot",
  "/stewardship-blueprint",
  "/stewardship-blueprint-inner-circle",
  "/stewardship-blueprint-pastor-review",
  "/6-week-challenge",
  "/manifest.webmanifest",
] as const;

/** Slugs that must never be taken by a CMS page (the homepage is code-owned). */
const RESERVED_SLUGS = new Set(["", "index", "home"]);

function normalizePath(input: string): string {
  const raw = String(input || "").trim().toLowerCase();
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

/**
 * True when `path` is (or lives beneath) a code-owned route. Matching is on
 * whole segments, so "/aboutus" is free while "/about" and "/about/team" are not.
 */
export function isProtectedPath(path: string): boolean {
  const p = normalizePath(path);
  if (p === "/") return true;
  return PROTECTED_ROUTES.some((route) => {
    const r = normalizePath(route);
    return p === r || p.startsWith(`${r}/`);
  });
}

/**
 * Validate a slug a user or Steward wants to use. Returns the cleaned slug, or
 * throws with an owner-readable reason.
 */
export function assertUsableSlug(slug: string): string {
  const clean = String(slug || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  if (RESERVED_SLUGS.has(clean)) {
    throw new Error("That address is reserved by the application. Choose a different page address.");
  }
  if (!/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(clean)) {
    throw new Error(
      "A page address can only use lowercase letters, numbers, hyphens and slashes (for example: kingdom-stewardship).",
    );
  }
  if (isProtectedPath(clean)) {
    throw new Error(
      `/${clean} is a protected application route and cannot be managed from the Frontend Editor.`,
    );
  }
  return clean;
}

/** Same check, non-throwing — for UI hints and Steward pre-flight answers. */
export function slugProblem(slug: string): string | null {
  try {
    assertUsableSlug(slug);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "That address cannot be used.";
  }
}

// ── Change risk (spec §32) ───────────────────────────────────────────────────

export type WebsiteAction =
  | "page.create"
  | "page.updateContent"
  | "page.updateSeo"
  | "page.updateSlug"
  | "page.publish"
  | "page.unpublish"
  | "page.archive"
  | "page.restore"
  | "page.delete"
  | "page.duplicate"
  | "block.add"
  | "block.update"
  | "block.move"
  | "block.duplicate"
  | "block.remove"
  | "navigation.update"
  | "global.update"
  | "redirect.create"
  | "version.restore"
  | "bulk.replace";

const RISK: Record<WebsiteAction, ChangeRisk> = {
  "page.create": "medium",
  "page.updateContent": "low",
  "page.updateSeo": "low",
  "page.updateSlug": "medium",
  "page.publish": "medium",
  "page.unpublish": "medium",
  "page.archive": "medium",
  "page.restore": "low",
  "page.delete": "high",
  "page.duplicate": "low",
  "block.add": "medium",
  "block.update": "low",
  "block.move": "medium",
  "block.duplicate": "low",
  "block.remove": "medium",
  "navigation.update": "high",
  "global.update": "high",
  "redirect.create": "medium",
  "version.restore": "medium",
  "bulk.replace": "high",
};

export function riskOf(action: WebsiteAction): ChangeRisk {
  return RISK[action] ?? "medium";
}

/** Legal pages (spec §52) escalate every edit to the high-control path. */
export function riskForPage(action: WebsiteAction, page?: { is_legal?: boolean; status?: string }): ChangeRisk {
  const base = riskOf(action);
  if (page?.is_legal) return "high";
  // Editing something already live is never "low risk enough to skip preview".
  if (base === "low" && page?.status === "published") return "medium";
  return base;
}

export const RISK_LABELS: Record<ChangeRisk, string> = {
  low: "Low — applies straight to the draft",
  medium: "Medium — preview before publishing",
  high: "High — needs your explicit confirmation",
};
