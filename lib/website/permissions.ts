// Frontend Editor — capability model (spec §4).
//
// The route itself is Super-Admin-gated (the /dashboard/cms layout guard plus
// requireSuperAdmin on every API route plus RLS). This layer sits on top so the
// spec's role table has a single, testable home: widening access to staff later
// is a change to CAPABILITIES, not a redesign of the editor.

import { ROLES, normalizeAppRole } from "@/lib/rbac/roles";

export const WEBSITE_CAPABILITIES = [
  "view",
  "editDraft",
  "createPage",
  "publish",
  "archive",
  "restore",
  "deletePermanently",
  "manageNavigation",
  "manageGlobals",
  "manageSeo",
  "manageSettings",
  "useSteward",
  "viewAuditLog",
] as const;

export type WebsiteCapability = (typeof WEBSITE_CAPABILITIES)[number];

const ALL = [...WEBSITE_CAPABILITIES];

/**
 * Super Admin (which is how the Owner account is provisioned in this app) gets
 * everything. Admin is listed with the draft-only set the spec describes for
 * Staff so the shape is ready; the route guard still keeps them out today.
 */
const CAPABILITIES: Record<string, WebsiteCapability[]> = {
  [ROLES.SUPER_ADMIN]: ALL,
  [ROLES.ADMIN]: ["view", "editDraft", "createPage", "manageSeo", "useSteward"],
};

export function websiteCapabilities(role: string | null | undefined): WebsiteCapability[] {
  const normalized = normalizeAppRole(role);
  if (!normalized) return [];
  return CAPABILITIES[normalized] ?? [];
}

export function canWebsite(role: string | null | undefined, capability: WebsiteCapability): boolean {
  return websiteCapabilities(role).includes(capability);
}

/** Throwing form for server actions and Steward tools. */
export function assertWebsiteCapability(role: string | null | undefined, capability: WebsiteCapability): void {
  if (!canWebsite(role, capability)) {
    throw new Error(`Your role cannot ${CAPABILITY_VERBS[capability]} website content.`);
  }
}

const CAPABILITY_VERBS: Record<WebsiteCapability, string> = {
  view: "view",
  editDraft: "edit",
  createPage: "create",
  publish: "publish",
  archive: "archive",
  restore: "restore",
  deletePermanently: "permanently delete",
  manageNavigation: "change the navigation of",
  manageGlobals: "change global content on",
  manageSeo: "change SEO for",
  manageSettings: "change settings for",
  useSteward: "use Steward on",
  viewAuditLog: "review the history of",
};
