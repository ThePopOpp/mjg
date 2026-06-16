import { SectionHeader } from "@/components/dashboard/section-header";
import { MediaStudioDashboard } from "@/components/media-studio/media-studio-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminActionToken } from "@/lib/auth/action-token";
import { getCurrentProfile } from "@/lib/auth/server";
import { getMediaStudioData } from "@/lib/content/media";

export const dynamic = "force-dynamic";

export default async function MediaStudioPage() {
  const [data, profile] = await Promise.all([getMediaStudioData(), getCurrentProfile()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Media Studio"
        description="Manage audio, video, photos, galleries, public embeds, and future dashboard publishing targets."
      />
      <MediaStudioDashboard actionToken={profile ? createAdminActionToken(profile) : ""} assets={data.assets as any[]} />
      {data.error ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{data.error}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
