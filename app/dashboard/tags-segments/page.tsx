import { SectionHeader } from "@/components/dashboard/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function TagsSegmentsPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Tags & Segments" description="View tag counts, filter participants, and build CRM-style stewardship segments." />
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.tags.map((tag: any) => (
            <div key={tag.id} className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm font-medium">{tag.name}</span>
              <Badge variant="secondary">{tag.participant_tags?.length ?? 0}</Badge>
            </div>
          ))}
          {!data.tags.length ? <p className="text-sm text-muted-foreground">No tags found yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
