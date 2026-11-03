import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { DownloadsLibrary } from "@/components/facilitator/downloads-library";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessPortal } from "@/lib/rbac/roles";
import { getPublishedMedia } from "@/lib/facilitator/content";
import { listChallengeVideos } from "@/lib/six-week-challenge/repository";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/downloads");
  if (!canAccessPortal(profile.role)) redirect("/access-restricted");

  // Video Library = the 6-Week Challenge videos (challenge_videos, edited in Media Studio)
  // plus any published video assets.
  const [audio, ebooks, videos, challenge] = await Promise.all([
    getPublishedMedia("audio"),
    getPublishedMedia("document"),
    getPublishedMedia("video"),
    listChallengeVideos(),
  ]);
  const challengeVideos = challenge.map((v) => ({
    slug: v.slug,
    badge: v.badge,
    title: v.title,
    subtitle: v.subtitle,
    thumbnailUrl: v.thumbnailUrl,
    thumbnailDark: v.thumbnailDark ?? null,
    durationLabel: v.durationLabel,
    // Media Studio's availability chip wins; otherwise a video with a source is watchable.
    available: v.availability === "coming_soon" ? false : v.availability === "available" || Boolean(v.youtubeId || v.driveId || v.videoUrl),
  }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Downloads" description="Audiobooks, e-books, and videos for you and your team." />
      <DownloadsLibrary audio={audio} ebooks={ebooks} videos={videos} challengeVideos={challengeVideos} />
    </div>
  );
}
