import { NextResponse } from "next/server";
import { getOrderedAudioForTarget, LISTEN_TARGET } from "@/lib/content/media";
import {
  publicSiteUrl,
  renderFaviconLinks,
  renderFonts,
  renderInstallScript,
  renderNavScript,
  renderNavStyles,
  renderPwaHeadTags,
  renderSiteFooter,
  renderSiteHeader,
  renderThemeScript,
} from "@/lib/public-site/static-pages";

// The Listen page — an audiobook-style library of short recordings about the book.
//
// Which tracks appear is controlled entirely from Media Studio: tick the "Listen
// page" display location on a published audio asset. The running order comes from
// metadata.sort_order, set by dragging tracks in the Listen page order panel.
//
// This reads getOrderedAudioForTarget(), NOT getPublishedAudioForTarget() — the
// latter is newest-first and is what the homepage and Resources page rely on.

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = publicSiteUrl();
  const tracks = await getOrderedAudioForTarget(LISTEN_TARGET, 100);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Listen | Michael J. Gauthier</title>
  <meta name="description" content="Listen to readings and reflections from The Stewardship Blueprint — short audio chapters on using God-given resources for God-given purposes." />
  <link rel="canonical" href="${siteUrl}/listen" />
  ${renderFaviconLinks()}
  ${renderPwaHeadTags()}
  ${renderThemeScript()}
  ${renderFonts()}
  <style>
    ${renderNavStyles()}

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --paper: #fbfaf7; --ink: #070807; --muted: #5f6d66;
      --line: #e4ded2; --gold: #C9A46E; --card: #ffffff;
    }
    [data-theme="dark"] {
      --paper: #10110f; --ink: #f8f6f1; --muted: #b6bcb6;
      --line: #2b2a25; --card: #1a1b18;
    }

    body { margin:0; background:var(--paper); color:var(--ink); font-family:var(--font-body); }

    /* ── Hero ── */
    .l-hero { padding:76px 20px 58px; text-align:center; border-bottom:1px solid var(--line); }
    .l-hero-inner { max-width:760px; margin:0 auto; }
    .l-eyebrow {
      display:inline-flex; border:1px solid var(--line); border-radius:999px; padding:8px 18px;
      color:var(--gold); font-weight:700; letter-spacing:.16em; text-transform:uppercase;
      font-size:11px; margin-bottom:26px;
    }
    .l-hero h1 { font-family:var(--font-display); font-size:clamp(38px,6.6vw,66px); line-height:1.04; margin:0 0 20px; }
    .l-hero h1 em { color:var(--gold); font-style:italic; }
    .l-lede { color:var(--muted); font-size:19px; line-height:1.7; max-width:620px; margin:0 auto; }

    /* ── Track list ── */
    .l-tracks-section { padding:52px 20px 88px; }
    .l-wrap { max-width:780px; margin:0 auto; }
    .l-count { font-size:12px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin:0 0 18px; }
    .l-tracks { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px; }

    .l-track {
      border:1px solid var(--line); border-radius:14px; background:var(--card);
      padding:18px 20px; transition:border-color .2s;
    }
    .l-track.is-current { border-color:var(--gold); }
    .l-track-head { display:flex; align-items:flex-start; gap:16px; }

    .l-play {
      flex:0 0 auto; width:52px; height:52px; border-radius:999px; cursor:pointer;
      border:1px solid var(--gold); background:rgba(201,164,110,.12); color:var(--gold);
      display:flex; align-items:center; justify-content:center; transition:background .2s, transform .15s;
    }
    .l-play:hover { background:rgba(201,164,110,.22); }
    .l-play:active { transform:scale(.95); }
    .l-play:focus-visible { outline:2px solid var(--gold); outline-offset:3px; }
    .l-play svg { width:20px; height:20px; fill:currentColor; }
    .l-play .icon-pause { display:none; }
    .l-track.is-playing .l-play { background:var(--gold); color:#1a1206; }
    .l-track.is-playing .l-play .icon-play { display:none; }
    .l-track.is-playing .l-play .icon-pause { display:block; }

    .l-track-meta { min-width:0; flex:1; }
    .l-track-num { font-size:11px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:var(--gold); }
    .l-track h2 { font-family:var(--font-display); font-size:24px; line-height:1.2; margin:4px 0 6px; }
    .l-track p { color:var(--muted); font-size:14.5px; line-height:1.65; margin:0; }
    .l-track-time { flex:0 0 auto; color:var(--muted); font-size:13px; font-variant-numeric:tabular-nums; padding-top:6px; }

    /* Player rail — only visible on the active track */
    .l-player { display:none; margin-top:16px; align-items:center; gap:12px; }
    .l-track.is-current .l-player { display:flex; }
    .l-seek {
      flex:1; -webkit-appearance:none; appearance:none; height:22px; background:transparent; cursor:pointer; margin:0;
    }
    .l-seek::-webkit-slider-runnable-track {
      height:6px; border-radius:999px;
      background:linear-gradient(to right, var(--gold) var(--pct,0%), var(--line) var(--pct,0%));
    }
    .l-seek::-webkit-slider-thumb {
      -webkit-appearance:none; appearance:none; width:16px; height:16px; margin-top:-5px;
      border-radius:999px; background:var(--gold); border:2px solid var(--card);
    }
    .l-seek::-moz-range-track { height:6px; border-radius:999px; background:var(--line); }
    .l-seek::-moz-range-progress { height:6px; border-radius:999px; background:var(--gold); }
    .l-seek::-moz-range-thumb { width:14px; height:14px; border:2px solid var(--card); border-radius:999px; background:var(--gold); }
    .l-seek:focus-visible { outline:2px solid var(--gold); outline-offset:4px; }
    .l-elapsed, .l-duration { color:var(--muted); font-size:12.5px; font-variant-numeric:tabular-nums; min-width:42px; }
    .l-elapsed { text-align:right; }

    /* ── Empty state ── */
    .l-empty {
      border:1px dashed var(--line); border-radius:16px; background:var(--card);
      padding:56px 28px; text-align:center;
    }
    .l-empty-mark {
      width:56px; height:56px; margin:0 auto 18px; border-radius:999px; border:2px solid var(--gold);
      display:flex; align-items:center; justify-content:center; color:var(--gold);
    }
    .l-empty-mark svg { width:24px; height:24px; fill:currentColor; }
    .l-empty h2 { font-family:var(--font-display); font-size:27px; margin:0 0 10px; }
    .l-empty p { color:var(--muted); font-size:15.5px; line-height:1.7; margin:0 auto; max-width:420px; }
    .l-empty-cta {
      display:inline-flex; align-items:center; min-height:44px; margin-top:24px; padding:12px 22px;
      border-radius:8px; background:var(--ink); color:var(--paper); text-decoration:none; font-weight:600; font-size:14.5px;
    }
    .l-empty-cta:hover { opacity:.88; }

    @media (max-width:600px) {
      .l-hero { padding:52px 16px 42px; }
      .l-tracks-section { padding:36px 16px 64px; }
      .l-track { padding:16px; }
      .l-track-head { gap:13px; }
      .l-track h2 { font-size:20px; }
      .l-track-time { display:none; }
      .l-play { width:48px; height:48px; }
    }
  </style>
</head>
<body>
  ${renderSiteHeader(siteUrl)}

  <main>
    <section class="l-hero">
      <div class="l-hero-inner">
        <div class="l-eyebrow">Listen</div>
        <h1>The Stewardship Blueprint, <em>read aloud</em></h1>
        <p class="l-lede">
          Short readings and reflections from the book as it takes shape. Listen straight
          through, or pick the chapter you need today.
        </p>
      </div>
    </section>

    <section class="l-tracks-section">
      <div class="l-wrap">
        ${tracks.length ? renderTrackList(tracks) : renderEmptyState(siteUrl)}
      </div>
    </section>
  </main>

  ${renderSiteFooter(siteUrl)}
  ${renderNavScript()}
  ${renderInstallScript()}

  ${tracks.length ? renderPlayerScript() : ""}
</body>
</html>`;

  return new NextResponse(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}

function renderTrackList(tracks: any[]) {
  const items = tracks
    .map((track, index) => {
      const duration = formatDuration(track.duration_seconds);
      return `
        <li class="l-track" data-track id="track-${escapeAttribute(track.id)}">
          <div class="l-track-head">
            <button class="l-play" type="button" data-play
              data-src="${escapeAttribute(track.file_url || "")}"
              aria-label="Play ${escapeAttribute(track.title)}">
              <svg class="icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
              <svg class="icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
            </button>
            <div class="l-track-meta">
              <div class="l-track-num">Track ${index + 1}</div>
              <h2>${escapeHtml(track.title)}</h2>
              ${track.description ? `<p>${escapeHtml(track.description)}</p>` : ""}
            </div>
            ${duration ? `<div class="l-track-time">${duration}</div>` : ""}
          </div>
          <div class="l-player">
            <span class="l-elapsed" data-elapsed>0:00</span>
            <input class="l-seek" type="range" min="0" max="100" value="0" step="0.1"
              data-seek aria-label="Seek within ${escapeAttribute(track.title)}" style="--pct:0%" />
            <span class="l-duration" data-duration>${duration || "0:00"}</span>
          </div>
        </li>`;
    })
    .join("");

  return `<p class="l-count">${tracks.length} track${tracks.length === 1 ? "" : "s"}</p>
      <ol class="l-tracks">${items}</ol>`;
}

function renderEmptyState(siteUrl: string) {
  return `<div class="l-empty">
        <div class="l-empty-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>
        </div>
        <h2>Recordings are on the way</h2>
        <p>
          The first readings from The Stewardship Blueprint are being recorded now. Join the
          journey and we&rsquo;ll let you know the moment they&rsquo;re here.
        </p>
        <a class="l-empty-cta" href="${siteUrl}/join-the-movement">Join the Journey</a>
      </div>`;
}

// One <audio> element reused by every track — that's what guarantees only one track
// can play at a time, and it keeps iOS happy: the element is created up front and
// every play() call happens inside the click handler, so Safari treats playback as
// user-initiated rather than blocking it as autoplay.
function renderPlayerScript() {
  return `<script>
    (function () {
      var audio = new Audio();
      audio.preload = 'none';
      var current = null; // the <li> whose track is loaded

      function fmt(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '0:00';
        var m = Math.floor(seconds / 60);
        var s = Math.floor(seconds % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
      }

      function partsOf(li) {
        return {
          button: li.querySelector('[data-play]'),
          seek: li.querySelector('[data-seek]'),
          elapsed: li.querySelector('[data-elapsed]'),
          duration: li.querySelector('[data-duration]')
        };
      }

      function titleOf(li) {
        var h = li.querySelector('h2');
        return h ? h.textContent : 'track';
      }

      // The button is a play/pause toggle, so its label has to track the state —
      // otherwise a screen reader announces "Pause" on a paused track.
      function label(li, action) {
        if (li) partsOf(li).button.setAttribute('aria-label', action + ' ' + titleOf(li));
      }

      function resetTrack(li) {
        if (!li) return;
        var p = partsOf(li);
        li.classList.remove('is-playing', 'is-current');
        p.seek.value = 0;
        p.seek.style.setProperty('--pct', '0%');
        p.elapsed.textContent = '0:00';
        label(li, 'Play');
      }

      document.querySelectorAll('[data-track]').forEach(function (li) {
        var p = partsOf(li);

        p.button.addEventListener('click', function () {
          var src = p.button.dataset.src;
          if (!src) return;

          if (current === li) {
            // Same track — toggle.
            if (audio.paused) { audio.play().catch(function () {}); }
            else { audio.pause(); }
            return;
          }

          // Different track — switching source stops the previous one, so only ever
          // one track plays.
          resetTrack(current);
          current = li;
          li.classList.add('is-current');
          audio.src = src;
          audio.currentTime = 0;
          audio.play().catch(function () {});
        });

        p.seek.addEventListener('input', function () {
          if (current !== li || !isFinite(audio.duration)) return;
          audio.currentTime = (parseFloat(p.seek.value) / 100) * audio.duration;
        });
      });

      audio.addEventListener('play', function () {
        if (!current) return;
        current.classList.add('is-playing');
        label(current, 'Pause');
      });

      audio.addEventListener('pause', function () {
        if (!current) return;
        current.classList.remove('is-playing');
        label(current, 'Play');
      });

      audio.addEventListener('loadedmetadata', function () {
        if (current && isFinite(audio.duration)) partsOf(current).duration.textContent = fmt(audio.duration);
      });

      audio.addEventListener('timeupdate', function () {
        if (!current || !isFinite(audio.duration) || audio.duration === 0) return;
        var p = partsOf(current);
        var pct = (audio.currentTime / audio.duration) * 100;
        p.seek.value = pct;
        p.seek.style.setProperty('--pct', pct + '%');
        p.elapsed.textContent = fmt(audio.currentTime);
      });

      audio.addEventListener('ended', function () { resetTrack(current); current = null; });
    })();
  </script>`;
}

function formatDuration(seconds: unknown) {
  const value = typeof seconds === "number" ? seconds : Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return "";
  const minutes = Math.floor(value / 60);
  const rest = Math.floor(value % 60);
  return `${minutes}:${rest < 10 ? "0" : ""}${rest}`;
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("\n", " ");
}
