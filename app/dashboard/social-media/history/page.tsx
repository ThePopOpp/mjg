import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialHistory } from "@/components/social-media/social-history";
import { listPosts } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "History — Social Media — MJG" };

export default async function SocialHistoryPage() {
  const posts = await listPosts({ limit: 500 });
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="History" description="Every post — drafts, scheduled, published, and failed. Publish drafts on demand and review engagement." />
      <SocialTabs active="history" />
      <SocialHistory initialPosts={posts} />
    </div>
  );
}
