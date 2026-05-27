import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PilotShell, VideoPlaceholder } from "@/components/pilot/pilot-shell";

export default function SurveyThankYouPage() {
  return (
    <PilotShell
      eyebrow="Feedback received"
      title="Thank you for helping shape this."
      description="Your feedback helps strengthen The Life You're Building, The Stewardship Blueprint, and future resources for people, families, churches, and small groups."
    >
      <div className="space-y-6">
        <VideoPlaceholder />
        <Button asChild>
          <Link href="/stewardship-blueprint-inner-circle">View Inner Circle invitation</Link>
        </Button>
      </div>
    </PilotShell>
  );
}
