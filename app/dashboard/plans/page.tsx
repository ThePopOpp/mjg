import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { PlansIndexClient } from "@/components/plans/plans-index-client";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessDashboard } from "@/lib/rbac/roles";
import { listPeople, listPlansForActor, listTemplatesForActor } from "@/lib/plans/data";
import { FLAGS, isFeatureEnabled } from "@/lib/flags";
import type { PlanActor } from "@/lib/plans/auth";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/plans");
  // The dashboard layout already gates access; this is the module's own backstop.
  if (!canAccessDashboard(profile.role)) redirect("/access-restricted");

  const actor: PlanActor = { id: profile.id, role: profile.role, email: profile.email };

  const [plans, templates, people, premiumAllowed] = await Promise.all([
    listPlansForActor(actor),
    listTemplatesForActor(actor),
    listPeople(),
    isFeatureEnabled(FLAGS.PLAN_BUILDER_PREMIUM, actor),
  ]);

  const owner = {
    id: profile.id,
    name: [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() || profile.email,
    email: profile.email,
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Plans"
        description="Plan Builder — organise work into tasks and groups, assign your team, and track it on a board or in a grid."
      />
      <PlansIndexClient plans={plans} templates={templates} people={people} owner={owner} premiumAllowed={premiumAllowed} />
    </div>
  );
}
