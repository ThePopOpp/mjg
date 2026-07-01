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

// ── Blocks (flat, ordered list; nested layout containers come later) ──
export type CmsBlockType =
  | "heading" | "subheading" | "paragraph" | "richtext" | "image" | "button" | "divider" | "spacer"
  | "cta" | "quote" | "cardgrid" | "accordion" | "video" | "html"
  | "hero" | "alert" | "list" | "statgrid" | "gallery" | "embed" | "scripture" | "resource" | "form"
  | "audio" | "icon" | "row";

// A column inside a "row" block. Holds its own ordered list of nested blocks.
export type CmsColumn = { id: string; span?: number; blocks: CmsBlock[] };

export type CmsBlockItem = {
  title?: string; body?: string; imageUrl?: string; url?: string; q?: string; a?: string;
  // form fields / stats / gallery extras
  fieldType?: string;   // form field: text|email|phone|textarea|number|date|select|checkbox
  placeholder?: string; // form field placeholder
  options?: string;     // select/radio options (comma-separated)
  required?: boolean;   // form field required
  icon?: string;        // optional icon/emoji for list/stat items
};

export type CmsBlock = {
  id: string;
  type: CmsBlockType;
  text?: string;        // heading/subheading/paragraph/richtext/quote/cta-heading/alert-title
  url?: string;         // image src / button href / video url / resource file
  alt?: string;         // image alt
  label?: string;       // button label / cta primary label / form submit / resource button
  // structured content
  eyebrow?: string;     // cta/hero small label
  subtext?: string;     // cta/hero subheading / alert message / scripture reflection / form success
  label2?: string; url2?: string; // cta/hero secondary button
  author?: string; role?: string; // quote author + role / scripture ref + version / resource filetype
  items?: CmsBlockItem[]; // cardgrid / accordion / list / statgrid / gallery / form fields
  columns?: number;     // grid columns (2-4)
  gap?: number;         // grid gap (px)
  // layout container (row)
  cols?: CmsColumn[];   // row: ordered columns, each with its own nested blocks
  valign?: "top" | "center" | "bottom" | "stretch"; // row: column vertical alignment
  stackMobile?: boolean; // row: stack columns on narrow screens (default true)
  html?: string;        // html / embed code
  aspect?: string;      // video aspect ("16/9" | "4/3" | "1/1")
  variant?: string;     // alert kind (info|success|warning|error) / button style / list style
  bgImage?: string;     // hero/section background image url
  overlay?: string;     // hero overlay color
  overlayOpacity?: number; // 0-100
  minHeight?: number;   // hero/section min height (px)
  newTab?: boolean;     // links open in new tab
  // audio player
  barColor?: string;    // audio: control-bar background (dark pill)
  accent?: string;      // audio/icon: accent color (play button, seek/volume fill, glyph)
  // icon library
  icon?: string;        // icon: glyph id from lib/cms/icons
  iconShape?: "none" | "square" | "circle"; // icon: background container shape
  iconBg?: string;      // icon: container fill ("" = transparent)
  iconOutline?: string; // icon: container outline color ("" = none)
  iconSize?: number;    // icon: glyph size (px)
  // typography
  fontFamily?: string;  // Google font name (see lib/cms/fonts)
  fontWeight?: number;  // 100-900
  fontStyle?: "normal" | "italic";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  letterSpacing?: number; // px (can be negative)
  lineHeight?: number;    // unitless multiplier
  textShadow?: string;    // css text-shadow value
  // design
  align?: "left" | "center" | "right";
  textColor?: string;   // "" = inherit
  bgColor?: string;     // "" = none (transparent band)
  buttonColor?: string; // button background
  fontSize?: number;    // px override for text/button
  marginTop?: number;   // space above the section (px)
  marginBottom?: number;// space below the section (px)
  padTop?: number;      // section padding top (px)
  padBottom?: number;   // section padding bottom (px)
  padX?: number;        // section horizontal padding (px)
  maxWidth?: number;    // content max width (px); 0 = container default
  height?: number;      // spacer height / image max-height (px)
  radius?: number;      // corner radius (px)
  // border + effects
  borderWidth?: number; // px
  borderColor?: string;
  borderStyle?: "solid" | "dashed" | "dotted";
  boxShadow?: string;   // css box-shadow value
  hidden?: boolean;
  padY?: number;        // legacy — used as padTop/padBottom fallback
};

// Resolve padding/margin with legacy padY fallback (shared by both renderers).
export function blockPad(b: CmsBlock, side: "top" | "bottom"): number {
  const specific = side === "top" ? b.padTop : b.padBottom;
  return specific ?? b.padY ?? 24;
}

export type CmsDraft = { version: 1; blocks: CmsBlock[] };

export function emptyDraft(): CmsDraft { return { version: 1, blocks: [] }; }
export function draftBlocks(draft: unknown): CmsBlock[] {
  const blocks = (draft as CmsDraft | null)?.blocks;
  return Array.isArray(blocks) ? blocks : [];
}

export const CMS_BLOCK_LABELS: Record<CmsBlockType, string> = {
  heading: "Heading", subheading: "Subheading", paragraph: "Paragraph", richtext: "Rich text",
  image: "Image", button: "Button", divider: "Divider", spacer: "Spacer",
  cta: "CTA section", quote: "Quote", cardgrid: "Card grid", accordion: "Accordion / FAQ",
  video: "Video", html: "HTML",
  hero: "Hero", alert: "Alert / Notice", list: "List / Checklist", statgrid: "Stats",
  gallery: "Gallery", embed: "Embed", scripture: "Scripture", resource: "Resource / Download", form: "Form",
  audio: "Audio player", icon: "Icon",
  row: "Row / Columns",
};

// ── Block-tree helpers (blocks may nest inside row → column → blocks) ──
// All are pure: they return new arrays and recurse through row columns.

export function findBlock(blocks: CmsBlock[], id: string): CmsBlock | undefined {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.cols) for (const c of b.cols) { const f = findBlock(c.blocks, id); if (f) return f; }
  }
  return undefined;
}

export function patchBlock(blocks: CmsBlock[], id: string, patch: Partial<CmsBlock>): CmsBlock[] {
  return blocks.map((b) => {
    if (b.id === id) return { ...b, ...patch };
    if (b.cols) return { ...b, cols: b.cols.map((c) => ({ ...c, blocks: patchBlock(c.blocks, id, patch) })) };
    return b;
  });
}

export function dropBlock(blocks: CmsBlock[], id: string): CmsBlock[] {
  return blocks.filter((b) => b.id !== id).map((b) =>
    b.cols ? { ...b, cols: b.cols.map((c) => ({ ...c, blocks: dropBlock(c.blocks, id) })) } : b);
}

// Deep-clone a block (fresh ids for it and any nested column blocks).
export function cloneBlock(b: CmsBlock, newId: () => string): CmsBlock {
  const c: CmsBlock = { ...b, id: newId() };
  if (b.cols) c.cols = b.cols.map((col) => ({ id: newId(), span: col.span, blocks: col.blocks.map((x) => cloneBlock(x, newId)) }));
  return c;
}

// Duplicate a block in place (right after itself, at whatever depth it lives).
export function duplicateBlock(blocks: CmsBlock[], id: string, newId: () => string): { blocks: CmsBlock[]; newId?: string } {
  let created: string | undefined;
  const walk = (arr: CmsBlock[]): CmsBlock[] => {
    const out: CmsBlock[] = [];
    for (const b of arr) {
      out.push(b.cols ? { ...b, cols: b.cols.map((c) => ({ ...c, blocks: walk(c.blocks) })) } : b);
      if (b.id === id) { const clone = cloneBlock(b, newId); created = clone.id; out.push(clone); }
    }
    return out;
  };
  return { blocks: walk(blocks), newId: created };
}

// Append a block to a specific column.
export function insertInColumn(blocks: CmsBlock[], rowId: string, colId: string, block: CmsBlock): CmsBlock[] {
  return blocks.map((b) => {
    if (b.cols) {
      const cols = b.cols.map((c) =>
        b.id === rowId && c.id === colId ? { ...c, blocks: [...c.blocks, block] } : { ...c, blocks: insertInColumn(c.blocks, rowId, colId, block) });
      return { ...b, cols };
    }
    return b;
  });
}

// Move a block up/down within its own sibling list (top-level or inside a column).
export function moveBlock(blocks: CmsBlock[], id: string, dir: -1 | 1): CmsBlock[] {
  const i = blocks.findIndex((b) => b.id === id);
  if (i >= 0) {
    const j = i + dir;
    if (j < 0 || j >= blocks.length) return blocks;
    const n = [...blocks]; [n[i], n[j]] = [n[j], n[i]]; return n;
  }
  return blocks.map((b) => (b.cols ? { ...b, cols: b.cols.map((c) => ({ ...c, blocks: moveBlock(c.blocks, id, dir) })) } : b));
}

// Resize a row's column list to `count`, preserving existing blocks (extras fold
// into the last kept column). Needs a fresh-id generator for any new columns.
export function setColumnCount(row: CmsBlock, count: number, newId: () => string): CmsColumn[] {
  const cur = row.cols ?? [];
  if (count >= cur.length) {
    const extra = Array.from({ length: count - cur.length }, () => ({ id: newId(), blocks: [] as CmsBlock[] }));
    return [...cur, ...extra];
  }
  const kept = cur.slice(0, count);
  const folded = cur.slice(count).flatMap((c) => c.blocks);
  const last = kept[kept.length - 1];
  return kept.map((c) => (c.id === last.id ? { ...c, blocks: [...c.blocks, ...folded] } : c));
}

export const CMS_PAGE_TYPES: { value: CmsPageType; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "landing", label: "Landing page" },
  { value: "stewardship", label: "Stewardship" },
  { value: "experience", label: "Experience" },
  { value: "resource", label: "Resource" },
  { value: "informational", label: "Informational" },
];
