import { Play, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LibraryVideo } from "@/lib/facilitator/content";

// The 6-Week Challenge videos as library cards (grid) or rows (list). Each opens the video's
// watch page in a new tab so the dashboard stays open.

function Thumb({ v, className }: { v: LibraryVideo; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {v.thumbnailUrl ? (
        <>
          <img src={v.thumbnailUrl} alt="" className={cn("h-full w-full object-cover", v.thumbnailDark && "dark:hidden")} loading="lazy" />
          {v.thumbnailDark ? <img src={v.thumbnailDark} alt="" className="hidden h-full w-full object-cover dark:block" loading="lazy" /> : null}
        </>
      ) : (
        <div className="flex h-full items-center justify-center"><Video className="h-6 w-6 text-muted-foreground" /></div>
      )}
    </div>
  );
}

export function ChallengeVideoGrid({ videos, layout = "grid" }: { videos: LibraryVideo[]; layout?: "grid" | "list" }) {
  if (layout === "list") {
    return (
      <div className="space-y-2">
        {videos.map((v) => (
          <a
            key={v.slug}
            href={`/6-week-challenge/videos/${v.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm transition hover:border-[#b88a4a]/60"
          >
            <Thumb v={v} className="aspect-video w-32 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-muted-foreground">{v.badge}</p>
              <p className="font-medium">{v.title}</p>
              {v.subtitle ? <p className="truncate text-sm text-muted-foreground">{v.subtitle}</p> : null}
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary group-hover:underline">
              <Play className="h-4 w-4" /> {v.available ? "Watch" : "Coming soon"}
            </span>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {videos.map((v) => (
        <a
          key={v.slug}
          href={`/6-week-challenge/videos/${v.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-[#b88a4a]/60 hover:shadow"
        >
          <div className="relative">
            <Thumb v={v} className="aspect-video" />
            <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-0.5 text-xs font-semibold text-white">{v.badge}</span>
            {v.durationLabel ? <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{v.durationLabel}</span> : null}
          </div>
          <div className="space-y-1 p-4">
            <p className="font-medium">{v.title}</p>
            {v.subtitle ? <p className="text-sm text-muted-foreground">{v.subtitle}</p> : null}
            <p className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-primary group-hover:underline">
              <Play className="h-4 w-4" /> {v.available ? "Watch" : "Coming soon"}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
