import type { Metadata } from "next";
import { PilotShell } from "@/components/pilot/pilot-shell";
import { EnergyAuditFlow } from "@/components/energy-audit/energy-audit-flow";
import { getCurrentProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Energy Audit Check-In | A Stewardship Blueprint Assessment",
  description:
    "See where your tank is full, where it's leaking, and what renewal you need next. A 10–15 minute self-assessment of your physical, emotional, mental, and spiritual energy.",
};

export default async function EnergyAuditPage() {
  // Signed-in users get their audit saved to their MJG account; anonymous visitors can still
  // take it and optionally leave an email for their results.
  const profile = await getCurrentProfile().catch(() => null);
  const signedIn = Boolean(profile && profile.id !== "local-preview" && profile.email);

  return (
    <PilotShell
      heroVariant="centered"
      eyebrow="A Stewardship Blueprint Assessment"
      title="The Energy Audit Check-In"
      description="See where your tank is full, where it's leaking, and what renewal you need next."
    >
      <EnergyAuditFlow
        signedIn={signedIn}
        firstName={signedIn ? profile!.firstName : null}
        dashboardHref={signedIn ? "/dashboard" : null}
      />
    </PilotShell>
  );
}
