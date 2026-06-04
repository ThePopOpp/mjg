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
  return Boolean(normalizeAppRole(role));
}

export function normalizeAppRole(role: string | null | undefined): AppRole | null {
  const normalized = role?.trim().toLowerCase();
  const matchedRole = Object.values(ROLES).find((value) => value === normalized);
  return matchedRole ?? null;
}

export function canAccessDashboard(role: string | null | undefined) {
  const normalizedRole = normalizeAppRole(role);
  return Boolean(normalizedRole && (DASHBOARD_ROLES as readonly AppRole[]).includes(normalizedRole));
}
