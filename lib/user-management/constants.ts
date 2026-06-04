export const USER_STATUSES = ["active", "invited", "pending", "suspended", "archived", "inactive"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];
