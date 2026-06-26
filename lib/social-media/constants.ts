// Social Media — platform definitions, merge fields, automation events.
// Platforms in use: Facebook + LinkedIn. The set is extendable (DB allows more)
// so adding a network later is just a new PLATFORMS entry — no migration.

export type PlatformId = "facebook" | "instagram" | "linkedin" | "x" | "youtube" | "tiktok" | "threads" | "pinterest";

export type CredentialField = { key: string; label: string; type: "text" | "password" | "url"; help?: string };

export type PlatformDef = {
  id: PlatformId;
  label: string;
  color: string;
  charLimit: number;
  /** Whether MJG actively uses this platform (surfaced first in Settings/composer). */
  primary: boolean;
  /** Credential fields shown in the Settings form for this platform. */
  credentialFields: CredentialField[];
};

export const PLATFORMS: PlatformDef[] = [
  {
    id: "facebook", label: "Facebook", color: "#1877F2", charLimit: 63206, primary: true,
    credentialFields: [
      { key: "page_id", label: "Page ID", type: "text", help: "Your Facebook Page's numeric ID." },
      { key: "page_access_token", label: "Page Access Token", type: "password", help: "Long-lived Page access token from the Graph API." },
      { key: "app_id", label: "App ID", type: "text" },
      { key: "app_secret", label: "App Secret", type: "password" },
    ],
  },
  {
    id: "linkedin", label: "LinkedIn", color: "#0A66C2", charLimit: 3000, primary: true,
    credentialFields: [
      { key: "organization_urn", label: "Organization / Member URN", type: "text", help: "e.g. urn:li:organization:12345 or urn:li:person:abc." },
      { key: "access_token", label: "Access Token", type: "password", help: "OAuth access token with w_member_social / w_organization_social." },
      { key: "client_id", label: "Client ID", type: "text" },
      { key: "client_secret", label: "Client Secret", type: "password" },
    ],
  },
  // ── Available but not active (add credentials in Settings to enable) ──
  { id: "instagram", label: "Instagram", color: "#E4405F", charLimit: 2200, primary: false, credentialFields: [
    { key: "ig_user_id", label: "Instagram Business Account ID", type: "text" },
    { key: "page_access_token", label: "Page Access Token", type: "password" },
  ] },
  { id: "x", label: "X (Twitter)", color: "#111111", charLimit: 280, primary: false, credentialFields: [
    { key: "api_key", label: "API Key", type: "password" },
    { key: "api_secret", label: "API Secret", type: "password" },
    { key: "access_token", label: "Access Token", type: "password" },
    { key: "access_secret", label: "Access Token Secret", type: "password" },
  ] },
  { id: "youtube", label: "YouTube", color: "#FF0000", charLimit: 5000, primary: false, credentialFields: [
    { key: "channel_id", label: "Channel ID", type: "text" },
    { key: "api_key", label: "API Key", type: "password" },
  ] },
  { id: "threads", label: "Threads", color: "#111111", charLimit: 500, primary: false, credentialFields: [
    { key: "threads_user_id", label: "Threads User ID", type: "text" },
    { key: "access_token", label: "Access Token", type: "password" },
  ] },
];

export const PLATFORM_MAP: Record<string, PlatformDef> = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));
export function platformLabel(id: string): string { return PLATFORM_MAP[id]?.label ?? id; }
export function platformColor(id: string): string { return PLATFORM_MAP[id]?.color ?? "#6b7280"; }

// Merge fields usable in post bodies (social is mostly broadcast, so a small set).
export const DEFAULT_SOCIAL_FIELDS = [
  "site_url", "event_title", "event_url", "booking_url", "cta_url", "latest_post_url",
] as const;

// Automation events a post template can be bound to (mirrors EMAIL_EVENT_KEYS).
export const SOCIAL_EVENT_KEYS: { key: string; label: string; description: string }[] = [
  { key: "blog_post_published", label: "Blog post published", description: "Auto-draft a promo post when a blog post goes live." },
  { key: "event_published", label: "Event published", description: "Auto-draft a promo post when a new event is published." },
  { key: "booking_type_published", label: "Booking type published", description: "Promote a new bookable offering." },
  { key: "weekly_encouragement", label: "Weekly encouragement", description: "Recurring weekly stewardship encouragement." },
];

export const POST_STATUSES = ["draft", "scheduled", "publishing", "published", "failed", "skipped"] as const;
export const MESSAGE_KINDS = ["message", "comment", "review", "mention"] as const;
export const MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;
