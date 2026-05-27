import {
  BarChart3,
  CalendarRange,
  CheckSquare,
  CircleUserRound,
  FileBarChart,
  Home,
  MailCheck,
  MessageSquareText,
  Settings,
  Tags,
  UsersRound,
  Waves,
} from "lucide-react";

export const dashboardNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/participants", label: "Participants", icon: UsersRound },
  { href: "/dashboard/waves", label: "Waves", icon: Waves },
  { href: "/dashboard/check-in-results", label: "Check-In Results", icon: CheckSquare },
  { href: "/dashboard/surveys", label: "Surveys", icon: MessageSquareText },
  { href: "/dashboard/pastor-elder-review", label: "Pastor/Elder Review", icon: CircleUserRound },
  { href: "/dashboard/inner-circle", label: "Inner Circle", icon: CalendarRange },
  { href: "/dashboard/email-journey", label: "Email Journey", icon: MailCheck },
  { href: "/dashboard/tags-segments", label: "Tags & Segments", icon: Tags },
  { href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/user-management", label: "User Management", icon: BarChart3 },
] as const;
