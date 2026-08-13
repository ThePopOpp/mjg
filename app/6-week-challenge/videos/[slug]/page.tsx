import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, PlayCircle } from "lucide-react";
import { PilotShell } from "@/components/pilot/pilot-shell";
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
      eyebrow={`The 6-Week Challenge · ${video.badge}`}
      title={video.title}
      description={video.subtitle}
      cta={{ href: "/6-week-challenge/videos", label: "All videos" }}
    >
      <div className="mx-auto max-w-3xl">
        {/* Player (or branded placeholder until the recording is added) */}
        <div className="overflow-hidden rounded-xl border border-black/10 bg-black dark:border-white/10">
          <div className="relative aspect-video">
            {video.videoUrl ? (
              video.videoUrl.includes("youtube") || video.videoUrl.includes("vimeo") ? (
                <iframe src={video.videoUrl} title={video.title} className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              ) : (
                /* eslint-disable-next-line jsx-a11y/media-has-caption */
                <video src={video.videoUrl} poster={video.thumbnailUrl ?? undefined} controls className="absolute inset-0 h-full w-full bg-black" />
              )
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted text-center text-muted-foreground">
                <PlayCircle className="h-12 w-12 text-primary/70" />
                <p className="text-sm font-semibold uppercase tracking-widest">Video coming soon</p>
                <p className="max-w-sm px-6 text-sm">This week&rsquo;s teaching video is being finished and will appear here shortly. In the meantime, work through your Participant Guide for {video.badge}.</p>
              </div>
            )}
          </div>
        </div>

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
