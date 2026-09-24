// Frontend Editor — shared types (docs/frontend-editor/frontend-editor.md).
//
// Client-safe: no node/server imports, so the dashboard editor, the public
// renderer and the Steward tool layer can all share one vocabulary.

export type WebsitePageStatus = "draft" | "published" | "scheduled" | "archived";
export type WebsitePageType = "page" | "landing" | "resource" | "marketing" | "legal" | "system";
export type EditSource = "manual" | "steward" | "restore";

/** One validated block instance on a page. `props` is always registry-shaped. */
export type WebsiteBlock = {
  id: string;
  type: string;
  hidden?: boolean;
  props: Record<string, unknown>;
};

/** The stored content document for a page (draft or published snapshot). */
export type WebsiteContent = { version: 1; blocks: WebsiteBlock[] };

export function emptyContent(): WebsiteContent {
  return { version: 1, blocks: [] };
}

/** Coerce an unknown jsonb payload into a content document. Never throws. */
export function asContent(raw: unknown): WebsiteContent {
  const blocks = (raw as WebsiteContent | null)?.blocks;
  return { version: 1, blocks: Array.isArray(blocks) ? blocks : [] };
}

export type WebsitePage = {
  id: string;
  title: string;
  slug: string;
  page_type: WebsitePageType;
  template: string;
  status: WebsitePageStatus;

  draft_content: WebsiteContent;
  published_content: WebsiteContent | null;

  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  featured_image_url: string | null;
  no_index: boolean;
  no_follow: boolean;

  navigation_visibility: boolean;
  navigation_label: string | null;
  parent_page_id: string | null;
  sort_order: number;

  is_protected: boolean;
  is_legal: boolean;
  has_unpublished_changes: boolean;
  last_edited_source: EditSource;

  published_at: string | null;
  scheduled_at: string | null;
  unpublish_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

/** Page row decorated with the counts/labels the page manager table shows. */
export type WebsitePageSummary = WebsitePage & {
  version_count: number;
  updated_by_label: string | null;
};

export type WebsitePageVersion = {
  id: string;
  page_id: string;
  version_number: number;
  content: WebsiteContent;
  metadata: Record<string, unknown>;
  source: EditSource;
  change_summary: string;
  created_by: string | null;
  created_at: string;
};

export type ChangeSetStatus = "proposed" | "draft_applied" | "approved" | "published" | "rejected";
export type ChangeRisk = "low" | "medium" | "high";

export type WebsiteChangeSet = {
  id: string;
  page_id: string | null;
  requested_by: string | null;
  source: "steward" | "manual";
  risk: ChangeRisk;
  prompt: string | null;
  summary: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  status: ChangeSetStatus;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  published_at: string | null;
};

export type NavigationGroup = "main" | "footer" | "utility";

export type WebsiteNavItem = {
  id: string;
  navigation_group: NavigationGroup;
  label: string;
  url: string;
  page_id: string | null;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  open_in_new_tab: boolean;
  created_at?: string;
  updated_at?: string;
};

export type WebsiteGlobal = {
  id: string;
  key: string;
  label: string;
  value: Record<string, unknown>;
  type: string;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
};

export type WebsiteRedirect = {
  id: string;
  source_path: string;
  destination_path: string;
  status_code: 301 | 302;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export type WebsiteAuditLog = {
  id: string;
  actor_id: string | null;
  actor_type: "user" | "steward";
  action: string;
  resource_type: string;
  resource_id: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

/** Editor behaviour stored in website_globals under `editor.settings`. */
export type EditorSettings = {
  /** Spec §16 — OFF by default. Even when ON, protected/legal pages ignore it. */
  allowStewardDirectPublish: boolean;
};

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  allowStewardDirectPublish: false,
};

export const PAGE_TYPE_LABELS: Record<WebsitePageType, string> = {
  page: "Content page",
  landing: "Landing page",
  resource: "Resource page",
  marketing: "Marketing page",
  legal: "Legal page",
  system: "System page",
};

export const STATUS_LABELS: Record<WebsitePageStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};

/** The public URL a CMS-owned page renders at. */
export function pagePath(slug: string): string {
  const clean = String(slug || "").replace(/^\/+|\/+$/g, "");
  return clean ? `/${clean}` : "/";
}
