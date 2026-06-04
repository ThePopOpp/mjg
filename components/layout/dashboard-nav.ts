import {
  BarChart3,
  CalendarRange,
  CheckSquare,
  CircleUserRound,
  FileText,
  FileBarChart,
  Home,
  MailCheck,
  MonitorPlay,
  MessageSquareText,
  Settings,
  Tags,
  UsersRound,
  Waves,
} from "lucide-react";
import { PERMISSIONS } from "@/lib/rbac/permissions";

export const dashboardNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/participants", label: "Participants", icon: UsersRound },
  { href: "/dashboard/waves", label: "Waves", icon: Waves },
  { href: "/dashboard/check-in-results", label: "Check-In Results", icon: CheckSquare },
  { href: "/dashboard/surveys", label: "Surveys", icon: MessageSquareText },
  { href: "/dashboard/pastor-elder-review", label: "Pastor/Elder Review", icon: CircleUserRound },
  { href: "/dashboard/inner-circle", label: "Inner Circle", icon: CalendarRange },
  { href: "/dashboard/blog-posts", label: "Blog Posts", icon: FileText, permission: PERMISSIONS.REVIEW_CONTENT },
  { href: "/dashboard/emails", label: "Emails", icon: MailCheck },
  { href: "/dashboard/media-studio", label: "Media Studio", icon: MonitorPlay, permission: PERMISSIONS.MANAGE_SETTINGS },
  { href: "/dashboard/tags-segments", label: "Tags & Segments", icon: Tags },
  { href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, permission: PERMISSIONS.MANAGE_SETTINGS },
  { href: "/dashboard/user-management", label: "User Management", icon: BarChart3, permission: PERMISSIONS.MANAGE_USERS },
] as const;
