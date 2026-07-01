// Shared CMS font library — a curated set of Google Fonts (with weights + italics)
// available in the block editor and emitted on published pages. Kept node-free so
// both the client editor and the server renderer can import it.

export type CmsFont = {
  name: string;               // Google Fonts family name
  category: "sans" | "serif" | "display" | "mono";
  weights: number[];          // available weights to request
  italic: boolean;            // request italic variants
  fallback: string;           // CSS fallback stack
};

// 26 families spanning sans, serif, display, and mono — with their real
// Google-Fonts weight availability so the request URLs are valid.
export const CMS_FONTS: CmsFont[] = [
  { name: "Inter", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Roboto", category: "sans", weights: [100, 300, 400, 500, 700, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Open Sans", category: "sans", weights: [300, 400, 500, 600, 700, 800], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Lato", category: "sans", weights: [100, 300, 400, 700, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Montserrat", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Poppins", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Raleway", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Nunito", category: "sans", weights: [200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Work Sans", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Source Sans 3", category: "sans", weights: [200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "DM Sans", category: "sans", weights: [300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Manrope", category: "sans", weights: [200, 300, 400, 500, 600, 700, 800], italic: false, fallback: "system-ui, sans-serif" },
  { name: "Space Grotesk", category: "sans", weights: [300, 400, 500, 600, 700], italic: false, fallback: "system-ui, sans-serif" },
  { name: "Josefin Sans", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Rubik", category: "sans", weights: [300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Karla", category: "sans", weights: [200, 300, 400, 500, 600, 700, 800], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Oswald", category: "display", weights: [200, 300, 400, 500, 600, 700], italic: false, fallback: "Impact, sans-serif" },
  { name: "Bebas Neue", category: "display", weights: [400], italic: false, fallback: "Impact, sans-serif" },
  { name: "Archivo", category: "sans", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: true, fallback: "system-ui, sans-serif" },
  { name: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 800, 900], italic: true, fallback: "Georgia, serif" },
  { name: "Merriweather", category: "serif", weights: [300, 400, 700, 900], italic: true, fallback: "Georgia, serif" },
  { name: "Lora", category: "serif", weights: [400, 500, 600, 700], italic: true, fallback: "Georgia, serif" },
  { name: "DM Serif Display", category: "serif", weights: [400], italic: true, fallback: "Georgia, serif" },
  { name: "EB Garamond", category: "serif", weights: [400, 500, 600, 700, 800], italic: true, fallback: "Georgia, serif" },
  { name: "Cormorant Garamond", category: "serif", weights: [300, 400, 500, 600, 700], italic: true, fallback: "Georgia, serif" },
  { name: "PT Serif", category: "serif", weights: [400, 700], italic: true, fallback: "Georgia, serif" },
  { name: "Libre Baskerville", category: "serif", weights: [400, 700], italic: true, fallback: "Georgia, serif" },
  { name: "Roboto Slab", category: "serif", weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], italic: false, fallback: "Georgia, serif" },
  { name: "Space Mono", category: "mono", weights: [400, 700], italic: true, fallback: "ui-monospace, monospace" },
  { name: "JetBrains Mono", category: "mono", weights: [100, 200, 300, 400, 500, 600, 700, 800], italic: true, fallback: "ui-monospace, monospace" },
];

const BY_NAME = new Map(CMS_FONTS.map((f) => [f.name, f]));

// CSS font-family value for a family name (falls back to the body font).
export function fontStack(name?: string): string {
  if (!name) return "";
  const f = BY_NAME.get(name);
  if (!f) return `'${name}', sans-serif`;
  return `'${f.name}', ${f.fallback}`;
}

// Weights available for a family (for the weight picker).
export function fontWeights(name?: string): number[] {
  return (name && BY_NAME.get(name)?.weights) || [400, 700];
}

export function fontHasItalic(name?: string): boolean {
  return Boolean(name && BY_NAME.get(name)?.italic);
}

// A single Google Fonts css2 <link> href for one family, with valid weight/italic
// axis syntax. Returns "" for unknown families.
export function fontHref(name: string): string {
  const f = BY_NAME.get(name);
  if (!f) return "";
  const fam = f.name.replace(/ /g, "+");
  const w = f.weights;
  // Single-style families (e.g. Bebas Neue, DM Serif Display) have no wght axis.
  if (w.length === 1 && w[0] === 400) {
    const spec = f.italic ? ":ital@0;1" : "";
    return `https://fonts.googleapis.com/css2?family=${fam}${spec}&display=swap`;
  }
  const spec = f.italic
    ? `ital,wght@${w.map((x) => `0,${x}`).join(";")};${w.map((x) => `1,${x}`).join(";")}`
    : `wght@${w.join(";")}`;
  return `https://fonts.googleapis.com/css2?family=${fam}:${spec}&display=swap`;
}

// <link> tags for a set of families (deduped). Used by the public renderer so a
// page only ships the fonts it actually uses.
export function fontLinksHtml(names: Iterable<string>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    if (!n || seen.has(n)) continue;
    seen.add(n);
    const href = fontHref(n);
    if (href) out.push(`  <link href="${href}" rel="stylesheet" />`);
  }
  return out.join("\n");
}

export const FONT_OPTIONS = [{ value: "", label: "Default (theme)" }, ...CMS_FONTS.map((f) => ({ value: f.name, label: f.name }))];
