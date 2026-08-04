import type { Metadata } from "next";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { CreatedForMoreAssessment } from "@/components/check-in/created-for-more-assessment";

export const metadata: Metadata = {
  title: "Created for More Check-In | The Stewardship Blueprint",
  description: "A Stewardship Blueprint assessment. See where you are aligned, where you are drifting, and what needs attention next.",
};

export default function CreatedForMoreCheckInPage() {
  return (
    <PilotShell
      eyebrow="The Stewardship Blueprint"
      title="Created for More Check-In"
      description="See where you are aligned, where you are drifting, and what needs attention next. This is not a pass/fail test — it is a mirror and a map that helps you pause, tell the truth about the life you are building, and identify one faithful next step."
    >
      <CreatedForMoreAssessment />
    </PilotShell>
  );
}
