import { SectionHeader } from "@/components/dashboard/section-header";
import { ImpactScoreForm } from "@/components/impact-score/impact-score-form";
import { createAdminActionToken } from "@/lib/auth/action-token";
import { getCurrentProfile } from "@/lib/auth/server";
import { getImpactScore } from "@/lib/content/impact-score";

export default async function ImpactScorePage() {
  const [score, profile] = await Promise.all([getImpactScore(), getCurrentProfile()]);
  const actionToken = profile ? createAdminActionToken(profile) : "";

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Impact Score"
        description="Update the live impact score displayed on the public Mission page. Changes take effect immediately when published."
      />
      <ImpactScoreForm score={score} actionToken={actionToken} />
    </div>
  );
}
