import { createHash, randomBytes } from "node:crypto";

// Pure rules for churches, church admins and facilitator applications — no database, so the
// tests (lib/mcp/church.test.mjs) and every caller share one definition.

export const APPROVAL_TOKEN_TTL_HOURS = 72;

export type ApplicationStatus = "pending" | "approved" | "rejected";
export type ChurchStatus = "active" | "archived";

/** A fresh approval token (sent in the link) and the hash we store. */
export function newApprovalToken(now = new Date(), ttlHours = APPROVAL_TOKEN_TTL_HOURS) {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashApprovalToken(token), expiresAt: new Date(now.getTime() + ttlHours * 3600_000).toISOString() };
}

export function hashApprovalToken(token: string): string {
  return createHash("sha256").update(token.trim()).digest("hex");
}

export type TokenState = "valid" | "expired" | "used" | "decided" | "missing";

/** Whether an application's approval link can still be used. Single-use: any decision or use ends it. */
export function approvalTokenState(
  app: { status: string; token_hash?: string | null; token_expires_at?: string | null; token_used_at?: string | null } | null,
  now = new Date(),
): TokenState {
  if (!app || !app.token_hash) return "missing";
  if (app.token_used_at) return "used";
  if (app.status !== "pending") return "decided";
  if (!app.token_expires_at || new Date(app.token_expires_at).getTime() <= now.getTime()) return "expired";
  return "valid";
}

export const TOKEN_STATE_MESSAGES: Record<Exclude<TokenState, "valid">, string> = {
  missing: "This approval link isn't valid.",
  used: "This approval link has already been used.",
  decided: "This application has already been decided.",
  expired: "This approval link has expired. Decide it from Churches → Applications instead.",
};

/**
 * The church-scoping rule: a group may be an official church group (church_id set) only when its
 * facilitator has an APPROVED facilitator application for that church. Returns the refusal, or null.
 */
export function churchGroupProblem(churchId: string | null | undefined, approvedChurchIds: readonly string[]): string | null {
  if (!churchId) return null;
  if (approvedChurchIds.includes(churchId)) return null;
  return "This facilitator hasn't been approved by that church yet, so the group can't be listed as an official church group. Ask the church admin to approve their facilitator application first.";
}

/** Who may decide a facilitator application: a Super Admin, or an active admin of that church. */
export function canDecideFacilitatorApplication(actor: { role: string; adminChurchIds: readonly string[] }, churchId: string): boolean {
  return actor.role === "super_admin" || actor.adminChurchIds.includes(churchId);
}

export function slugifyChurch(name: string) {
  return name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "church";
}
