import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarClock,
  CalendarRange,
  Palette,
  CheckSquare,
  CircleUserRound,
  ClipboardList,
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
  Phone,
  Settings,
  Share2,
  Sparkles,
  Users,
  UsersRound,
  UserCircle,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PERMISSIONS, type Permission } from "@/lib/rbac/permissions";

export type NavLeaf = { href: string; label: string; icon: LucideIcon; permission?: Permission };
export type NavGroup = { kind: "group"; label: string; icon: LucideIcon; items: NavLeaf[] };
export type NavEntry = ({ kind: "item" } & NavLeaf) | NavGroup;

// Sidebar navigation. Items render flat; a group renders as a collapsible accordion.
export const dashboardNav: NavEntry[] = [
  { kind: "item", href: "/dashboard", label: "Dashboard", icon: Home },
  {
    kind: "group", label: "Community", icon: Users, items: [
      { href: "/dashboard/participants", label: "Participants", icon: UsersRound, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/contacts", label: "Contacts", icon: UserCircle, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/waves", label: "Waves", icon: Waves, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/check-in-results", label: "Check-In Results", icon: CheckSquare, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
      { href: "/dashboard/surveys", label: "Surveys", icon: MessageSquareText, permission: PERMISSIONS.MANAGE_SURVEYS },
      { href: "/dashboard/pastor-elder-review", label: "Pastor/Elder Review", icon: CircleUserRound, permission: PERMISSIONS.MANAGE_SURVEYS },
      { href: "/dashboard/inner-circle", label: "Inner Circle", icon: CalendarRange, permission: PERMISSIONS.MANAGE_PARTICIPANTS },
    ],
  },
  { kind: "item", href: "/dashboard/blog-posts", label: "Blog Posts", icon: FileText, permission: PERMISSIONS.REVIEW_CONTENT },
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
  { kind: "item", href: "/dashboard/project-manager", label: "Project Manager", icon: FolderKanban },
  { kind: "item", href: "/dashboard/plans", label: "Plans", icon: ClipboardList },
  { kind: "item", href: "/dashboard/workspace", label: "Workspace", icon: NotebookPen, permission: PERMISSIONS.MANAGE_WORKSPACE },
  { kind: "item", href: "/dashboard/bookings", label: "Bookings & Events", icon: CalendarClock },
  { kind: "item", href: "/dashboard/experiences", label: "Experiences", icon: Sparkles, permission: PERMISSIONS.MANAGE_EXPERIENCES },
  { kind: "item", href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/media-studio", label: "Media Studio", icon: MonitorPlay, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/assets", label: "Assets", icon: Palette, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/cms", label: "CMS", icon: PanelsTopLeft, permission: PERMISSIONS.MANAGE_CMS },
  { kind: "item", href: "/dashboard/reports", label: "Reports", icon: FileBarChart, permission: PERMISSIONS.VIEW_REPORTS },
  { kind: "item", href: "/dashboard/guide", label: "Team Guide", icon: BookOpen },
  { kind: "item", href: "/dashboard/settings", label: "Settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/user-management", label: "User Management", icon: BarChart3, permission: PERMISSIONS.MANAGE_USERS },
];

// Facilitators get a dedicated, scoped sidebar (not the admin nav). Phase 2 ships the
// core: Dashboard, My Team, Direct Messages. Downloads / Experiences (receive views) /
// In The News / My Profile / Settings arrive in Phase 3.
export const facilitatorNav: NavEntry[] = [
  { kind: "item", href: "/dashboard", label: "Dashboard", icon: Home },
  { kind: "item", href: "/dashboard/team", label: "My Team", icon: UsersRound },
  { kind: "item", href: "/dashboard/my-experiences", label: "Experiences", icon: Sparkles },
  { kind: "item", href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { kind: "item", href: "/dashboard/resources", label: "Resources", icon: Newspaper },
  { kind: "item", href: "/dashboard/direct-messages", label: "Direct Messages", icon: MessageSquareText },
  { kind: "item", href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  { kind: "item", href: "/dashboard/preferences", label: "Settings", icon: Settings },
];

// Same as the facilitator, minus admin-only actions. Participants see their team and
// communicate; they cannot add participants.
export const participantNav: NavEntry[] = [
  { kind: "item", href: "/dashboard", label: "Dashboard", icon: Home },
  { kind: "item", href: "/dashboard/team", label: "My Team", icon: UsersRound },
  { kind: "item", href: "/dashboard/downloads", label: "Downloads", icon: Download },
  { kind: "item", href: "/dashboard/resources", label: "Resources", icon: Newspaper },
  { kind: "item", href: "/dashboard/direct-messages", label: "Direct Messages", icon: MessageSquareText },
  { kind: "item", href: "/dashboard/profile", label: "My Profile", icon: UserCircle },
  { kind: "item", href: "/dashboard/preferences", label: "Settings", icon: Settings },
];
