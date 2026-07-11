import { getPublishedPosts, normalizePostTags } from "@/lib/content/blog";
import { getPublishedAudioForTarget } from "@/lib/content/media";
import { publicSiteUrl, renderFaviconLinks, renderFonts, renderNavScript, renderNavStyles, renderSiteHeader, renderStaticPage, renderThemeScript } from "@/lib/public-site/static-pages";

export async function GET() {
  const [posts, audioAssets] = await Promise.all([getPublishedPosts(), getPublishedAudioForTarget("frontend_resources", 6)]);
  if (!posts.length && !audioAssets.length) return renderStaticPage("resources.html");

  const siteUrl = publicSiteUrl();
  return new Response(renderArchive(posts as any[], audioAssets as any[], siteUrl), {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function renderArchive(posts: any[], audioAssets: any[], siteUrl: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Resources | Michael J. Gauthier</title>
  ${renderFaviconLinks()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ${renderNavStyles()}
    :root { --paper:#fbfaf7; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --green:#c9aa70; --card:#fff; }
    [data-theme="dark"] { --paper:#10110f; --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --card:#151713; }
    body { background:var(--paper); color:var(--ink); font-family:var(--font-body); line-height:1.6; }
    main { width:min(1180px, calc(100% - 40px)); margin:0 auto; }
    .hero { padding:80px 0 44px; text-align:center; }
    .eyebrow { color:var(--gold); font-weight:800; letter-spacing:.16em; text-transform:uppercase; font-size:13px; }
    h1 { font-family:var(--font-display); font-size:clamp(48px, 9vw, 90px); line-height:.95; margin:18px 0; }
    .hero p { color:var(--muted); font-size:20px; max-width:700px; margin:0 auto; line-height:1.7; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:22px; padding:28px 0 90px; }
    article { border:1px solid var(--line); background:var(--card); border-radius:8px; overflow:hidden; }
    article img { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; }
    .body { padding:22px; }
    .meta { color:var(--gold); font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
    h2 { font-family:var(--font-display); font-size:30px; line-height:1.1; margin:12px 0; }
    p { color:var(--muted); line-height:1.65; }
    .clamp-3 { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
    .tags { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
    .tag { border:1px solid var(--line); border-radius:999px; padding:5px 10px; color:var(--muted); font-size:12px; }
    .read { display:inline-flex; margin-top:18px; color:var(--green); font-weight:800; text-decoration:none; }
    .listen { display:inline-flex; align-items:center; gap:8px; margin-top:18px; border:0; border-radius:6px; background:var(--green); color:#fff; padding:12px 16px; font-weight:800; cursor:pointer; }
    .audio-sheet-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.62); backdrop-filter:blur(6px); z-index:200; }
    .audio-sheet { position:fixed; left:50%; bottom:24px; width:min(720px, calc(100% - 32px)); transform:translate(-50%, calc(100% + 40px)); transition:transform .22s ease; z-index:201; border:1px solid var(--line); border-radius:18px; background:var(--card); padding:24px; box-shadow:0 28px 90px rgba(0,0,0,.44); }
    .audio-sheet.open { transform:translate(-50%, 0); }
    .audio-sheet-header { display:flex; gap:16px; align-items:flex-start; }
    .audio-sheet-thumb { width:92px; height:92px; border-radius:8px; object-fit:cover; background:var(--line); flex:0 0 auto; }
    .audio-sheet h3 { font-family:var(--font-display); font-size:32px; line-height:1; margin:0 36px 8px 0; }
    .audio-sheet audio { width:100%; margin-top:18px; }
    .audio-close { position:absolute; top:16px; right:16px; width:38px; height:38px; border-radius:999px; border:1px solid var(--line); background:transparent; color:var(--ink); cursor:pointer; font-size:24px; line-height:1; }
    @media (max-width:640px) { .audio-sheet { bottom:0; width:100%; border-radius:18px 18px 0 0; } .audio-sheet-header { flex-direction:column; } }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}
  <main>
    <section class="hero">
      <div class="eyebrow">Resources</div>
      <h1>The Stewardship Blueprint</h1>
      <p>Reflections, resources, and practical next steps for living with intention across faith, family, fitness, finances, and meaningful experiences.</p>
    </section>
    <section class="grid">
      ${audioAssets.map((asset) => renderAudioCard(asset)).join("")}
      ${posts.map((post) => renderPostCard(post, siteUrl)).join("")}
    </section>
  </main>
  ${renderAudioModal()}
  ${renderNavScript()}
</body>
</html>`;
}

function renderAudioCard(asset: any) {
  const thumbnail = asset.metadata?.thumbnail_url;
  return `<article>
    ${thumbnail ? `<img src="${escapeHtml(thumbnail)}" alt="" />` : ""}
    <div class="body">
      <div class="meta">Audio</div>
      <h2>${escapeHtml(asset.title)}</h2>
      <p class="clamp-3">${escapeHtml(asset.description || "")}</p>
      <button class="listen" type="button"
        data-title="${escapeAttribute(asset.title)}"
        data-description="${escapeAttribute(asset.description || "")}"
        data-src="${escapeAttribute(asset.file_url || "")}"
        data-thumbnail="${escapeAttribute(thumbnail || "")}">
        Listen now
      </button>
    </div>
  </article>`;
}

function renderPostCard(post: any, siteUrl: string) {
  const tags = normalizePostTags(post);
  return `<article>
    ${post.featured_image_url ? `<img src="${escapeHtml(post.featured_image_url)}" alt="" />` : ""}
    <div class="body">
      <div class="meta">${escapeHtml(post.category?.name ?? "Resource")}</div>
      <h2>${escapeHtml(post.title)}</h2>
      <p class="clamp-3">${escapeHtml(post.excerpt || "")}</p>
      <div class="tags">${tags.map((tag: any) => `<span class="tag">${escapeHtml(tag.name)}</span>`).join("")}</div>
      <a class="read" href="${siteUrl}/resources/${post.slug}">Read post -></a>
    </div>
  </article>`;
}

function renderAudioModal() {
  return `<div id="audio-sheet-backdrop" class="audio-sheet-backdrop" hidden></div>
  <aside id="audio-sheet" class="audio-sheet" aria-hidden="true">
    <button id="audio-close" class="audio-close" type="button" aria-label="Close audio player">&times;</button>
    <div class="audio-sheet-header">
      <img id="audio-sheet-thumb" class="audio-sheet-thumb" alt="" hidden />
      <div>
        <div class="meta">The Stewardship Blueprint</div>
        <h3 id="audio-sheet-title">Audio</h3>
        <p id="audio-sheet-description"></p>
      </div>
    </div>
    <audio id="audio-sheet-player" controls preload="metadata"></audio>
  </aside>
  <script>
    (function(){
      var sheet=document.getElementById('audio-sheet'),backdrop=document.getElementById('audio-sheet-backdrop'),player=document.getElementById('audio-sheet-player'),title=document.getElementById('audio-sheet-title'),desc=document.getElementById('audio-sheet-description'),thumb=document.getElementById('audio-sheet-thumb');
      function close(){sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');backdrop.hidden=true;if(player){player.pause();}}
      document.querySelectorAll('.listen').forEach(function(button){
        button.addEventListener('click',function(){
          title.textContent=button.dataset.title||'Audio';
          desc.textContent=button.dataset.description||'';
          player.src=button.dataset.src||'';
          if(button.dataset.thumbnail){thumb.src=button.dataset.thumbnail;thumb.hidden=false;}else{thumb.hidden=true;}
          backdrop.hidden=false;sheet.setAttribute('aria-hidden','false');requestAnimationFrame(function(){sheet.classList.add('open');});
          player.play().catch(function(){});
        });
      });
      document.getElementById('audio-close').addEventListener('click',close);
      backdrop.addEventListener('click',close);
      document.addEventListener('keydown',function(event){if(event.key==='Escape'&&sheet.classList.contains('open'))close();});
    })();
  </script>`;
}

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("\n", " ");
}
