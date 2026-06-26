// Social Media — shared TS types.

export type SocialAccount = {
  id: string;
  platform: string;
  display_name: string;
  profile_url: string | null;
  external_id: string | null;
  status: "disconnected" | "connected" | "error";
  is_active: boolean;
  credentials: Record<string, string>;
  settings: Record<string, unknown>;
  last_synced_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SocialBlockType = "heading" | "text" | "quote" | "image" | "video" | "link" | "cta" | "hashtags" | "divider";

export type SocialBlock = {
  id: string;
  type: SocialBlockType;
  text?: string;
  url?: string;
  alt?: string;
  label?: string;       // cta/link label
  level?: "h1" | "h2";  // heading
  items?: string[];     // hashtags
  align?: "left" | "center" | "right";
};

export type SocialBuilderSchema = {
  version: 1;
  blocks: SocialBlock[];
};

export type SocialTemplate = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  status: "draft" | "active" | "archived";
  platforms: string[];
  body_text: string;
  builder_schema: SocialBuilderSchema | Record<string, never>;
  media_urls: string[];
  hashtags: string[];
  link_url: string | null;
  available_fields: string[];
  created_at?: string;
  updated_at?: string;
};

export type SocialPostStatus = "draft" | "scheduled" | "publishing" | "published" | "failed" | "skipped";

export type SocialEngagement = {
  likes?: number; comments?: number; shares?: number; impressions?: number; reach?: number; clicks?: number;
};

export type SocialPost = {
  id: string;
  template_id: string | null;
  account_id: string | null;
  platform: string;
  status: SocialPostStatus;
  body_text: string;
  media_urls: string[];
  hashtags: string[];
  link_url: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  external_post_id: string | null;
  external_url: string | null;
  error_message: string | null;
  engagement: SocialEngagement;
  merge_data: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  // joined
  account?: Pick<SocialAccount, "display_name" | "platform"> | null;
  template?: Pick<SocialTemplate, "name"> | null;
};

export type SocialMessage = {
  id: string;
  account_id: string | null;
  platform: string;
  kind: "message" | "comment" | "review" | "mention";
  external_id: string | null;
  author_name: string | null;
  author_handle: string | null;
  author_avatar_url: string | null;
  text: string | null;
  rating: number | null;
  permalink: string | null;
  post_external_id: string | null;
  sentiment: string | null;
  status: "new" | "read" | "replied" | "archived";
  received_at: string;
  replied_at: string | null;
  reply_text: string | null;
  raw: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

export type SocialAutomation = {
  id: string;
  event_key: string;
  template_id: string | null;
  platforms: string[];
  enabled: boolean;
  description: string | null;
  // joined
  template?: Pick<SocialTemplate, "name" | "slug"> | null;
};

export type SocialAnalyticsDaily = {
  id: string;
  account_id: string | null;
  platform: string;
  metric_date: string;
  followers: number;
  impressions: number;
  reach: number;
  engagements: number;
  posts_count: number;
};

export type SocialDashboardData = {
  accounts: SocialAccount[];
  templates: SocialTemplate[];
  posts: SocialPost[];
  messages: SocialMessage[];
  automations: SocialAutomation[];
  stats: SocialStats;
};

export type SocialStats = {
  connectedAccounts: number;
  scheduledPosts: number;
  publishedThisWeek: number;
  unreadInbox: number;
  totalEngagement: number;
};

export type SocialReport = {
  rangeDays: number;
  totals: { posts: number; published: number; scheduled: number; failed: number; engagement: SocialEngagement };
  byPlatform: { platform: string; published: number; engagement: number }[];
  daily: { date: string; published: number; engagement: number }[];
  topPosts: { id: string; platform: string; body: string; engagement: number; url: string | null }[];
};
