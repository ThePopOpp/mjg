import { SectionHeader } from "@/components/dashboard/section-header";
import { BusinessCardsClient } from "./business-cards-client";

export const metadata = { title: "Business Cards — MJG Dashboard" };

export default function BusinessCardsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace"
        title="Business Cards"
        description="Digital business cards with a public QR/NFC profile, lead capture, automations, and analytics."
      />
      <BusinessCardsClient />
    </div>
  );
}
