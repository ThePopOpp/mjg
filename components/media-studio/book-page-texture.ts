import * as THREE from "three";

// Each book page is drawn to an offscreen 2D canvas and uploaded as a texture. Doing the
// composition here (rather than mapping a raw photo onto the plane) is what keeps the book on
// brand: cream stock, gold hairlines, ink serif headings — and it gives text-only pages
// something to render. Drawn large so the type survives being a texture.
export const PAGE_TEXTURE_WIDTH = 1024;
export const PAGE_TEXTURE_HEIGHT = 1434; // ~1:1.4, standard trade book proportion

export type PageArtwork = {
  heading: string;
  body: string;
  imageUrl: string | null;
  pageNumber: number | null;
};

export type BookTheme = {
  pageColor: string;
  accentColor: string;
  coverColor: string;
};

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", sans-serif';

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

function loadImage(url: string): Promise<HTMLImageElement | null> {
  const cached = imageCache.get(url);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    // Supabase storage public URLs serve permissive CORS; without this the canvas would be
    // tainted and texture upload would throw.
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });

  imageCache.set(url, promise);
  return promise;
}

function makeCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_TEXTURE_WIDTH;
  canvas.height = PAGE_TEXTURE_HEIGHT;
  return canvas;
}

/** Faint fibre speckle so flat cream doesn't read as plastic under the lights. */
function paperGrain(ctx: CanvasRenderingContext2D, alpha = 0.025) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < 2600; i += 1) {
    const x = Math.random() * PAGE_TEXTURE_WIDTH;
    const y = Math.random() * PAGE_TEXTURE_HEIGHT;
    ctx.fillStyle = Math.random() > 0.5 ? "#000000" : "#ffffff";
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.restore();
}

/** Wrap text to a width, returning the y the caller should continue from. */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let cursorY = y;
  let lines = 0;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && line) {
      if (lines + 1 >= maxLines) {
        ctx.fillText(`${line}…`, x, cursorY);
        return cursorY + lineHeight;
      }
      ctx.fillText(line, x, cursorY);
      cursorY += lineHeight;
      lines += 1;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    ctx.fillText(line, x, cursorY);
    cursorY += lineHeight;
  }
  return cursorY;
}

/** Draw an image cover-fit (crop to fill) inside a box. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
}

function finishTexture(canvas: HTMLCanvasElement, renderer?: THREE.WebGLRenderer) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 8;
  texture.needsUpdate = true;
  return texture;
}

/** An interior page: optional photo, heading, body copy, folio. */
export async function buildPageTexture(
  page: PageArtwork,
  theme: BookTheme,
  renderer?: THREE.WebGLRenderer,
): Promise<THREE.CanvasTexture> {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d")!;
  const margin = 86;
  const innerWidth = PAGE_TEXTURE_WIDTH - margin * 2;

  ctx.fillStyle = theme.pageColor;
  ctx.fillRect(0, 0, PAGE_TEXTURE_WIDTH, PAGE_TEXTURE_HEIGHT);

  const img = page.imageUrl ? await loadImage(page.imageUrl) : null;
  let cursorY = margin;

  if (img) {
    const boxHeight = Math.round(PAGE_TEXTURE_HEIGHT * 0.54);
    drawCover(ctx, img, margin, cursorY, innerWidth, boxHeight);
    // Gold hairline frame, the same accent treatment the dashboard uses on cards.
    ctx.strokeStyle = theme.accentColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin + 1.5, cursorY + 1.5, innerWidth - 3, boxHeight - 3);
    cursorY += boxHeight + 64;
  }

  // Short gold rule above the heading.
  ctx.fillStyle = theme.accentColor;
  ctx.fillRect(margin, cursorY, 88, 4);
  cursorY += 44;

  if (page.heading) {
    ctx.fillStyle = "#111111";
    ctx.font = `600 60px ${SERIF}`;
    ctx.textBaseline = "top";
    cursorY = wrapText(ctx, page.heading, margin, cursorY, innerWidth, 72, 3) + 20;
  }

  if (page.body) {
    ctx.fillStyle = "#4a4a46";
    ctx.font = `30px ${SANS}`;
    ctx.textBaseline = "top";
    const remaining = PAGE_TEXTURE_HEIGHT - margin - 70 - cursorY;
    wrapText(ctx, page.body, margin, cursorY, innerWidth, 46, Math.max(1, Math.floor(remaining / 46)));
  }

  if (page.pageNumber != null) {
    ctx.fillStyle = "#9a958c";
    ctx.font = `24px ${SANS}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(String(page.pageNumber), PAGE_TEXTURE_WIDTH / 2, PAGE_TEXTURE_HEIGHT - margin + 18);
    ctx.textAlign = "left";
  }

  paperGrain(ctx);
  return finishTexture(canvas, renderer);
}

/** The front cover: ink board, gold foil frame and title. */
export async function buildCoverTexture(
  title: string,
  subtitle: string,
  theme: BookTheme,
  imageUrl: string | null,
  renderer?: THREE.WebGLRenderer,
): Promise<THREE.CanvasTexture> {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = theme.coverColor;
  ctx.fillRect(0, 0, PAGE_TEXTURE_WIDTH, PAGE_TEXTURE_HEIGHT);

  if (imageUrl) {
    const img = await loadImage(imageUrl);
    if (img) {
      ctx.globalAlpha = 0.42;
      drawCover(ctx, img, 0, 0, PAGE_TEXTURE_WIDTH, PAGE_TEXTURE_HEIGHT);
      ctx.globalAlpha = 1;
      // Darken so foil type stays legible over any photo.
      ctx.fillStyle = "rgba(17,17,17,0.55)";
      ctx.fillRect(0, 0, PAGE_TEXTURE_WIDTH, PAGE_TEXTURE_HEIGHT);
    }
  }

  const inset = 64;
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(inset, inset, PAGE_TEXTURE_WIDTH - inset * 2, PAGE_TEXTURE_HEIGHT - inset * 2);
  ctx.lineWidth = 1;
  ctx.strokeRect(inset + 14, inset + 14, PAGE_TEXTURE_WIDTH - (inset + 14) * 2, PAGE_TEXTURE_HEIGHT - (inset + 14) * 2);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = theme.accentColor;
  ctx.font = `600 68px ${SERIF}`;
  const centerY = PAGE_TEXTURE_HEIGHT / 2;
  const words = title.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width > PAGE_TEXTURE_WIDTH - inset * 3 && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  const startY = centerY - ((lines.length - 1) * 84) / 2;
  lines.forEach((text, i) => ctx.fillText(text, PAGE_TEXTURE_WIDTH / 2, startY + i * 84));

  if (subtitle) {
    ctx.fillStyle = "rgba(250,248,244,0.72)";
    ctx.font = `28px ${SANS}`;
    ctx.fillText(subtitle.toUpperCase(), PAGE_TEXTURE_WIDTH / 2, startY + lines.length * 84 + 34);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  return finishTexture(canvas, renderer);
}

/** A blank sheet — used for the inside of the cover and any unpaired trailing page. */
export function buildBlankTexture(theme: BookTheme, renderer?: THREE.WebGLRenderer): THREE.CanvasTexture {
  const canvas = makeCanvas();
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = theme.pageColor;
  ctx.fillRect(0, 0, PAGE_TEXTURE_WIDTH, PAGE_TEXTURE_HEIGHT);
  paperGrain(ctx, 0.02);
  return finishTexture(canvas, renderer);
}
