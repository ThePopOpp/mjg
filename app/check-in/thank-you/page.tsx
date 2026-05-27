import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PilotShell, VideoPlaceholder } from "@/components/pilot/pilot-shell";

export default async function CheckInThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ score?: string; lowest?: string; category?: string }>;
}) {
  const params = await searchParams;

  return (
    <PilotShell
      eyebrow="Thank you"
      title="Thank You for Completing the Created for More Check-In"
      description="Your score is not a judgment. It is a starting point."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>What happens next</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 leading-7 text-muted-foreground">
            <p>The goal is not to fix everything today. The goal is to begin noticing where alignment is strong, where drift may be showing up, and what needs your attention next.</p>
            <p>Over the next 7 days, you will receive one short email each day. Each reflection is designed to help you slow down, think honestly, and choose one faithful next step.</p>
            <p>Your first email will arrive shortly once the Wave 0 email process is triggered.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>Total score: <span className="font-semibold">{params.score ?? "Saved with your submission"}</span></p>
            <p>Lowest area: <span className="font-semibold">{params.lowest ?? "Saved with your submission"}</span></p>
            <p>Score range: <span className="font-semibold">{params.category ?? "Saved with your submission"}</span></p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6">
        <VideoPlaceholder />
      </div>
    </PilotShell>
  );
}
