import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanWorkspace } from "@/components/plans/plan-workspace";
import { getCurrentProfile } from "@/lib/auth/server";
import { canAccessDashboard } from "@/lib/rbac/roles";
import { loadPlanWorkspace } from "@/lib/plans/data";
import type { PlanActor } from "@/lib/plans/auth";
import type { PlanView } from "@/lib/plans/types";

export const dynamic = "force-dynamic";

export default async function PlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ planId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { planId } = await params;
  const { view } = await searchParams;

  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/dashboard/plans/${planId}`);
  if (!canAccessDashboard(profile.role)) redirect("/access-restricted");

  const actor: PlanActor = { id: profile.id, role: profile.role, email: profile.email };
  const data = await loadPlanWorkspace(planId, actor);

  // loadPlanWorkspace returns null both for a missing plan and for one the actor
  // cannot see — deliberately indistinguishable, so a private plan's existence
  // doesn't leak through a 403.
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 px-6 py-20 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Plan not available</h1>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          This plan doesn&apos;t exist, or it&apos;s private and you&apos;re not a member. Ask its owner to add you.
        </p>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link href="/dashboard/plans">Back to plans</Link>
        </Button>
      </div>
    );
  }

  const VIEWS: PlanView[] = ["grid", "board", "list", "calendar"];
  const initialView: PlanView = VIEWS.includes(view as PlanView) ? (view as PlanView) : data.plan.default_view;

  return <PlanWorkspace data={data} initialView={initialView} />;
}
