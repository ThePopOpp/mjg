import type { Metadata } from "next";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { CHALLENGE_VIDEOS_BY_ORDER } from "@/lib/six-week-challenge/videos";

export const metadata: Metadata = {
  title: "Video Library — The 6-Week Challenge",
  description: "Every teaching video for The Life You're Building 6-Week Challenge, in order.",
};

export default function ChallengeVideoLibraryPage() {
  return (
    <PilotShell
      eyebrow="The Life You're Building"
      title="The Video Library"
      description="Every teaching video for the 6-Week Challenge, in order — from the invitation through the closing word. Watch each week's video before your session."
      cta={{ href: "/6-week-challenge", label: "Back to the challenge" }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {CHALLENGE_VIDEOS_BY_ORDER.map((v) => (
          <Link
            key={v.slug}
            href={`/6-week-challenge/videos/${v.slug}`}
            className="group overflow-hidden rounded-xl border border-black/10 bg-card no-underline transition-colors hover:border-primary/50 dark:border-white/10"
          >
            <div className="relative flex aspect-video items-center justify-center bg-muted">
              {v.thumbnailUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={v.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <PlayCircle className="h-10 w-10 text-primary/70" />
                  <span className="text-xs uppercase tracking-widest">{v.videoUrl ? "Watch" : "Coming soon"}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">{v.badge}{v.durationLabel ? ` · ${v.durationLabel}` : ""}</p>
              <h3 className="mt-1 font-serif text-lg font-semibold text-foreground group-hover:text-primary">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </PilotShell>
  );
}
