import sharp from "sharp";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOGO = join(root, "docs", "mjg-logos", "mjg_white.png");
const OUT = join(root, "public", "icons");
const BG = "#111111";

async function make(size, padRatio, file) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const logo = await sharp(LOGO).resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: logo, gravity: "centre" }])
    .png()
    .toFile(join(OUT, file));
  console.log("wrote", file, `${size}x${size}`);
}

await make(192, 0.16, "icon-192.png");
await make(512, 0.16, "icon-512.png");
await make(512, 0.24, "icon-maskable-512.png"); // extra safe-zone padding for maskable
await make(180, 0.14, "apple-touch-icon.png");
console.log("done");
