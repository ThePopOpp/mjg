import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InnerCircleForm } from "@/components/pilot/inner-circle-form";
import { PilotShell } from "@/components/pilot/pilot-shell";

export default function InnerCirclePage() {
  return (
    <PilotShell
      eyebrow="Private invitation"
      title="Help Me Continue Building The Stewardship Blueprint"
      description="Thank you for walking through the Created for More 7-Day Stewardship Pilot. I am inviting a smaller group of people to continue helping me shape the book, tools, studies, Bible plans, videos, workshops, and future resources."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>What the Inner Circle may receive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
            <p>Behind-the-scenes updates.</p>
            <p>Early access to selected chapters and tools.</p>
            <p>Invitations to review Bible plans, small-group studies, and workbook ideas.</p>
            <p>Occasional private updates from Michael.</p>
            <p>Possible invitations to share stories or be interviewed.</p>
          </CardContent>
        </Card>
        <InnerCircleForm />
      </div>
    </PilotShell>
  );
}
