import {
  BarChart3,
  BatteryCharging,
  BookMarked,
  BookOpen,
  Building2,
  Church,
  Link2,
  LineChart,
  Bot,
  CalendarClock,
  CalendarRange,
  Palette,
  CheckSquare,
  CircleUserRound,
  ClipboardList,
  CreditCard,
  Plug,
  Download,
  FileText,
  FileBarChart,
  FolderKanban,
  Home,
  Newspaper,
  IdCard,
  MailCheck,
  MessagesSquare,
  MonitorPlay,
  MessageSquare,
  MessageSquareText,
  NotebookPen,
  PanelsTopLeft,
  Receipt,
  Phone,
  Settings,
  Share2,
  SquarePen,
  Sparkles,
  Users,
  UsersRound,
  UserCircle,
  Waves,
  MapPinned,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PERMISSIONS, can, type Permission } from "@/lib/rbac/permissions";
import { ROLES, type AppRole } from "@/lib/rbac/roles";

export type NavLeaf = { href: string; label: string; icon: LucideIcon; permission?: Permission };
export type NavGroup = { kind: "group"; label: string; icon: LucideIcon; items: NavLeaf[] };
export type NavEntry = ({ kind: "item" } & NavLeaf) | NavGroup;

// Sidebar navigation. Items render flat; a group renders as a collapsible accordion
// (a group left with one visible item, after permissions, renders as that item).
export const dashboardNav: NavEntry[] = [
  { kind: "item", href: "/dashboard", label: "Dashboard", icon: Home },
  {
    kind: "group", label: "Community", icon: Users, items: [
      { href: "/dashboard/participants", label: "Participants", icon: UsersRound, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/facilitators", label: "Facilitators & Groups", icon: MapPinned, permission: PERMISSIONS.MANAGE_USERS },
      { href: "/dashboard/churches", label: "Churches", icon: Church, permission: PERMISSIONS.MANAGE_CHURCHES },
      { href: "/dashboard/forgedlife", label: "ForgedLife", icon: Link2, permission: PERMISSIONS.MANAGE_FORGEDLIFE },
      { href: "/dashboard/contacts", label: "Contacts", icon: UserCircle, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/waves", label: "Waves", icon: Waves, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/check-in-results", label: "Check-In Results", icon: CheckSquare, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/energy-audit", label: "Energy Audit", icon: BatteryCharging, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/book-waitlist", label: "Book Waitlist", icon: BookMarked, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/surveys", label: "Surveys", icon: MessageSquareText, permission: PERMISSIONS.MANAGE_SURVEYS },
      { href: "/dashboard/pastor-elder-review", label: "Pastor/Elder Review", icon: CircleUserRound, permission: PERMISSIONS.MANAGE_SURVEYS },
      { href: "/dashboard/inner-circle", label: "Inner Circle", icon: CalendarRange, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
    ],
  },
  {
    kind: "group", label: "Experiences", icon: Sparkles, items: [
      { href: "/dashboard/experiences", label: "All Experiences", icon: Sparkles, permission: PERMISSIONS.MANAGE_EXPERIENCES },
      { href: "/dashboard/experiences/automation", label: "Email Automation", icon: MailCheck, permission: PERMISSIONS.MANAGE_EXPERIENCES },
    ],
  },
  {
    // Day-to-day work tools. Project Manager, Plans and Bookings are staff-only
    // (requireStaffPage); Workspace and Reports carry their own permissions.
    kind: "group", label: "Manage", icon: NotebookPen, items: [
      { href: "/dashboard/workspace", label: "Workspace", icon: NotebookPen, permission: PERMISSIONS.MANAGE_WORKSPACE },
      { href: "/dashboard/project-manager", label: "Project Manager", icon: FolderKanban },
      { href: "/dashboard/plans", label: "Plans", icon: ClipboardList },
      { href: "/dashboard/bookings", label: "Bookings & Events", icon: CalendarClock },
      { href: "/dashboard/analytics", label: "Analytics", icon: LineChart, permission: PERMISSIONS.VIEW_REPORTS },
      { href: "/dashboard/reports", label: "Reports", icon: FileBarChart, permission: PERMISSIONS.VIEW_REPORTS },
    ],
  },
  {
    kind: "group", label: "Communications", icon: MessagesSquare, items: [
      { href: "/dashboard/emails", label: "Emails", icon: MailCheck, permission: PERMISSIONS.MANAGE_SETTINGS },
      { href: "/dashboard/direct-messages", label: "Direct Messages", icon: MessageSquareText },
      { href: "/dashboard/sms", label: "SMS", icon: MessageSquare, permission: PERMISSIONS.MANAGE_SETTINGS },
      { href: "/dashboard/dialer", label: "Dialer", icon: Phone, permission: PERMISSIONS.MANAGE_SETTINGS },
      { href: "/dashboard/social-media", label: "Social Media", icon: Share2, permission: PERMISSIONS.MANAGE_SETTINGS },
      { href: "/dashboard/business-cards", label: "Business Cards", icon: IdCard, permission: PERMISSIONS.MANAGE_SETTINGS },
    ],
  },
  {
    // Everyone sees their own billing; Stripe (coupons, products) is Super-Admin only.
    kind: "group", label: "Purchases & Billing", icon: Receipt, items: [
      { href: "/dashboard/billing", label: "Purchases & Billing", icon: Receipt },
      { href: "/dashboard/stripe", label: "Stripe", icon: CreditCard, permission: PERMISSIONS.MANAGE_STRIPE },
    ],
  },
  {
    // Shepherd (the admin AI Agent), Steward (the member product's settings, Super-Admin
    // only, enforced in app/dashboard/steward/page.tsx and on the API route) and the
    // Claude connector (MCP: on/off, connections, agent tokens, approvals).
    kind: "group", label: "Artificial Intelligence", icon: Bot, items: [
      { href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot, permission: PERMISSIONS.MANAGE_SETTINGS },
      { href: "/dashboard/steward", label: "Steward", icon: Sparkles, permission: PERMISSIONS.MANAGE_SETTINGS },
      { href: "/dashboard/claude", label: "Claude & Agents", icon: Plug, permission: PERMISSIONS.MANAGE_CONNECTOR },
    ],
  },
  {
    kind: "group", label: "Media Studio", icon: MonitorPlay, items: [
      { href: "/dashboard/media-studio", label: "Media Studio", icon: MonitorPlay, permission: PERMISSIONS.MANAGE_SETTINGS },
      { href: "/dashboard/assets", label: "Assets", icon: Palette, permission: PERMISSIONS.MANAGE_SETTINGS },
    ],
  },
  {
    // The Frontend Editor ("Editor") nests under CMS: same Super-Admin guard
    // (app/dashboard/cms/layout.tsx wraps everything below /dashboard/cms).
    // Blog Posts keeps its own, wider permission (content reviewers).
    kind: "group", label: "Content Manager", icon: PanelsTopLeft, items: [
      { href: "/dashboard/cms", label: "CMS", icon: PanelsTopLeft, permission: PERMISSIONS.MANAGE_CMS },
      { href: "/dashboard/cms/editor", label: "Editor", icon: SquarePen, permission: PERMISSIONS.MANAGE_CMS },
      { href: "/dashboard/blog-posts", label: "Blog Posts", icon: FileText, permission: PERMISSIONS.REVIEW_CONTENT },
      { href: "/dashboard/annual-retreat", label: "Annual Retreat", icon: BookMarked, permission: PERMISSIONS.MANAGE_CMS },
    ],
  },
  { kind: "item", href: "/dashboard/guide", label: "Team Guide", icon: BookOpen },
  { kind: "item", href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  { kind: "item", href: "/dashboard/settings", label: "Settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/user-management", label: "User Management", icon: BarChart3, permission: PERMISSIONS.MANAGE_USERS },
];

// Facilitators get a dedicated, scoped sidebar (not the admin nav). Phase 2 ships the
// core: Dashboard, My Team, Direct Messages. Downloads / Experiences (receive views) /
// In The News / My Profile / Settings arrive in Phase 3.
export const facilitatorNav: NavEntry[] = [
  { kind: "item", href: "/dashboard", label: "Dashboard", icon: Home },
  { kind: "item", href: "/dashboard/team", label: "My Team", icon: UsersRound },
  { kind: "item", href: "/dashboard/facilitator-listing", label: "Facilitator Listing", icon: MapPinned },
  { kind: "item", href: "/dashboard/my-church", label: "My Church", icon: Church },
  { kind: "item", href: "/dashboard/my-experiences", label: "Experiences", icon: Sparkles },
  { kind: "item", href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { kind: "item", href: "/dashboard/resources", label: "Resources", icon: Newspaper },
  { kind: "item", href: "/dashboard/direct-messages", label: "Direct Messages", icon: MessageSquareText },
  { kind: "item", href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  { kind: "item", href: "/dashboard/billing", label: "Purchases & Billing", icon: Receipt },
  { kind: "item", href: "/dashboard/preferences", label: "Settings", icon: Settings },
];

// Same as the facilitator, minus admin-only actions. Participants see their team and
// communicate; they cannot add participants.
export const participantNav: NavEntry[] = [
  { kind: "item", href: "/dashboard", label: "Dashboard", icon: Home },
  { kind: "item", href: "/dashboard/team", label: "My Team", icon: UsersRound },
  { kind: "item", href: "/groups", label: "Find a Group", icon: MapPinned },
  { kind: "item", href: "/dashboard/my-church", label: "My Church", icon: Church },
  { kind: "item", href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { kind: "item", href: "/dashboard/resources", label: "Resources", icon: Newspaper },
  { kind: "item", href: "/dashboard/direct-messages", label: "Direct Messages", icon: MessageSquareText },
  { kind: "item", href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  { kind: "item", href: "/dashboard/billing", label: "Purchases & Billing", icon: Receipt },
  { kind: "item", href: "/dashboard/preferences", label: "Settings", icon: Settings },
];

// Church admins get the whole facilitator sidebar, with My Church pointing at the church they
// run (approvals) and their church's public profile.
export const churchAdminNav: NavEntry[] = facilitatorNav.flatMap((entry): NavEntry[] =>
  entry.kind === "item" && entry.href === "/dashboard/my-church"
    ? [
        { kind: "item", href: "/dashboard/church", label: "My Church", icon: Church },
        { kind: "item", href: "/dashboard/church/profile", label: "Church Profile", icon: Building2 },
      ]
    : [entry],
);

/** The sidebar a role gets: facilitators, participants and church admins have their own. */
export function navForRole(role: AppRole): NavEntry[] {
  return role === ROLES.FACILITATOR ? facilitatorNav
    : role === ROLES.PARTICIPANT ? participantNav
    : role === ROLES.CHURCH_ADMIN ? churchAdminNav
    : dashboardNav;
}

/** Permission-filtered nav: items the role can't see are dropped, then empty groups. */
export function visibleNav(role: AppRole): NavEntry[] {
  return navForRole(role)
    .map((entry): NavEntry | null => {
      if (entry.kind === "group") {
        const items = entry.items.filter((it) => !it.permission || can(role, it.permission));
        if (items.length === 1) return { kind: "item", ...items[0] };
        return items.length ? { ...entry, items } : null;
      }
      return !entry.permission || can(role, entry.permission) ? entry : null;
    })
    .filter((e): e is NavEntry => e !== null);
}
