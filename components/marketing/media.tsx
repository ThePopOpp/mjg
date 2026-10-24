// Images on the marketing pages.
//
// Every image slot comes from content as a MediaValue. When it has a real `src`
// it renders through next/image (responsive sizes, AVIF/WebP). When it has only
// a `mock`, it renders a designed stand-in — a book cover, a study guide, a page
// of the Blueprint — so pages look finished before the approved artwork exists,
// and swapping in the real file later is a content edit.

import Image from "next/image";
import type { MediaValue } from "@/lib/marketing/content/kit";
import { cn } from "@/lib/utils";
import { keepTogether } from "./primitives";

const RATIO = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/10": "aspect-[16/10]",
  "3/4": "aspect-[3/4]",
  "2/3": "aspect-[2/3]",
  "4/5": "aspect-[4/5]",
  "1/1": "aspect-square",
  letter: "aspect-[8.5/11]",
} as const;

export type Ratio = keyof typeof RATIO;

/** next/image handles our own files and Supabase storage; anything else is shown as-is. */
function optimizable(src: string) {
  return src.startsWith("/") || /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i.test(src);
}

export function MediaFrame({
  media,
  ratio = "16/9",
  sizes = "(min-width: 1024px) 560px, 100vw",
  className,
  imageClassName,
  priority,
  rounded = "rounded-xl",
  fit,
}: {
  media: MediaValue;
  ratio?: Ratio;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  rounded?: string;
  fit?: "cover" | "contain";
}) {
  if (!media.src && media.mock) {
    return <MockArt mock={media.mock} ratio={ratio} className={cn(rounded, className)} />;
  }
  if (!media.src) return null;
  // The content decides for cut-outs; otherwise the caller's choice; otherwise fill.
  const objectFit = media.fit ?? fit ?? "cover";
  const objectPosition = media.position === "top" ? "object-top" : media.position === "bottom" ? "object-bottom" : undefined;

  return (
    <figure className={cn("relative overflow-hidden bg-muted", RATIO[ratio], rounded, className)}>
      {optimizable(media.src) ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(objectFit === "cover" ? "object-cover" : "object-contain", objectPosition, imageClassName)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src}
          alt={media.alt}
          loading={priority ? "eager" : "lazy"}
          className={cn("absolute inset-0 h-full w-full", objectFit === "cover" ? "object-cover" : "object-contain", objectPosition, imageClassName)}
        />
      )}
      {media.credit ? (
        <figcaption className="pointer-events-none absolute bottom-1.5 right-2 rounded bg-black/35 px-1.5 py-0.5 text-[9.5px] text-white/80">
          {media.credit}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * The designed stand-ins. Deliberately typographic rather than fake photography:
 * they read as "a book", "a guide", "a page" without pretending to be the final art.
 */
export function MockArt({
  mock,
  ratio,
  className,
}: {
  mock: NonNullable<MediaValue["mock"]>;
  ratio: Ratio;
  className?: string;
}) {
  const label = mock.subtitle ? `${mock.title} — ${mock.subtitle}` : mock.title;

  if (mock.variant === "book") {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,#1f1c19_0%,#141211_55%,#0e0d0c_100%)] p-[9%] text-[#f4f1ea] shadow-[-10px_24px_60px_rgba(20,18,17,0.35)]",
          RATIO[ratio],
          className,
        )}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-[5%] bg-black/30" />
        <span aria-hidden className="absolute inset-[5%] rounded-[2px] border border-gold-light/25" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/steward/anim/s-steps-gold.svg" alt="" aria-hidden className="relative mx-auto mt-[6%] w-[22%] opacity-90" />
        <div className="relative text-center">
          <p className="font-display text-[clamp(1rem,2.4vw,1.6rem)] font-semibold leading-tight">{keepTogether(mock.title)}</p>
          {mock.subtitle ? (
            <p className="mt-[6%] text-[clamp(0.55rem,0.9vw,0.75rem)] font-semibold uppercase tracking-[0.2em] text-gold-light">
              {mock.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (mock.variant === "guide") {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "relative flex flex-col justify-end overflow-hidden border bg-[linear-gradient(180deg,#fbfaf7_0%,#f1ebdf_100%)] p-[9%] text-[#1c1917] shadow-[0_18px_40px_rgba(20,18,17,0.18)]",
          RATIO[ratio],
          className,
        )}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-[38%] bg-[#141211]" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/steward/anim/s-steps-gold.svg" alt="" aria-hidden className="absolute left-[9%] top-[9%] w-[18%]" />
        <p className="text-[clamp(0.5rem,0.8vw,0.7rem)] font-bold uppercase tracking-[0.18em] text-gold-deep">{keepTogether(mock.subtitle)}</p>
        <p className="mt-1.5 font-display text-[clamp(0.9rem,1.6vw,1.2rem)] font-semibold leading-tight">{keepTogether(mock.title)}</p>
        <p className="mt-2 text-[clamp(0.5rem,0.7vw,0.65rem)] text-[#6d6660]">Six-Week Experience</p>
      </div>
    );
  }

  if (mock.variant === "blueprint-page") {
    return (
      <div
        role="img"
        aria-label={label}
        className={cn(
          "relative overflow-hidden border bg-white p-[8%] text-[#1c1917] shadow-[0_18px_40px_rgba(20,18,17,0.14)]",
          RATIO[ratio],
          className,
        )}
      >
        <p className="text-[clamp(0.45rem,0.7vw,0.62rem)] font-bold uppercase tracking-[0.18em] text-gold-deep">
          {mock.subtitle ?? "Personal Stewardship Blueprint"}
        </p>
        <p className="mt-1 font-display text-[clamp(0.85rem,1.5vw,1.15rem)] font-semibold leading-tight">{keepTogether(mock.title)}</p>
        <span aria-hidden className="mt-[6%] block h-px w-full bg-gold/40" />
        <div aria-hidden className="mt-[7%] space-y-[5%]">
          {[92, 78, 86, 64, 90, 72, 58].map((w, i) => (
            <span key={i} className="block h-[3px] rounded-full bg-[#e8e2d6]" style={{ width: `${w}%` }} />
          ))}
        </div>
        <span aria-hidden className="absolute bottom-[8%] right-[8%] h-[14%] w-[22%] rounded-sm border border-gold/40 bg-gold/10" />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#2a2622,#141211_70%)] p-6 text-center text-[#f4f1ea]",
        RATIO[ratio],
        className,
      )}
    >
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/steward/anim/s-steps-gold.svg" alt="" aria-hidden className="mx-auto w-10 opacity-80" />
        <p className="mt-3 font-display text-lg">{keepTogether(mock.title)}</p>
        {mock.subtitle ? <p className="mt-1 text-xs text-band-text">{keepTogether(mock.subtitle)}</p> : null}
      </div>
    </div>
  );
}
