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

// ── Blocks (Phase 2: a flat, ordered list; layout containers come in Phase 4) ──
export type CmsBlockType = "heading" | "subheading" | "paragraph" | "richtext" | "image" | "button" | "divider" | "spacer";

export type CmsBlock = {
  id: string;
  type: CmsBlockType;
  text?: string;        // heading/subheading/paragraph/richtext
  url?: string;         // image src / button href
  alt?: string;         // image alt
  label?: string;       // button label
  // design
  align?: "left" | "center" | "right";
  textColor?: string;   // "" = inherit
  bgColor?: string;     // "" = none (transparent band)
  padY?: number;        // section vertical padding (px)
  maxWidth?: number;    // content max width (px); 0 = container default
  height?: number;      // spacer height / image max-height (px)
  hidden?: boolean;
};

export type CmsDraft = { version: 1; blocks: CmsBlock[] };

export function emptyDraft(): CmsDraft { return { version: 1, blocks: [] }; }
export function draftBlocks(draft: unknown): CmsBlock[] {
  const blocks = (draft as CmsDraft | null)?.blocks;
  return Array.isArray(blocks) ? blocks : [];
}

export const CMS_BLOCK_LABELS: Record<CmsBlockType, string> = {
  heading: "Heading", subheading: "Subheading", paragraph: "Paragraph", richtext: "Rich text",
  image: "Image", button: "Button", divider: "Divider", spacer: "Spacer",
};

export const CMS_PAGE_TYPES: { value: CmsPageType; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "landing", label: "Landing page" },
  { value: "stewardship", label: "Stewardship" },
  { value: "experience", label: "Experience" },
  { value: "resource", label: "Resource" },
  { value: "informational", label: "Informational" },
];
