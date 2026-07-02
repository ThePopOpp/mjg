// Screenshot capture for the Dashboard Review FAB. Uses html-to-image (NOT
// html2canvas — it can't parse oklch/color-mix used by modern themes). See
// docs/features/dashboard-review-fab-portable.md §5.

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

export async function capturePage(): Promise<string> {
  const { toJpeg } = await import("html-to-image"); // dynamic → client only
  const bg = getComputedStyle(document.body).backgroundColor || "#ffffff";
  const raw = await toJpeg(document.body, {
    quality: 0.9,
    backgroundColor: bg,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    filter: (n) => !(n instanceof HTMLElement && typeof n.hasAttribute === "function" && n.hasAttribute("data-fab-ignore")),
    cacheBust: true,
  });
  return clampDataUrl(raw, 1600);
}

// dataURL → File for upload via /api/admin/uploads.
export async function dataUrlToFile(dataUrl: string, name = "screenshot.jpg"): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}
