// CMS — shared types. Phase 1 covers page metadata; blocks/versions are stored
// (tables exist) but the block editor + renderer arrive in later phases.

export type CmsPageStatus = "draft" | "published" | "archived";
export type CmsPageType = "page" | "landing" | "stewardship" | "experience" | "resource" | "informational";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  page_type: CmsPageType;
  status: CmsPageStatus;
  assigned_roles: string[];
  published_version_id: string | null;
  created_by: string | null;
  updated_by: string | null;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export const CMS_PAGE_TYPES: { value: CmsPageType; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "landing", label: "Landing page" },
  { value: "stewardship", label: "Stewardship" },
  { value: "experience", label: "Experience" },
  { value: "resource", label: "Resource" },
  { value: "informational", label: "Informational" },
];
