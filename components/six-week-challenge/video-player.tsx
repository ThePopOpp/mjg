"use client";

import { useState } from "react";
import { Play } from "lucide-react";

const MIKE_PHOTO = "/media/mike-gauthier-profile-photo.png";

// A branded video player. Videos are hosted off-site (YouTube/Drive) to save VPS space,
// but the page never shows the host's chrome up front: we render our own poster + play
// button and only load the embed after a click (a "facade").
export function ChallengeVideoPlayer({
  youtubeId,
  driveId,
  videoUrl,
  posterEyebrow,
  posterTitle,
  thumbnailUrl,
  thumbnailDark,
  title,
  badge,
}: {
  youtubeId?: string | null;
  driveId?: string | null;
  videoUrl?: string | null;
  posterEyebrow?: string | null;
  posterTitle?: string | null;
  thumbnailUrl?: string | null;
  thumbnailDark?: string | null;
  title: string;
  badge: string;
}) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(youtubeId || driveId || videoUrl);
  const hasDesignedPoster = Boolean(posterTitle);
  // Per-theme poster images (used only when there's no code-rendered poster).
  const lightSrc = thumbnailUrl ?? thumbnailDark ?? null;
  const darkSrc = thumbnailDark ?? thumbnailUrl ?? null;
  const hasImagePoster = !hasDesignedPoster && Boolean(lightSrc || darkSrc);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-black/10 bg-[#0e1622] shadow-sm dark:border-white/10 dark:bg-[#efe9dd]">
      {playing && youtubeId ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : playing && driveId ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : playing && videoUrl ? (
        /* eslint-disable-next-line jsx-a11y/media-has-caption */
        <video className="absolute inset-0 h-full w-full bg-black" src={videoUrl} autoPlay controls />
      ) : hasDesignedPoster ? (
        <ChallengeVideoPoster
          eyebrow={posterEyebrow ?? ""}
          title={posterTitle ?? ""}
          hasVideo={hasVideo}
          onPlay={() => setPlaying(true)}
        />
      ) : (
        <ImagePoster
          lightSrc={lightSrc}
          darkSrc={darkSrc}
          hasImagePoster={hasImagePoster}
          hasVideo={hasVideo}
          onPlay={() => setPlaying(true)}
          title={title}
          badge={badge}
        />
      )}
    </div>
  );
}

// The MJG-branded poster, built from live elements so nothing overlaps and it adapts to
// the theme. Per the brand direction the poster INVERTS the page: a dark poster on the
// light site, a light poster on the dark site (for contrast). Base classes = dark poster;
// `dark:` classes = light poster. `preview` renders it non-interactive (for the library
// card, which is itself a link).
export function ChallengeVideoPoster({
  eyebrow, title, hasVideo, onPlay, preview = false,
}: { eyebrow: string; title: string; hasVideo?: boolean; onPlay?: () => void; preview?: boolean }) {
  const interactive = Boolean(hasVideo && onPlay && !preview);
  const Tag = interactive ? "button" : "div";
  return (
    <Tag
      {...(interactive ? { type: "button" as const, onClick: onPlay, "aria-label": `Play ${title}` } : {})}
      className="group absolute inset-0 block w-full text-left"
    >
      {/* Giant faint MJG watermark on the right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mjg-logos/mjg_white.png" alt="" aria-hidden className="pointer-events-none absolute -right-10 top-1/2 h-[150%] w-auto -translate-y-1/2 opacity-[0.05] dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/mjg-logos/mjg_black_white.png" alt="" aria-hidden className="pointer-events-none absolute -right-10 top-1/2 hidden h-[150%] w-auto -translate-y-1/2 opacity-[0.06] dark:block" />

      {/* Mike, clipped bottom-left */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MIKE_PHOTO} alt="Michael J. Gauthier" className="absolute bottom-0 left-0 h-[96%] w-auto object-contain object-left-bottom" />
      {/* Fade the photo's right edge into the poster background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0e1622]/50 to-[#0e1622] dark:via-[#efe9dd]/50 dark:to-[#efe9dd]" />

      {/* Content, shifted right to clear the photo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 px-4 pl-[36%] text-center sm:gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mjg-logos/mjg_white.png" alt="Michael J. Gauthier" className="h-6 w-auto sm:h-8 dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" className="hidden h-6 w-auto sm:h-8 dark:block" />
        <p className="-mt-1 text-[9px] tracking-[0.18em] text-white/60 dark:text-[#191815]/50 sm:text-[10px]">michaeljgauthier.com</p>

        {eyebrow ? (
          <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#C9A46E] sm:text-[11px]">{eyebrow}</p>
        ) : null}
        <h3 className="max-w-[15rem] font-serif text-lg font-semibold leading-tight text-white dark:text-[#191815] sm:max-w-sm sm:text-2xl">
          {title}
        </h3>

        <span
          className={`mt-1 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C9A46E] text-[#C9A46E] transition-transform sm:h-14 sm:w-14 ${interactive ? "group-hover:scale-105 group-hover:bg-[#C9A46E] group-hover:text-[#191815]" : ""}`}
        >
          <Play className="ml-0.5 h-5 w-5 fill-current sm:h-6 sm:w-6" />
        </span>
        {!hasVideo && !preview ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 dark:text-[#191815]/60">Coming soon</p>
        ) : null}
      </div>
    </Tag>
  );
}

// Fallback poster from a supplied image (theme-swapped), or the plain branded panel.
function ImagePoster({
  lightSrc, darkSrc, hasImagePoster, hasVideo, onPlay, title, badge,
}: {
  lightSrc: string | null; darkSrc: string | null; hasImagePoster: boolean;
  hasVideo: boolean; onPlay: () => void; title: string; badge: string;
}) {
  const Tag = hasVideo ? "button" : "div";
  return (
    <Tag
      {...(hasVideo ? { type: "button" as const, onClick: onPlay, "aria-label": `Play ${title}` } : {})}
      className="group absolute inset-0 block w-full"
    >
      {hasImagePoster ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightSrc ?? undefined} alt="" className="absolute inset-0 h-full w-full object-cover dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={darkSrc ?? undefined} alt="" aria-hidden className="absolute inset-0 hidden h-full w-full object-cover dark:block" />
          <div className="absolute inset-0 bg-black/10" />
          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#C9A46E] text-[#191815] shadow-lg ring-4 ring-white/40 transition-transform group-hover:scale-105">
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
          {!hasVideo ? (
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">Coming soon</span>
          ) : null}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#f3efe6] to-[#e4ddcd] text-center text-[#5c564d] dark:from-[#211f1b] dark:to-[#14130f] dark:text-[#b8b1a5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" className="h-9 w-auto opacity-90 dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_white.png" alt="" aria-hidden className="hidden h-9 w-auto opacity-90 dark:block" />
          <span className={`mt-1 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#C9A46E] text-[#C9A46E] ${hasVideo ? "transition-transform group-hover:scale-105" : ""}`}>
            <Play className="ml-0.5 h-6 w-6 fill-current" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">{hasVideo ? `Watch ${badge}` : "Video coming soon"}</p>
        </div>
      )}
    </Tag>
  );
}
