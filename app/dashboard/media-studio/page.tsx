import { SectionHeader } from "@/components/dashboard/section-header";
import { MediaStudioDashboard } from "@/components/media-studio/media-studio-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { getMediaStudioData } from "@/lib/content/media";

export default async function MediaStudioPage() {
  const data = await getMediaStudioData();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Media Studio"
        description="Manage audio, video, photos, galleries, public embeds, and future dashboard publishing targets."
      />
      <MediaStudioDashboard assets={data.assets as any[]} />
      {data.error ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{data.error}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
