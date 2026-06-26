import { SectionHeader } from "@/components/dashboard/section-header";
import { SocialTabs } from "@/components/social-media/social-tabs";
import { SocialInbox } from "@/components/social-media/social-inbox";
import { listMessages } from "@/lib/social-media/data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox — Social Media — MJG" };

export default async function SocialInboxPage() {
  const messages = await listMessages({ limit: 500 });
  return (
    <div className="space-y-6">
      <SectionHeader eyebrow="Social Media" title="Inbox" description="Messages, comments, reviews, and mentions across your platforms — reply, mark read, and archive." />
      <SocialTabs active="inbox" />
      <SocialInbox initialMessages={messages} />
    </div>
  );
}
