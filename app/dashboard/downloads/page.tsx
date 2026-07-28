import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { DownloadsLibrary } from "@/components/facilitator/downloads-library";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessDashboard } from "@/lib/rbac/roles";
import { getPublishedMedia } from "@/lib/facilitator/content";

export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/downloads");
  if (!canAccessDashboard(profile.role)) redirect("/access-restricted");

  const [audio, ebooks, videos] = await Promise.all([
    getPublishedMedia("audio"),
    getPublishedMedia("document"),
    getPublishedMedia("video"),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Downloads" description="Audiobooks, e-books, and videos for you and your team." />
      <DownloadsLibrary audio={audio} ebooks={ebooks} videos={videos} />
    </div>
  );
}
