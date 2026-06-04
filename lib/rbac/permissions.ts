import { ROLES, normalizeAppRole, type AppRole } from "./roles";

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  MANAGE_USERS: "manage_users",
  MANAGE_PARTICIPANTS: "manage_participants",
  MANAGE_SURVEYS: "manage_surveys",
  REVIEW_CONTENT: "review_content",
  VIEW_REPORTS: "view_reports",
  MANAGE_SETTINGS: "manage_settings",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_PARTICIPANTS,
    PERMISSIONS.MANAGE_SURVEYS,
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.MANAGE_SETTINGS,
  ],
  [ROLES.TEAM_MEMBER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PARTICIPANTS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.CONTENT_REVIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.REVIEW_CONTENT,
    PERMISSIONS.VIEW_REPORTS,
  ],
  [ROLES.PASTOR_ELDER_REVIEWER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.REVIEW_CONTENT,
  ],
  [ROLES.PARTICIPANT]: [],
};

export function can(role: string | null | undefined, permission: Permission) {
  const normalizedRole = normalizeAppRole(role);
  if (!normalizedRole) return false;
  if (normalizedRole === ROLES.SUPER_ADMIN) return true;
  return ROLE_PERMISSIONS[normalizedRole]?.includes(permission) ?? false;
}
