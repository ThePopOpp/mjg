"use client";

import type { ComponentType } from "react";
import {
  AlarmClock,
  AlertTriangle,
  BarChart3,
  Bell,
  BellRing,
  Bot,
  Calculator,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  CheckSquare,
  CircleUserRound,
  Clock3,
  CloudSun,
  DollarSign,
  FileStack,
  FolderOpen,
  Globe,
  HardDrive,
  Image as ImageIcon,
  LayoutGrid,
  LineChart,
  Link2,
  ListTodo,
  Mail,
  MessageSquareText,
  MessagesSquare,
  Mic,
  Network,
  Newspaper,
  NotebookPen,
  Palette,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  PhoneOutgoing,
  Receipt,
  Rocket,
  Search,
  Send,
  Share2,
  Siren,
  Smartphone,
  Sparkles,
  Target,
  UserPlus,
  UsersRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { WidgetProps } from "./kit";
import { makeStatTile } from "./stats";
import { ClockWidget, FeaturesWidget, SearchWidget, WeatherWidget } from "./toolbar";
import { AgentAlertWidget, JobAlertWidget, NextTodoWidget, NotificationsWidget } from "./alerts";
import { MyTasksWidget, RemindersWidget, TodoWidget } from "./tasks";
import { CalendarMonthWidget, UpcomingWidget } from "./calendar";
import { CallsWidget, DmsWidget, EmailWidget, SmsWidget } from "./comms";
import { LeadsPipelineWidget, OrdersWidget, RecentLeadsWidget, RevenueWidget, SignupsWidget, SourcesWidget, TopPagesWidget, TrafficWidget } from "./business";
import { AgentTasksWidget, BlogWidget, DevRequestsWidget, RecentFilesWidget, ScheduledSocialWidget, ShepherdWidget, StewardUsageWidget, WebsiteChangesWidget, WorkspaceDocsWidget } from "./content";
import { CalculatorWidget, DialpadWidget, NotepadWidget, QuickLinksWidget, RecorderWidget, WorldClockWidget } from "./tools";
import { CommunityMetricsWidget, InvitationsWidget, PipelineStatusWidget, RecentCheckInsWidget, WavesWidget, WhatsNewWidget } from "./community";
import { AppearanceWidget, GetStartedWidget, NotifySettingsWidget, ProfileWidget } from "./settings";

export type WidgetUi = {
  icon: LucideIcon;
  Component: ComponentType<WidgetProps>;
  /** Draws its own section chrome (heading, rail) rather than sitting in a card. */
  bare?: boolean;
};

const stat = (icon: LucideIcon): WidgetUi => ({ icon, Component: makeStatTile(icon), bare: true });

export const WIDGET_UI: Record<string, WidgetUi> = {
  "start.checklist": { icon: Rocket, Component: GetStartedWidget, bare: true },
  "toolbar.search": { icon: Search, Component: SearchWidget, bare: true },
  "toolbar.features": { icon: LayoutGrid, Component: FeaturesWidget, bare: true },
  "toolbar.clock": { icon: Clock3, Component: ClockWidget, bare: true },
  "toolbar.weather": { icon: CloudSun, Component: WeatherWidget, bare: true },

  "alert.agent": { icon: Bot, Component: AgentAlertWidget, bare: true },
  "alert.next-todo": { icon: CalendarCheck, Component: NextTodoWidget, bare: true },
  "alert.jobs": { icon: Siren, Component: JobAlertWidget, bare: true },
  "alert.notifications": { icon: Bell, Component: NotificationsWidget },

  "stat.calls": stat(Phone),
  "stat.outbound": stat(PhoneOutgoing),
  "stat.inbound": stat(PhoneIncoming),
  "stat.missed": stat(PhoneMissed),
  "stat.sms": stat(Smartphone),
  "stat.bookings": stat(CalendarCheck),
  "stat.calendar": stat(CalendarDays),
  "stat.notifications": stat(Bell),
  "stat.messages": stat(MessageSquareText),
  "stat.alerts": stat(AlertTriangle),
  "stat.emails": stat(Mail),
  "stat.files": stat(HardDrive),
  "stat.checkins": stat(CheckCircle2),
  "stat.leads": stat(Target),
  "stat.signups": stat(UserPlus),
  "stat.revenue": stat(DollarSign),

  "tasks.my": { icon: ListTodo, Component: MyTasksWidget, bare: true },
  "tools.todo": { icon: CheckSquare, Component: TodoWidget },
  "tools.reminders": { icon: AlarmClock, Component: RemindersWidget },

  "calendar.month": { icon: CalendarDays, Component: CalendarMonthWidget },
  "calendar.upcoming": { icon: CalendarRange, Component: UpcomingWidget },

  "comms.dms": { icon: MessagesSquare, Component: DmsWidget, bare: true },
  "comms.calls": { icon: Phone, Component: CallsWidget },
  "comms.sms": { icon: Smartphone, Component: SmsWidget },
  "comms.email": { icon: Mail, Component: EmailWidget },

  "fin.revenue": { icon: DollarSign, Component: RevenueWidget },
  "fin.orders": { icon: Receipt, Component: OrdersWidget },

  "pipe.leads": { icon: Target, Component: LeadsPipelineWidget },
  "pipe.recent-leads": { icon: UserPlus, Component: RecentLeadsWidget },

  "rep.traffic": { icon: LineChart, Component: TrafficWidget },
  "rep.top-pages": { icon: Globe, Component: TopPagesWidget },
  "rep.sources": { icon: Share2, Component: SourcesWidget },
  "rep.signups": { icon: BarChart3, Component: SignupsWidget },

  "content.blog": { icon: Newspaper, Component: BlogWidget },
  "content.website": { icon: Globe, Component: WebsiteChangesWidget },
  "content.social": { icon: Send, Component: ScheduledSocialWidget },

  "ws.docs": { icon: FolderOpen, Component: WorkspaceDocsWidget },

  "ai.shepherd": { icon: Bot, Component: ShepherdWidget },
  "ai.tasks": { icon: Network, Component: AgentTasksWidget },
  "ai.dev-requests": { icon: Wrench, Component: DevRequestsWidget },
  "ai.steward": { icon: Sparkles, Component: StewardUsageWidget },

  "files.recent": { icon: ImageIcon, Component: RecentFilesWidget },

  "tools.dialpad": { icon: Phone, Component: DialpadWidget },
  "tools.recorder": { icon: Mic, Component: RecorderWidget },
  "tools.notepad": { icon: NotebookPen, Component: NotepadWidget },
  "tools.calculator": { icon: Calculator, Component: CalculatorWidget },
  "tools.world-clock": { icon: Clock3, Component: WorldClockWidget },
  "tools.quick-links": { icon: Link2, Component: QuickLinksWidget },

  "community.invitations": { icon: Send, Component: InvitationsWidget, bare: true },
  "community.metrics": { icon: UsersRound, Component: CommunityMetricsWidget, bare: true },
  "community.recent-checkins": { icon: CheckCircle2, Component: RecentCheckInsWidget, bare: true },
  "community.waves": { icon: FileStack, Component: WavesWidget, bare: true },
  "community.pipeline": { icon: BarChart3, Component: PipelineStatusWidget, bare: true },
  "community.whats-new": { icon: Sparkles, Component: WhatsNewWidget, bare: true },

  "settings.appearance": { icon: Palette, Component: AppearanceWidget },
  "settings.notify": { icon: BellRing, Component: NotifySettingsWidget },
  "settings.profile": { icon: CircleUserRound, Component: ProfileWidget },
};
