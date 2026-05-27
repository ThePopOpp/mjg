import { Suspense } from "react";
import { CheckInForm } from "@/components/pilot/check-in-form";
import { PilotShell } from "@/components/pilot/pilot-shell";

export default function CheckInPage() {
  return (
    <PilotShell
      eyebrow="Created for More Check-In"
      title="Pause long enough to notice what kind of life you are building."
      description="This short assessment reflects on Purpose, Family, Fitness/Energy, Fun/Joy, and Finances/Stewardship. Your score is not a judgment. It is a starting point."
    >
      <Suspense fallback={<p>Loading Check-In...</p>}>
        <CheckInForm />
      </Suspense>
    </PilotShell>
  );
}
