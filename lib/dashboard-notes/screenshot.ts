// Screenshot capture for the Dashboard Review FAB. Uses html-to-image (NOT
// html2canvas — it can't parse oklch/color-mix used by modern themes). See
// docs/features/dashboard-review-fab-portable.md §5.
//
// Robustness notes (why this config): capturing the whole dashboard often pulls
// in CROSS-ORIGIN images (logo/avatars/media from other domains) and web fonts.
// - `imagePlaceholder` makes a failed cross-origin image render as a transparent
//   pixel instead of throwing / tainting the canvas ("Couldn't capture").
// - `skipFonts` avoids reading cross-origin @font-face rules (a common throw).
// - `cacheBust: false` — cache-busting appends ?t=… which turns cached images
//   into fresh cross-origin requests that fail CORS.

const TRANSPARENT_PX =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

async function clampDataUrl(dataUrl: string, maxEdge: number): Promise<string> {
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  if (scale >= 1) return dataUrl;
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.9);
}

export async function capturePage(target?: HTMLElement): Promise<string> {
  const mod = await import("html-to-image"); // dynamic → client only
  const el = target || document.body;
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  const opts = {
    quality: 0.92,
    backgroundColor: bg,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    cacheBust: false,
    skipFonts: true,
    imagePlaceholder: TRANSPARENT_PX,
    filter: (n: Node) => !(n instanceof HTMLElement && typeof n.hasAttribute === "function" && n.hasAttribute("data-fab-ignore")),
  };
  let raw: string;
  try {
    raw = await mod.toJpeg(el, opts);
  } catch {
    // A second pass sometimes succeeds once images have been fetched/cached, and
    // PNG avoids a couple of JPEG-only edge cases.
    raw = await mod.toPng(el, opts);
  }
  if (!raw || raw.length < 1000) throw new Error("The capture came back empty — try again.");
  return clampDataUrl(raw, 1600);
}

// dataURL → File for upload via /api/admin/uploads.
export async function dataUrlToFile(dataUrl: string, name = "screenshot.jpg"): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
