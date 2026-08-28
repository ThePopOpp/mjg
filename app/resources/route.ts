import { getPublishedPosts, normalizePostTags } from "@/lib/content/blog";
import { getPublishedAudioForTarget } from "@/lib/content/media";
import { publicSiteUrl, renderFaviconLinks, renderFonts, renderInstallScript, renderNavScript, renderNavStyles, renderPwaHeadTags, renderSiteFooter, renderSiteHeader, renderStaticPage, renderThemeScript } from "@/lib/public-site/static-pages";

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
  ${renderPwaHeadTags()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    ${renderNavStyles()}
    :root { --paper:#fbfaf7; --ink:#070807; --muted:#5f6d66; --line:#e4ded2; --green:#c9aa70; --card:#fff; }
    [data-theme="dark"] { --paper:#10110f; --ink:#f8f6f1; --muted:#b6bcb6; --line:#2b2a25; --card:#151713; }
    body { background:var(--paper); color:var(--ink); font-family:var(--font-body); line-height:1.6; }
    /* Match the nav bar's inner width so content lines up with the logo and theme toggle. */
    main { width:100%; max-width:1160px; margin:0 auto; padding:0 2rem; }
    .hero { padding:80px 0 44px; text-align:center; }
    .eyebrow { color:var(--gold); font-weight:800; letter-spacing:.16em; text-transform:uppercase; font-size:13px; }
    h1 { font-family:var(--font-display); font-size:clamp(48px, 9vw, 90px); line-height:.95; margin:18px 0; }
    .hero p { color:var(--muted); font-size:20px; max-width:700px; margin:0 auto; line-height:1.7; }
    /* Two columns of post cards + a sticky quick-access sidebar. */
    .layout { display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:32px; align-items:start; padding:28px 0 90px; }
    .cards { display:grid; grid-template-columns:1fr 1fr; gap:22px; align-content:start; }
    .sidebar { position:sticky; top:96px; }
    .quick { border:1px solid var(--line); background:var(--card); border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.04); }
    .quick-head { font-family:var(--font-display); font-size:22px; line-height:1.1; padding:20px 20px 4px; }
    .quick-sub { color:var(--muted); font-size:13px; padding:0 20px 14px; }
    .qitem { display:flex; align-items:center; gap:14px; padding:14px 20px; border-top:1px solid var(--line); text-decoration:none; color:inherit; transition:background .15s ease; }
    .qitem:hover { background:rgba(201,170,112,.09); }
    .qicon { width:40px; height:40px; flex:0 0 auto; border-radius:11px; display:grid; place-items:center; background:rgba(201,170,112,.13); color:var(--gold); }
    .qicon svg { width:20px; height:20px; }
    .qtext { display:flex; flex-direction:column; gap:1px; min-width:0; }
    .qtext strong { font-weight:700; font-size:15px; letter-spacing:-.01em; }
    .qtext small { color:var(--muted); font-size:12.5px; line-height:1.35; }
    .qarrow { margin-left:auto; color:var(--muted); flex:0 0 auto; transition:transform .15s ease, color .15s ease; }
    .qitem:hover .qarrow { color:var(--gold); transform:translateX(2px); }
    .qitem-feature { background:linear-gradient(180deg, rgba(201,170,112,.14), rgba(201,170,112,.05)); border-top:0; }
    .qitem-feature .qicon { background:var(--gold); color:#0d0d0c; }
    .quick-foot { padding:14px 20px 18px; border-top:1px solid var(--line); color:var(--muted); font-size:12px; }
    @media (max-width:980px) { .layout { grid-template-columns:1fr; gap:24px; } .sidebar { position:static; } }
    @media (max-width:560px) { .cards { grid-template-columns:1fr; } }
    article { border:1px solid var(--line); background:var(--card); border-radius:8px; overflow:hidden; height:100%; }
    article img { width:100%; aspect-ratio:16/9; object-fit:cover; display:block; }
    /* Whole post card is a link. */
    .post-link { display:block; text-decoration:none; color:inherit; }
    .post-link article { transition:border-color .18s ease, transform .18s ease, box-shadow .18s ease; }
    .post-link:hover article { border-color:var(--green); transform:translateY(-2px); box-shadow:0 12px 32px rgba(0,0,0,.08); }
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
    <div class="layout">
      <div class="cards">
        ${audioAssets.map((asset) => renderAudioCard(asset)).join("")}
        ${posts.map((post) => renderPostCard(post, siteUrl)).join("")}
      </div>
      <aside class="sidebar">${renderQuickAccess(siteUrl)}</aside>
    </div>
  </main>
  ${renderAudioModal()}
  ${renderSiteFooter(siteUrl)}
  ${renderNavScript()}
  ${renderInstallScript()}
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
  // The whole card is the link — the nested "Read post" is a span, not an anchor (no nested <a>).
  return `<a class="post-link" href="${siteUrl}/resources/${post.slug}"><article>
    ${post.featured_image_url ? `<img src="${escapeHtml(post.featured_image_url)}" alt="" />` : ""}
    <div class="body">
      <div class="meta">${escapeHtml(post.category?.name ?? "Resource")}</div>
      <h2>${escapeHtml(post.title)}</h2>
      <p class="clamp-3">${escapeHtml(post.excerpt || "")}</p>
      <div class="tags">${tags.map((tag: any) => `<span class="tag">${escapeHtml(tag.name)}</span>`).join("")}</div>
      <span class="read">Read post -></span>
    </div>
  </article></a>`;
}

// Sticky quick-access menu — the fastest paths off the Resources page.
function renderQuickAccess(siteUrl: string) {
  const ICONS: Record<string, string> = {
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5 16 12l-6 3.5z" fill="currentColor" stroke="none"/>',
    clipboard: '<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><path d="m9 14 2 2 4-4"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.94.36 1.86.7 2.73a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.35-1.35a2 2 0 0 1 2.11-.45c.87.34 1.79.57 2.73.7A2 2 0 0 1 22 16.92z"/>',
  };
  const arrow = '<svg class="qarrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>';
  const svg = (name: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

  const items: { href: string; icon: string; title: string; sub: string; feature?: boolean }[] = [
    { href: `${siteUrl}/6-week-challenge`, icon: "target", title: "The 6-Week Challenge", sub: "The Life You're Building — join or start a group.", feature: true },
    { href: `${siteUrl}/6-week-challenge/videos`, icon: "play", title: "Video Library", sub: "Every teaching video, in order." },
    { href: `${siteUrl}/created-for-more-check-in`, icon: "clipboard", title: "Created for More Check-In", sub: "A short stewardship self-assessment." },
    { href: `${siteUrl}/surveys/general`, icon: "message", title: "Take the Survey", sub: "Tell us where you are on the journey." },
    { href: `${siteUrl}/book`, icon: "calendar", title: "Book a Session", sub: "Sit down with Michael one-on-one." },
    { href: `${siteUrl}/#join`, icon: "mail", title: "Join the Journey", sub: "Get new resources in your inbox." },
    { href: `${siteUrl}/contact`, icon: "phone", title: "Contact Us", sub: "Questions? Reach the team." },
  ];

  return `<div class="quick">
    <div class="quick-head">Quick Access</div>
    <div class="quick-sub">Jump straight to the next step.</div>
    ${items.map((it) => `<a class="qitem${it.feature ? " qitem-feature" : ""}" href="${it.href}">
      <span class="qicon">${svg(it.icon)}</span>
      <span class="qtext"><strong>${escapeHtml(it.title)}</strong><small>${escapeHtml(it.sub)}</small></span>
      ${arrow}
    </a>`).join("")}
    <div class="quick-foot">New resources are added regularly — check back often.</div>
  </div>`;
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
