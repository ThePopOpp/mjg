import { ROLES, normalizeAppRole, type AppRole } from "./roles";

export const PERMISSIONS = {
  VIEW_DASHBOARD: "view_dashboard",
  MANAGE_USERS: "manage_users",
  MANAGE_PARTICIPANTS: "manage_participants",
  MANAGE_SURVEYS: "manage_surveys",
  REVIEW_CONTENT: "review_content",
  VIEW_REPORTS: "view_reports",
  MANAGE_SETTINGS: "manage_settings",
  // Admin + Super-Admin. Build & send Experiences (the admin-driven program builder).
  MANAGE_EXPERIENCES: "manage_experiences",
  // Super-Admin-only. Not granted to any other role below, so can(role, MANAGE_CMS)
  // is true ONLY for super_admin (via the super-admin shortcut in can()).
  MANAGE_CMS: "manage_cms",
  // Super-Admin-only (same pattern as MANAGE_CMS): the Workspace module.
  MANAGE_WORKSPACE: "manage_workspace",
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
    PERMISSIONS.MANAGE_EXPERIENCES,
  ],
  [ROLES.TEAM_MEMBER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PARTICIPANTS,
    PERMISSIONS.VIEW_REPORTS,
  ],
  // Facilitators log into the dashboard but do not build Experiences; they are
  // assigned to programs and (in a later phase) get a dedicated portal.
  [ROLES.FACILITATOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
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
