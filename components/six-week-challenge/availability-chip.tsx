import { cn } from "@/lib/utils";

type VideoLike = {
  availability?: string | null;
  youtubeId?: string | null;
  driveId?: string | null;
  videoUrl?: string | null;
};

/** Resolve the availability state: explicit value if set, otherwise derive from whether a
 *  video source exists (Available if it does, Coming Soon if not). */
export function videoAvailability(v: VideoLike): "available" | "coming_soon" | "none" {
  if (v.availability === "available" || v.availability === "coming_soon" || v.availability === "none") {
    return v.availability;
  }
  return v.youtubeId || v.driveId || v.videoUrl ? "available" : "coming_soon";
}

/** The "Available" / "Coming Soon" chip. Returns null when set to 'none'. Dark gold pill for
 *  Available, soft cream pill for Coming Soon — theme-aware. */
export function AvailabilityChip({ video, className }: { video: VideoLike; className?: string }) {
  const state = videoAvailability(video);
  if (state === "none") return null;
  const available = state === "available";
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold",
        available
          ? "bg-[#1c1b19] text-[#c9a46e] dark:bg-[#c9a46e] dark:text-[#191815]"
          : "bg-[#efe7d8] text-[#8a7a5c] dark:bg-white/10 dark:text-white/70",
        className,
      )}
    >
      {available ? "Available" : "Coming Soon"}
    </span>
  );
}
