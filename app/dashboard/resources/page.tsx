import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ResourcesLibrary } from "@/components/facilitator/resources-library";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessPortal } from "@/lib/rbac/roles";
import { getPublishedNews, getPublishedMedia } from "@/lib/facilitator/content";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/resources");
  if (!canAccessPortal(profile.role)) redirect("/access-restricted");

  const [posts, audio, video, documents] = await Promise.all([
    getPublishedNews(),
    getPublishedMedia("audio"),
    getPublishedMedia("video"),
    getPublishedMedia("document"),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Resources" description="Blog posts, audio, video, and documents from Michael J. Gauthier." />
      <ResourcesLibrary posts={posts} audio={audio} video={video} documents={documents} />
    </div>
  );
}
