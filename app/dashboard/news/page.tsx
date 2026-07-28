import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { NewsFeed } from "@/components/facilitator/news-feed";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessDashboard } from "@/lib/rbac/roles";
import { getPublishedNews, getPublishedMedia } from "@/lib/facilitator/content";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/news");
  if (!canAccessDashboard(profile.role)) redirect("/access-restricted");

  const [posts, audio] = await Promise.all([getPublishedNews(), getPublishedMedia("audio")]);

  return (
    <div className="space-y-6">
      <SectionHeader title="In The News" description="Latest posts and audio from Michael J. Gauthier." />
      <NewsFeed posts={posts} audio={audio} />
    </div>
  );
}
