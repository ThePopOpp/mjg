"use client";

import { useState } from "react";
import { Play } from "lucide-react";

// A branded video player. Videos live (unlisted) on YouTube to save VPS space, but we
// never show YouTube's chrome up front: the page shows our own poster + play button and
// only loads the privacy-mode embed after a click (a "facade"). `rel=0` keeps any
// end-screen suggestions to this channel only, and youtube-nocookie avoids tracking cookies.
export function ChallengeVideoPlayer({
  youtubeId,
  videoUrl,
  thumbnailUrl,
  thumbnailDark,
  title,
  badge,
}: {
  youtubeId?: string | null;
  videoUrl?: string | null;
  thumbnailUrl?: string | null;
  thumbnailDark?: string | null;
  title: string;
  badge: string;
}) {
  const [playing, setPlaying] = useState(false);
  const hasVideo = Boolean(youtubeId || videoUrl);
  // Per-theme posters. If only one is supplied, it's used in both themes.
  const lightSrc = thumbnailUrl ?? thumbnailDark ?? null;
  const darkSrc = thumbnailDark ?? thumbnailUrl ?? null;
  const hasPoster = Boolean(lightSrc || darkSrc);

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border border-black/10 bg-[#ece7dd] shadow-sm dark:border-white/10 dark:bg-[#1b1a17]">
      {playing && youtubeId ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : playing && videoUrl ? (
        /* eslint-disable-next-line jsx-a11y/media-has-caption */
        <video className="absolute inset-0 h-full w-full bg-black" src={videoUrl} poster={thumbnailUrl ?? undefined} autoPlay controls />
      ) : (
        <>
          {/* Poster: custom thumbnail (theme-swapped) if provided, otherwise a branded panel. */}
          {hasPoster ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightSrc ?? undefined} alt="" className="absolute inset-0 h-full w-full object-cover dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={darkSrc ?? undefined} alt="" aria-hidden className="absolute inset-0 hidden h-full w-full object-cover dark:block" />
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-[#f3efe6] to-[#e4ddcd] text-center dark:from-[#211f1b] dark:to-[#14130f]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" className="h-9 w-auto opacity-90 dark:hidden" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mjg-logos/mjg_white.png" alt="" aria-hidden className="hidden h-9 w-auto opacity-90 dark:block" />
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7a736a]">The Life You&rsquo;re Building</p>
            </div>
          )}

          {/* Dark scrim so the play button reads on any poster */}
          <div className="absolute inset-0 bg-black/10" />

          {hasVideo ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-3"
              aria-label={`Play ${title}`}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C9A46E] text-[#191815] shadow-lg ring-4 ring-white/40 transition-transform group-hover:scale-105">
                <Play className="ml-0.5 h-7 w-7 fill-current" />
              </span>
              <span className="rounded-full bg-black/45 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white">Watch {badge}</span>
            </button>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-[#5c564d] dark:text-[#b8b1a5]">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-current/40 text-[#C9A46E]">
                <Play className="ml-0.5 h-7 w-7" />
              </span>
              <p className="text-sm font-semibold uppercase tracking-[0.18em]">Video coming soon</p>
              <p className="max-w-sm px-6 text-sm">This week&rsquo;s teaching video is being finished and will appear here shortly. In the meantime, work through your Participant Guide for {badge}.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
