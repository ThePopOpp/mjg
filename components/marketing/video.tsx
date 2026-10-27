"use client";

import { useCallback, useEffect, useState } from "react";
import { Play } from "lucide-react";
import type { MediaValue, VideoFileValue } from "@/lib/marketing/content/kit";
import { cn } from "@/lib/utils";
import { MediaFrame } from "./media";

/**
 * A silent looping video (the Steward demo in the home hero).
 *
 * The poster paints first and is what the page is measured on; the video fades
 * in over it once it can play. Phones get the 9:16 cut, everything else 16:9.
 * Visitors who prefer reduced motion see only the poster.
 */
export function LoopingVideo({ video, label, className }: { video: VideoFileValue; label: string; className?: string }) {
  const [mobile, setMobile] = useState<boolean | null>(null);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setMobile(mq.matches);
      setReduced(motion.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    motion.addEventListener("change", sync);
    return () => {
      mq.removeEventListener("change", sync);
      motion.removeEventListener("change", sync);
    };
  }, []);

  // React sets `muted` as a property but never writes the attribute, and some
  // browsers (iOS Safari especially) judge autoplay by the attribute — so a
  // silent loop could sit on its poster. Set both, then ask it to play.
  const startMuted = useCallback((el: HTMLVideoElement | null) => {
    if (!el) return;
    el.muted = true;
    el.setAttribute("muted", "");
    el.play().catch(() => {});
  }, []);

  const src = mobile && video.mobileSrc ? video.mobileSrc : video.src;
  const poster = video.poster ?? "";
  const mobilePoster = video.mobilePoster ?? poster;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-gold-light/25 bg-band shadow-[0_30px_90px_rgba(0,0,0,0.35)]",
        // 9:16 on phones, capped so the next section still peeks above the fold.
        "aspect-[9/16] max-h-[78vh] md:aspect-video md:max-h-none",
        className,
      )}
    >
      {poster ? (
        <picture>
          {mobilePoster !== poster ? <source media="(max-width: 767px)" srcSet={mobilePoster} /> : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" aria-hidden fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        </picture>
      ) : null}
      {mobile !== null && !reduced && src ? (
        <video
          key={src}
          ref={startMuted}
          src={src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={label}
          onCanPlay={() => setReady(true)}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
        />
      ) : null}
      <span className="sr-only">{label}</span>
    </div>
  );
}

function withAutoplay(url: string) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    }
    if (u.hostname.includes("vimeo.com")) {
      // Accepts the player URL (player.vimeo.com/video/ID?h=HASH) and the share
      // link of an unlisted video (vimeo.com/ID/HASH?share=copy…).
      const parts = u.pathname.split("/").filter(Boolean).filter((p) => p !== "video");
      const id = parts.find((p) => /^\d+$/.test(p));
      const h = u.searchParams.get("h") ?? parts[parts.indexOf(id ?? "") + 1] ?? null;
      return `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1${h ? `&h=${h}` : ""}`;
    }
  } catch {
    /* fall through */
  }
  return url;
}

/**
 * A film that plays only when asked: poster + play button, swapped for the
 * player on click. No sound ever starts on its own, and no third-party player
 * loads until the visitor chooses it.
 */
export function ClickToPlay({
  embed,
  poster,
  label,
  ratio = "4/3",
  className,
}: {
  embed: string;
  poster: MediaValue;
  label: string;
  ratio?: "4/3" | "16/9";
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const aspect = ratio === "4/3" ? "aspect-[4/3]" : "aspect-video";

  if (playing && embed) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl bg-band", aspect, className)}>
        <iframe
          src={withAutoplay(embed)}
          title={label}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-band", aspect, className)}>
      <MediaFrame media={poster} ratio={ratio} rounded="rounded-none" className="absolute inset-0 h-full w-full" sizes="(min-width: 1024px) 560px, 100vw" />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
      {embed ? (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={label}
          className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none"
        >
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-gold-light/60">
            <Play className="ml-1 h-7 w-7 fill-current" aria-hidden />
          </span>
        </button>
      ) : null}
    </div>
  );
}
