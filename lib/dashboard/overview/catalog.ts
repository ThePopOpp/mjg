// Every card the Overview dashboard can show. Pure data (no React, no icons) so the
// server API, the layout sanitiser, the tests and the client all share one list.
//
// Access is checked twice: the client hides cards a role can't use, and
// GET /api/dashboard/widgets/[source] refuses to load their data (403).

import { can, PERMISSIONS, type Permission } from "@/lib/rbac/permissions";
import { ROLES, isFacilitatorRole, type AppRole } from "@/lib/rbac/roles";

export type WidgetCategory =
  | "start"
  | "toolbar"
  | "alerts"
  | "stats"
  | "tasks"
  | "calendar"
  | "communications"
  | "financials"
  | "pipeline"
  | "reporting"
  | "content"
  | "workspace"
  | "ai"
  | "files"
  | "tools"
  | "community"
  | "settings";

export const CATEGORY_LABELS: Record<WidgetCategory, string> = {
  start: "Get Started",
  toolbar: "Search & Time",
  alerts: "Notifications",
  stats: "Stat Cards",
  tasks: "Tasks",
  calendar: "Calendar",
  communications: "Communications",
  financials: "Financials",
  pipeline: "Pipeline",
  reporting: "Reporting & Charts",
  content: "Site Content",
  workspace: "Workspace",
  ai: "AI Agents",
  files: "Files & Cloud",
  tools: "Staff Tools",
  community: "Community",
  settings: "Settings",
};

/** Who may add a card and load its data. */
export type Access = "any" | "staff" | "manager" | "admin" | "super" | { permission: Permission };

export function allowed(role: AppRole, access: Access): boolean {
  if (access === "any") return true;
  const staff = !isFacilitatorRole(role) && role !== ROLES.PARTICIPANT;
  if (access === "staff") return staff;
  if (access === "manager") return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN || role === ROLES.TEAM_MEMBER;
  if (access === "admin") return role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN;
  if (access === "super") return role === ROLES.SUPER_ADMIN;
  return can(role, access.permission);
}

export type WidgetDef = {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  /** Grid column span out of 12 when first added. */
  span: number;
  minSpan?: number;
  access: Access;
  /** Server loader the card reads from (several cards can share one). None = client-only. */
  source?: string;
  /** Poll interval for live cards, ms. */
  refreshMs?: number;
  /** Cards that read best in a horizontal rail (stat tiles). */
  tile?: boolean;
  /** Only one copy makes sense (personal notepad etc.). Default true. */
  single?: boolean;
  keywords?: string;
};

const STAT = (id: string, title: string, description: string, access: Access = "manager", keywords = ""): WidgetDef => ({
  id: `stat.${id}`,
  title,
  description,
  category: "stats",
  span: 3,
  access,
  source: "stats",
  tile: true,
  refreshMs: 60_000,
  keywords,
});

export const WIDGETS: WidgetDef[] = [
  // ── Get started & toolbar ──────────────────────────────────────────────────
  { id: "start.checklist", title: "Get Started", description: "A short setup checklist for your account and this dashboard.", category: "start", span: 12, access: "any", source: "getstarted" },
  { id: "toolbar.search", title: "Search", description: "Search features, people, bookings and content. Ctrl/⌘ K anywhere.", category: "toolbar", span: 5, minSpan: 3, access: "any" },
  { id: "toolbar.features", title: "All Features", description: "Every part of the site you can open, grouped and searchable.", category: "toolbar", span: 2, minSpan: 2, access: "any" },
  { id: "toolbar.clock", title: "Date & Time", description: "Today's date and a live clock.", category: "toolbar", span: 2, minSpan: 2, access: "any" },
  { id: "toolbar.weather", title: "Weather", description: "Current conditions with an animated icon. Uses your location or a city you choose.", category: "toolbar", span: 3, minSpan: 2, access: "any", source: "weather", refreshMs: 15 * 60_000 },

  // ── Notifications row ──────────────────────────────────────────────────────
  { id: "alert.agent", title: "AI Agent", description: "Agent approvals waiting for you and open agent tasks.", category: "alerts", span: 4, access: "staff", source: "alerts", refreshMs: 60_000, keywords: "shepherd claude approvals" },
  { id: "alert.next-todo", title: "Up Next", description: "Your next booking, task due or reminder.", category: "alerts", span: 4, access: "any", source: "alerts", refreshMs: 60_000, keywords: "calendar todo reminder" },
  { id: "alert.jobs", title: "Job Alerts", description: "Background jobs needing attention: failed sends, agent failures, dev requests.", category: "alerts", span: 4, access: "staff", source: "alerts", refreshMs: 60_000 },
  { id: "alert.notifications", title: "Notifications", description: "Your unread notifications, with dismiss.", category: "alerts", span: 6, access: "any", source: "notifications", refreshMs: 60_000 },

  // ── Stat cards ─────────────────────────────────────────────────────────────
  STAT("calls", "Calls", "All calls in the period.", "manager", "phone voice"),
  STAT("outbound", "Outbound", "Calls you placed.", "manager", "phone"),
  STAT("inbound", "Inbound", "Calls received.", "manager", "phone"),
  STAT("missed", "Missed", "Inbound calls not answered.", "manager", "phone voicemail"),
  STAT("sms", "SMS", "Text messages sent and received.", "manager", "text"),
  STAT("bookings", "Bookings", "Bookings made in the period, and upcoming.", "staff"),
  STAT("calendar", "Calendar", "Events and bookings on the calendar this week.", "staff", "events"),
  STAT("notifications", "Notifications", "Your unread notifications.", "any"),
  STAT("messages", "Messages", "Unread direct messages.", "any", "dm chat"),
  STAT("alerts", "Alerts", "Things that need attention: failed sends and approvals.", "staff"),
  STAT("emails", "Emails", "Emails received in the inbox.", "admin", "inbox"),
  STAT("files", "Files", "Files in the media library and storage used.", "staff", "media storage cloud"),
  STAT("checkins", "Check-Ins", "Created for More Check-Ins completed.", "staff"),
  STAT("leads", "New Leads", "Leads added in the period.", "manager", "pipeline sales"),
  STAT("signups", "Sign-ups", "New accounts in the period.", "manager", "registrations"),
  STAT("revenue", "Revenue", "Paid orders in the period.", "super", "stripe money sales"),

  // ── Tasks ──────────────────────────────────────────────────────────────────
  { id: "tasks.my", title: "My Tasks", description: "Project tasks assigned to you, overdue first, in a sliding row.", category: "tasks", span: 12, access: "staff", source: "mytasks", refreshMs: 120_000 },
  { id: "tools.todo", title: "To-Do List", description: "Your private checklist.", category: "tasks", span: 4, access: "any", source: "items" },
  { id: "tools.reminders", title: "Reminders", description: "Set a reminder; it arrives as a notification when due.", category: "tasks", span: 4, access: "any", source: "items" },

  // ── Calendar ───────────────────────────────────────────────────────────────
  { id: "calendar.month", title: "Month Calendar", description: "This month with bookings, events, tasks and reminders.", category: "calendar", span: 6, minSpan: 4, access: "staff", source: "calendar" },
  { id: "calendar.upcoming", title: "Upcoming", description: "The next bookings and events.", category: "calendar", span: 4, access: "staff", source: "calendar" },

  // ── Communications ─────────────────────────────────────────────────────────
  { id: "comms.dms", title: "Direct Messages", description: "Unread, active and awaiting-reply conversations.", category: "communications", span: 12, access: "any", source: "dms", refreshMs: 30_000 },
  { id: "comms.calls", title: "Recent Calls", description: "Latest calls with direction, status and recordings.", category: "communications", span: 6, access: "manager", source: "calls", keywords: "phone voicemail recording" },
  { id: "comms.sms", title: "SMS Conversations", description: "Most recent text conversations.", category: "communications", span: 6, access: "manager", source: "sms" },
  { id: "comms.email", title: "Email Inbox", description: "Latest emails received.", category: "communications", span: 6, access: "admin", source: "email" },

  // ── Financials ─────────────────────────────────────────────────────────────
  { id: "fin.revenue", title: "Revenue & Forecast", description: "Paid orders over the last 90 days with a 30-day forecast.", category: "financials", span: 6, access: "super", source: "revenue", keywords: "stripe forecast sales" },
  { id: "fin.orders", title: "Recent Orders", description: "The latest purchases.", category: "financials", span: 6, access: "super", source: "revenue", keywords: "stripe" },

  // ── Pipeline ───────────────────────────────────────────────────────────────
  { id: "pipe.leads", title: "Leads Pipeline", description: "Leads by stage.", category: "pipeline", span: 6, access: "manager", source: "leads", keywords: "sales crm" },
  { id: "pipe.recent-leads", title: "Newest Leads", description: "Leads added most recently.", category: "pipeline", span: 6, access: "manager", source: "leads" },

  // ── Reporting & charts ─────────────────────────────────────────────────────
  { id: "rep.traffic", title: "Website Traffic", description: "Visitors per day over the last 30 days.", category: "reporting", span: 8, minSpan: 4, access: { permission: PERMISSIONS.VIEW_REPORTS }, source: "traffic", keywords: "analytics chart" },
  { id: "rep.top-pages", title: "Top Pages", description: "Most visited pages this month.", category: "reporting", span: 4, access: { permission: PERMISSIONS.VIEW_REPORTS }, source: "traffic", keywords: "analytics" },
  { id: "rep.sources", title: "Traffic Sources", description: "Where visitors came from this month.", category: "reporting", span: 4, access: { permission: PERMISSIONS.VIEW_REPORTS }, source: "traffic", keywords: "analytics referrers" },
  { id: "rep.signups", title: "Sign-ups Trend", description: "New accounts per day with a 14-day forecast.", category: "reporting", span: 6, access: "manager", source: "signups", keywords: "chart forecast registrations" },

  // ── Site content ───────────────────────────────────────────────────────────
  { id: "content.blog", title: "Blog Posts", description: "Latest posts and their status.", category: "content", span: 6, access: { permission: PERMISSIONS.REVIEW_CONTENT }, source: "content" },
  { id: "content.website", title: "Website Changes", description: "Website change sets waiting for review.", category: "content", span: 6, access: "super", source: "content", keywords: "cms editor" },
  { id: "content.social", title: "Scheduled Social", description: "Upcoming social media posts.", category: "content", span: 6, access: "admin", source: "content", keywords: "facebook linkedin" },

  // ── Workspace ──────────────────────────────────────────────────────────────
  { id: "ws.docs", title: "Workspace Docs", description: "Recently edited Workspace documents.", category: "workspace", span: 6, access: "super", source: "workspace", keywords: "notes docs" },

  // ── AI agents ──────────────────────────────────────────────────────────────
  { id: "ai.shepherd", title: "Ask Shepherd", description: "Ask the AI agent anything about the business.", category: "ai", span: 6, access: "admin", keywords: "chat assistant" },
  { id: "ai.tasks", title: "Agent Tasks", description: "Open tasks for your AI agents.", category: "ai", span: 6, access: "super", source: "agents", keywords: "paperclip codex" },
  { id: "ai.dev-requests", title: "Dev Requests", description: "Requests queued for Claude.", category: "ai", span: 6, access: "super", source: "agents" },
  { id: "ai.steward", title: "Steward Usage", description: "Member Steward conversations this month.", category: "ai", span: 4, access: "super", source: "steward" },

  // ── Files ──────────────────────────────────────────────────────────────────
  { id: "files.recent", title: "Recent Uploads", description: "Latest files added to the media library.", category: "files", span: 6, access: "staff", source: "files", keywords: "media cloud" },

  // ── Staff tools ────────────────────────────────────────────────────────────
  { id: "tools.dialpad", title: "Dialpad", description: "Place and answer calls from the dashboard.", category: "tools", span: 4, minSpan: 3, access: "manager", keywords: "phone call softphone" },
  { id: "tools.recorder", title: "Voice Recorder", description: "Record a voice memo, play it back and transcribe it.", category: "tools", span: 4, minSpan: 3, access: "any", source: "items", keywords: "audio memo" },
  { id: "tools.notepad", title: "Notepad", description: "A private scratch pad that saves as you type.", category: "tools", span: 4, minSpan: 3, access: "any", source: "items", keywords: "notes" },
  { id: "tools.calculator", title: "Calculator", description: "A quick calculator.", category: "tools", span: 3, minSpan: 2, access: "any" },
  { id: "tools.world-clock", title: "World Clock", description: "Times in the zones you choose.", category: "tools", span: 3, minSpan: 2, access: "any", keywords: "timezone" },
  { id: "tools.quick-links", title: "Quick Links", description: "Your own shortcuts to any page.", category: "tools", span: 4, access: "any", keywords: "bookmarks favourites" },

  // ── Community (today's overview sections) ──────────────────────────────────
  { id: "community.invitations", title: "Invitations", description: "Invitation counts and the latest invites.", category: "community", span: 12, access: "admin", source: "invitations" },
  { id: "community.metrics", title: "Community", description: "Participants, Check-Ins, journeys, reviewers, Inner Circle and follow-up.", category: "community", span: 12, access: "staff", source: "community" },
  { id: "community.recent-checkins", title: "Recent Check-Ins", description: "The latest Created for More Check-Ins.", category: "community", span: 12, access: "staff", source: "community" },
  { id: "community.waves", title: "Wave Summary", description: "Invited, opted in, Check-In and survey by wave.", category: "community", span: 7, access: "staff", source: "community" },
  { id: "community.pipeline", title: "Pipeline Status", description: "Check-In, survey, Inner Circle and follow-up counts.", category: "community", span: 5, access: "staff", source: "community" },
  { id: "community.whats-new", title: "What's New", description: "Recent improvements to the dashboard and site.", category: "community", span: 12, access: "any" },

  // ── Settings ───────────────────────────────────────────────────────────────
  { id: "settings.appearance", title: "Appearance", description: "Light or dark theme and the help button.", category: "settings", span: 4, access: "any", keywords: "theme dark" },
  { id: "settings.notify", title: "Notification Settings", description: "How often you get emails about messages.", category: "settings", span: 4, access: "any" },
  { id: "settings.profile", title: "Profile", description: "Your profile completeness with a link to edit it.", category: "settings", span: 4, access: "any", source: "getstarted" },
];

export const WIDGET_BY_ID = new Map(WIDGETS.map((w) => [w.id, w]));

export function widgetsFor(role: AppRole): WidgetDef[] {
  return WIDGETS.filter((w) => allowed(role, w.access));
}

/** Loader sources the role may read: the union of the sources of the cards it may use. */
export function sourceAllowed(role: AppRole, source: string): boolean {
  return WIDGETS.some((w) => w.source === source && allowed(role, w.access));
}
