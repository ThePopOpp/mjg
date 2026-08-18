import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { ChallengeVideoPlayer } from "@/components/six-week-challenge/video-player";
import { CHALLENGE_VIDEOS_BY_ORDER, getChallengeVideo } from "@/lib/six-week-challenge/videos";

export function generateStaticParams() {
  return CHALLENGE_VIDEOS_BY_ORDER.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = getChallengeVideo(slug);
  if (!v) return { title: "Video — The 6-Week Challenge" };
  return { title: `${v.badge}: ${v.title} — The 6-Week Challenge`, description: v.subtitle };
}

export default async function ChallengeVideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = getChallengeVideo(slug);
  if (!video) notFound();

  const idx = CHALLENGE_VIDEOS_BY_ORDER.findIndex((v) => v.slug === slug);
  const prev = idx > 0 ? CHALLENGE_VIDEOS_BY_ORDER[idx - 1] : null;
  const next = idx < CHALLENGE_VIDEOS_BY_ORDER.length - 1 ? CHALLENGE_VIDEOS_BY_ORDER[idx + 1] : null;

  return (
    <PilotShell
      heroVariant="centered"
      eyebrow={`The 6-Week Challenge · ${video.badge}`}
      title={video.title}
      description={video.subtitle}
      cta={{ href: "/6-week-challenge/videos", label: "All videos" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Branded player — YouTube-hosted but never looks like YouTube (facade + privacy embed). */}
        <ChallengeVideoPlayer
          youtubeId={video.youtubeId}
          videoUrl={video.videoUrl}
          thumbnailUrl={video.thumbnailUrl}
          title={video.title}
          badge={video.badge}
        />

        <p className="mt-6 text-[15px] leading-7 text-muted-foreground">{video.description}</p>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-black/10 pt-6 dark:border-white/10">
          {prev ? (
            <Link href={`/6-week-challenge/videos/${prev.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> {prev.badge}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={`/6-week-challenge/videos/${next.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground no-underline hover:text-primary">
              {next.badge} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : <span />}
        </div>
      </div>
    </PilotShell>
  );
}
