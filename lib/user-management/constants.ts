export const USER_STATUSES = ["active", "invited", "pending", "suspended", "archived", "inactive"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

/** The owner account: never deleted, demoted or deactivated — not even by another Super Admin. */
export const OWNER_EMAILS = new Set(["jw@michaeljgauthier.com"]);

export function isOwnerEmail(email: string | null | undefined): boolean {
  return Boolean(email && OWNER_EMAILS.has(email.trim().toLowerCase()));
}
