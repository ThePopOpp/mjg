export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  TEAM_MEMBER: "team_member",
  FACILITATOR: "facilitator",
  CONTENT_REVIEWER: "content_reviewer",
  PASTOR_ELDER_REVIEWER: "pastor_elder_reviewer",
  CHURCH_ADMIN: "church_admin",
  PARTICIPANT: "participant",
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<AppRole, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.TEAM_MEMBER]: "Team Member",
  [ROLES.FACILITATOR]: "Facilitator",
  [ROLES.CONTENT_REVIEWER]: "Content Reviewer",
  [ROLES.PASTOR_ELDER_REVIEWER]: "Pastor/Elder Reviewer",
  [ROLES.CHURCH_ADMIN]: "Church Admin",
  [ROLES.PARTICIPANT]: "Participant",
};

export const DASHBOARD_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.TEAM_MEMBER,
  ROLES.FACILITATOR,
  ROLES.CONTENT_REVIEWER,
  ROLES.PASTOR_ELDER_REVIEWER,
  ROLES.PARTICIPANT,
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

// Portal = the member-facing area (facilitators + participants) plus everyone who can
// see the admin dashboard. Use this to gate shared content pages (Resources, Downloads,
// My Team, etc.) — NOT admin-only pages, which stay on canAccessDashboard.
// Church admins are portal-only on purpose: they are NOT in DASHBOARD_ROLES, so pages
// gated on canAccessDashboard stay closed to them. They see /dashboard/church only.
export function canAccessPortal(role: string | null | undefined) {
  const normalized = normalizeAppRole(role);
  return canAccessDashboard(role) || normalized === ROLES.PARTICIPANT || normalized === ROLES.CHURCH_ADMIN;
}
