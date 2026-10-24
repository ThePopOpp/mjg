#!/usr/bin/env node
/**
 * Prepares the marketing site's media in public/marketing/.
 *
 *   - Re-encodes the Steward hero loops (the designer's exports are 9.8 MB and
 *     4.8 MB) to web-sized H.264, silent, with a poster frame each. The poster is
 *     what paints first, so it is the page's LCP element.
 *   - Converts the portrait to WebP.
 *   - Downloads the Unsplash stock placeholders listed in
 *     lib/marketing/media/stock-manifest.json (free under the Unsplash License).
 *
 * ffmpeg is not a project dependency. Point FFMPEG at a binary:
 *   FFMPEG=/path/to/ffmpeg node scripts/marketing/prepare-media.mjs
 * Without it, video steps are skipped and the rest still runs.
 *
 * Idempotent: existing outputs are kept unless --force is passed.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const force = process.argv.includes("--force");
const ffmpeg = process.env.FFMPEG;
const mockups = path.join(root, "docs/mjg-frontend-updates/front-end-files/MJG website frontend mockups");
const out = (...p) => path.join(root, "public/marketing", ...p);
const kb = (file) => `${Math.round(statSync(file).size / 1024)} KB`;

function needs(file) {
  if (force || !existsSync(file)) {
    mkdirSync(path.dirname(file), { recursive: true });
    return true;
  }
  console.log(`  keep ${path.relative(root, file)}`);
  return false;
}

// ── Hero video ───────────────────────────────────────────────────────────────

const videos = [
  { src: "uploads/Steward Agent Animation.mp4", name: "steward-agent", width: 1600 },
  { src: "uploads/Steward Agent Animation - Mobile.mp4", name: "steward-agent-mobile", width: 720 },
];

if (!ffmpeg) {
  console.log("FFMPEG not set — skipping video re-encode and posters.");
} else {
  for (const v of videos) {
    const input = path.join(mockups, v.src);
    const mp4 = out("video", `${v.name}.mp4`);
    if (needs(mp4)) {
      execFileSync(ffmpeg, [
        "-y", "-loglevel", "error", "-i", input,
        "-an", // silent: it autoplays, and a muted autoplay must have nothing to mute
        "-vf", `scale=${v.width}:-2:flags=lanczos`,
        "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-profile:v", "high", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", // metadata first, so playback starts before the download ends
        mp4,
      ]);
      console.log(`  wrote ${path.relative(root, mp4)} (${kb(mp4)})`);
    }
    const poster = out("video", `${v.name}-poster.jpg`);
    if (needs(poster)) {
      const frame = out("video", `${v.name}-frame.png`);
      execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-ss", "0.5", "-i", input, "-frames:v", "1", "-vf", `scale=${v.width}:-2`, frame]);
      await sharp(frame).jpeg({ quality: 78, mozjpeg: true }).toFile(poster);
      execFileSync(process.platform === "win32" ? "cmd" : "rm", process.platform === "win32" ? ["/c", "del", frame] : [frame]);
      console.log(`  wrote ${path.relative(root, poster)} (${kb(poster)})`);
    }
  }
}

// ── Brand images ─────────────────────────────────────────────────────────────

const brand = [
  { src: path.join(root, "public/media/mike-gauthier-profile-photo.png"), name: "michael-gauthier.webp", width: 720 },
  { src: path.join(root, "public/media/Gauthier-Family-840x1020-1.png"), name: "gauthier-family.webp", width: 840 },
  {
    src: path.join(root, "public/media/The-Watch-the-Title-and-the-Wrong-Scoreboard-Featured-Image-v.2.png"),
    name: "watch-wrong-scoreboard.webp",
    width: 1200,
  },
  // The book render (transparent background), used wherever the 3D model is not.
  {
    src: path.join(root, "docs/Book - The Life You're Building/the-life-youre-building-book.png"),
    name: "the-life-youre-building-book.webp",
    width: 730,
  },
];

// The 3D book, as exported (textures embedded in the .glb).
{
  const glb = out("3d", "the-life-youre-building.glb");
  if (needs(glb)) {
    copyFileSync(path.join(root, "docs/Book - The Life You're Building/the-life-youre-building.glb"), glb);
    console.log(`  wrote ${path.relative(root, glb)} (${kb(glb)})`);
  }
}

for (const b of brand) {
  const file = out("brand", b.name);
  if (needs(file)) {
    await sharp(b.src).resize({ width: b.width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(file);
    console.log(`  wrote ${path.relative(root, file)} (${kb(file)})`);
  }
}

// ── Stock placeholders ───────────────────────────────────────────────────────

const manifestPath = path.join(root, "lib/marketing/media/stock-manifest.json");
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : [];

for (const item of manifest) {
  const file = out("stock", item.file);
  if (!needs(file)) continue;
  // Unsplash's image CDN; w/q/fm resize and recompress server-side.
  const url = `https://images.unsplash.com/${item.photo}?w=${item.width ?? 1600}&q=78&fm=jpg&fit=max`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  FAILED ${item.file}: ${res.status} ${url}`);
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
  console.log(`  wrote ${path.relative(root, file)} (${kb(file)}) — ${item.credit}`);
}

writeFileSync(out(".prepared"), new Date().toISOString());
console.log("Done.");
