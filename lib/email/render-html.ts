import { existsSync } from "node:fs";
import puppeteer, { type Browser, type Page } from "puppeteer-core";

// Renders an email template's HTML in headless Chromium so downloads look exactly like the
// dashboard preview (which is the same HTML in a sandboxed iframe). Production uses the
// Debian `chromium` package from the Dockerfile; locally it falls back to installed Chrome.

export const EMAIL_VIEWPORT = 720;

const CANDIDATES = [
  process.env.CHROMIUM_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

export async function launchRenderer(): Promise<Browser> {
  const executablePath = CANDIDATES.find((p): p is string => Boolean(p && existsSync(p)));
  if (!executablePath) throw new Error("No Chromium found to render the email. Set CHROMIUM_PATH.");
  return puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none", "--hide-scrollbars"],
  });
}

type Box = [number, number];
export type RenderedEmail = { width: number; height: number; boxes: Box[] };

// The boxes a page break must not cut through: text blocks, images, buttons, and any
// section with its own background (the dark CTA band, a badge). Plain layout cells are
// left out so a break can fall between the paragraphs inside them.
// A string, not a function: bundlers can inject helpers into a serialized function body.
const LAYOUT = `(() => {
  const d = document.documentElement;
  const bg = (el) => {
    for (; el && el !== d; el = el.parentElement) {
      const c = getComputedStyle(el).backgroundColor;
      if (c && c !== "transparent" && !/rgba\\(.*,\\s*0\\)$/.test(c)) return c;
    }
    return "rgb(255, 255, 255)";
  };
  const boxes = [];
  for (const el of document.body.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.height) continue;
    const text = /^(P|H[1-6]|LI|IMG|BLOCKQUOTE|A|HR|SVG)$/i.test(el.tagName);
    const banded = !text && el.parentElement && bg(el) !== bg(el.parentElement);
    if (text || banded) boxes.push([r.top + scrollY, r.bottom + scrollY]);
  }
  return { width: Math.ceil(d.scrollWidth), height: Math.ceil(d.scrollHeight), boxes };
})()`;

/** Load the template's HTML (scripts stripped, like the sandboxed preview) and measure it. */
export async function loadEmail(page: Page, html: string, scale = 1): Promise<RenderedEmail> {
  await page.setViewport({ width: EMAIL_VIEWPORT, height: 900, deviceScaleFactor: scale });
  const clean = (html || "<p></p>").replace(/<script[\s\S]*?<\/script>/gi, "");
  try {
    // "load" waits for every image. (networkidle0 never fires again on a reused page once
    // the images are cached, so it would sit out the whole timeout for every later email.)
    await page.setContent(clean, { waitUntil: "load", timeout: 20_000 });
    await page.evaluate("document.fonts.ready");
  } catch {
    // A slow or missing image shouldn't sink the export; render what has loaded.
  }
  return page.evaluate(LAYOUT) as Promise<RenderedEmail>;
}

/**
 * Split a tall email into page-sized slices, cutting only where no small element
 * (a paragraph, button, image, or a short section like the dark CTA band) would be cut in half.
 */
export function pageSlices(email: RenderedEmail, firstMax: number, max: number): Box[] {
  const atomic = email.boxes.filter(([t, b]) => b - t <= max * 0.45);
  const edges = [...new Set(atomic.flat().map(Math.round))].sort((a, b) => a - b);
  const slices: Box[] = [];
  let start = 0;
  while (email.height - start > (slices.length ? max : firstMax)) {
    const limit = start + (slices.length ? max : firstMax);
    let cut = limit;
    for (let i = edges.length - 1; i >= 0; i--) {
      const y = edges[i];
      if (y > limit) continue;
      if (y < start + (limit - start) * 0.5) break;
      if (!atomic.some(([t, b]) => t < y - 1 && b > y + 1)) {
        cut = y;
        break;
      }
    }
    slices.push([start, cut]);
    start = cut;
  }
  slices.push([start, email.height]);
  return slices;
}

/**
 * Page slices plus a scale. When shrinking the email a little (up to 15%) saves a page,
 * e.g. a last page holding only the footer, it is shrunk just enough to do that.
 */
export function layoutPages(email: RenderedEmail, firstMax: number, max: number): { scale: number; slices: Box[] } {
  let best = { scale: 1, slices: pageSlices(email, firstMax, max) };
  for (const scale of [0.95, 0.9, 0.85]) {
    const slices = pageSlices(email, firstMax / scale, max / scale);
    if (slices.length < best.slices.length) best = { scale, slices };
  }
  return best;
}
