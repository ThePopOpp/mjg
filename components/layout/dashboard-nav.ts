import {
  BarChart3,
  BookOpen,
  Bot,
  CalendarClock,
  CalendarRange,
  Palette,
  CheckSquare,
  CircleUserRound,
  FileText,
  FileBarChart,
  FolderKanban,
  Home,
  IdCard,
  MailCheck,
  MessagesSquare,
  MonitorPlay,
  MessageSquare,
  MessageSquareText,
  PanelsTopLeft,
  Phone,
  Settings,
  Share2,
  TrendingUp,
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
      { href: "/dashboard/participants", label: "Participants", icon: UsersRound },
      { href: "/dashboard/contacts", label: "Contacts", icon: UserCircle },
      { href: "/dashboard/waves", label: "Waves", icon: Waves },
      { href: "/dashboard/check-in-results", label: "Check-In Results", icon: CheckSquare },
      { href: "/dashboard/surveys", label: "Surveys", icon: MessageSquareText },
      { href: "/dashboard/pastor-elder-review", label: "Pastor/Elder Review", icon: CircleUserRound },
      { href: "/dashboard/inner-circle", label: "Inner Circle", icon: CalendarRange },
    ],
  },
  { kind: "item", href: "/dashboard/blog-posts", label: "Blog Posts", icon: FileText, permission: PERMISSIONS.REVIEW_CONTENT },
  { kind: "item", href: "/dashboard/impact-score", label: "Impact Score", icon: TrendingUp, permission: PERMISSIONS.REVIEW_CONTENT },
  {
    kind: "group", label: "Communications", icon: MessagesSquare, items: [
      { href: "/dashboard/emails", label: "Emails", icon: MailCheck },
      { href: "/dashboard/sms", label: "SMS", icon: MessageSquare },
      { href: "/dashboard/dialer", label: "Dialer", icon: Phone },
      { href: "/dashboard/social-media", label: "Social Media", icon: Share2 },
      { href: "/dashboard/business-cards", label: "Business Cards", icon: IdCard },
    ],
  },
  { kind: "item", href: "/dashboard/project-manager", label: "Project Manager", icon: FolderKanban },
  { kind: "item", href: "/dashboard/bookings", label: "Bookings & Events", icon: CalendarClock },
  { kind: "item", href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/media-studio", label: "Media Studio", icon: MonitorPlay, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/assets", label: "Assets", icon: Palette, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/cms", label: "CMS", icon: PanelsTopLeft, permission: PERMISSIONS.MANAGE_CMS },
  { kind: "item", href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
  { kind: "item", href: "/dashboard/guide", label: "Team Guide", icon: BookOpen },
  { kind: "item", href: "/dashboard/settings", label: "Settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
  { kind: "item", href: "/dashboard/user-management", label: "User Management", icon: BarChart3, permission: PERMISSIONS.MANAGE_USERS },
];
