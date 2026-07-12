import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
// Source of truth for the app icon = the MJG favicon (black squircle + white MJG monogram).
const SRC = join(root, "docs", "mjg-logos", "mjg_favicon_black_50px.svg");
const OUT = join(root, "public", "icons");
const BG = "#000000"; // matches the favicon's black squircle so corners blend

async function make(size, padRatio, file) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  // Rasterize the favicon SVG (squircle black + white letters, transparent corners) at high density.
  const mark = await sharp(SRC, { density: 512 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  // Composite onto a solid black square so there are no transparent corners
  // (full-bleed → the OS applies its own rounding, reproducing the favicon look).
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(join(OUT, file));
  console.log("wrote", file, `${size}x${size}`);
}

// "any" icons + apple: squircle fills the tile (pad 0); the OS rounds it.
await make(192, 0, "icon-192.png");
await make(512, 0, "icon-512.png");
await make(180, 0, "apple-touch-icon.png");
// maskable: extra safe-zone padding so Android's adaptive mask never clips the monogram.
await make(512, 0.16, "icon-maskable-512.png");
console.log("done");
