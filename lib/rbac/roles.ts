export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEAM_MEMBER: "team_member",
  CONTENT_REVIEWER: "content_reviewer",
  PASTOR_ELDER_REVIEWER: "pastor_elder_reviewer",
  PARTICIPANT: "participant",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<AppRole, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.TEAM_MEMBER]: "Team Member",
  [ROLES.CONTENT_REVIEWER]: "Content Reviewer",
  [ROLES.PASTOR_ELDER_REVIEWER]: "Pastor/Elder Reviewer",
  [ROLES.PARTICIPANT]: "Participant",
};

export const DASHBOARD_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.TEAM_MEMBER,
  ROLES.CONTENT_REVIEWER,
  ROLES.PASTOR_ELDER_REVIEWER,
] as const satisfies readonly AppRole[];

export function isAppRole(role: string | null | undefined): role is AppRole {
  return Object.values(ROLES).includes(role as AppRole);
}

export function canAccessDashboard(role: string | null | undefined) {
  return isAppRole(role) && (DASHBOARD_ROLES as readonly AppRole[]).includes(role);
}
