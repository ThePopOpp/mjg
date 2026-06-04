import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const supabase = createSupabaseAdminClient();
  const { data: asset, error } = await supabase.from("media_assets").select("*").eq("slug", slug).neq("status", "deleted").maybeSingle();
  if (error || !asset) notFound();

  return new Response(renderAsset(asset), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function renderAsset(asset: any) {
  const thumbnail = asset.metadata?.thumbnail_url || "";
  const media =
    asset.asset_type === "audio"
      ? renderAudioCard(asset, thumbnail)
      : asset.asset_type === "video"
        ? asset.embed_url
          ? `<iframe src="${escapeHtml(asset.embed_url)}" title="${escapeHtml(asset.title)}" style="width:100%;aspect-ratio:16/9;border:0;" allowfullscreen></iframe>`
          : `<video controls src="${escapeHtml(asset.file_url || "")}" style="width:100%;max-height:75vh;"></video>`
        : `<img src="${escapeHtml(asset.file_url || asset.embed_url || "")}" alt="${escapeHtml(asset.title)}" style="max-width:100%;height:auto;border-radius:8px;" />`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(asset.title)} | Media</title>
  <style>
    body { margin:0; background:#10110f; color:#f8f6f1; font-family:Inter, system-ui, sans-serif; }
    main { min-height:100vh; display:grid; place-items:center; padding:24px; }
    section { width:min(920px,100%); }
    h1 { font-family:Georgia,serif; font-size:clamp(28px,5vw,54px); margin:0 0 16px; }
    p { color:#b6bcb6; line-height:1.6; }
    button { font:inherit; }
    .audio-card { display:grid; grid-template-columns:minmax(0,0.85fr) minmax(0,1.15fr); gap:28px; align-items:center; border:1px solid #2b2a25; border-radius:14px; background:#151713; padding:20px; box-shadow:0 24px 70px rgba(0,0,0,.32); }
    .thumb { aspect-ratio:1; overflow:hidden; border-radius:10px; background:#0f100e; display:grid; place-items:center; }
    .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
    .mark { color:#d0af74; font-weight:900; font-size:42px; letter-spacing:.02em; }
    .eyebrow { color:#d0af74; text-transform:uppercase; letter-spacing:.18em; font-size:12px; font-weight:700; }
    .copy button { margin-top:18px; border:0; border-radius:8px; background:#d0af74; color:#0f100e; padding:13px 20px; font-weight:800; cursor:pointer; }
    .player-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.58); backdrop-filter:blur(6px); }
    .player-sheet { position:fixed; inset:auto 18px 18px; max-width:760px; margin-inline:auto; transform:translateY(calc(100% + 24px)); transition:transform .22s ease; border:1px solid #2b2a25; border-radius:18px; background:#151713; padding:24px; box-shadow:0 24px 80px rgba(0,0,0,.45); }
    .player-sheet[aria-hidden="false"] { transform:translateY(0); }
    .player-sheet h2 { margin:0 0 18px; font-family:Georgia,serif; font-size:clamp(24px,4vw,40px); }
    .close { position:absolute; top:12px; right:14px; border:0; background:transparent; color:#f8f6f1; font-size:30px; cursor:pointer; }
    .controls { display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:14px; }
    .controls button { border:1px solid #3a382f; border-radius:8px; background:#10110f; color:#f8f6f1; padding:9px 12px; cursor:pointer; }
    @media (max-width:720px) { .audio-card { grid-template-columns:1fr; } .player-sheet { inset:auto 0 0; border-radius:18px 18px 0 0; } }
  </style>
</head>
<body>
  <main>
    <section>
      <h1>${escapeHtml(asset.title)}</h1>
      ${media}
    </section>
  </main>
</body>
</html>`;
}

function renderAudioCard(asset: any, thumbnail: string) {
  const source = escapeHtml(asset.file_url || asset.embed_url || "");
  return `
  <article class="audio-card">
    <div class="thumb">
      ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="" />` : `<div class="mark">MJG</div>`}
    </div>
    <div class="copy">
      <p class="eyebrow">Michael J. Gauthier</p>
      <h1>${escapeHtml(asset.title)}</h1>
      ${asset.description ? `<p>${escapeHtml(asset.description)}</p>` : ""}
      <button id="open-player" type="button">Listen now</button>
    </div>
  </article>
  <div id="player-backdrop" class="player-backdrop" hidden></div>
  <aside id="player-sheet" class="player-sheet" aria-hidden="true">
    <button id="close-player" class="close" type="button" aria-label="Close audio player">×</button>
    <p class="eyebrow">Now playing</p>
    <h2>${escapeHtml(asset.title)}</h2>
    <audio id="audio-player" controls src="${source}" style="width:100%;"></audio>
    <div class="controls">
      <button type="button" data-skip="-10">Rewind 10</button>
      <button type="button" data-play="true">Play</button>
      <button type="button" data-pause="true">Pause</button>
      <button type="button" data-stop="true">Stop</button>
      <button type="button" data-skip="10">Forward 10</button>
    </div>
  </aside>
  <script>
    const sheet = document.getElementById('player-sheet');
    const backdrop = document.getElementById('player-backdrop');
    const audio = document.getElementById('audio-player');
    function openPlayer() { sheet.setAttribute('aria-hidden', 'false'); backdrop.hidden = false; audio.play().catch(() => {}); }
    function closePlayer() { sheet.setAttribute('aria-hidden', 'true'); backdrop.hidden = true; audio.pause(); }
    document.getElementById('open-player').addEventListener('click', openPlayer);
    document.getElementById('close-player').addEventListener('click', closePlayer);
    backdrop.addEventListener('click', closePlayer);
    document.querySelectorAll('.controls button').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.play) audio.play();
        if (button.dataset.pause) audio.pause();
        if (button.dataset.stop) { audio.pause(); audio.currentTime = 0; }
        if (button.dataset.skip) audio.currentTime = Math.max(0, audio.currentTime + Number(button.dataset.skip));
      });
    });
  </script>`;
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
