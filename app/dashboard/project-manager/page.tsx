import { SectionHeader } from "@/components/dashboard/section-header";
import { loadProjectManagerData, loadProjectLinkOptions } from "@/lib/project-manager/data";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { AskSteward } from "@/components/ai-agent/ask-steward";
import { ProjectManagerClient } from "./project-manager-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project Manager — MJG Dashboard" };

export default async function ProjectManagerPage() {
  const profile = await getCurrentProfile();
  const viewer = profile ? { id: profile.id, role: profile.role, email: profile.email ?? "" } : undefined;
  const [data, linkOptions] = await Promise.all([
    loadProjectManagerData("default", viewer), loadProjectLinkOptions(),
  ]);

  // Assignee / participant suggestions: real MJG users by email, deduped (so
  // same-named profiles don't collapse into indistinguishable duplicates).
  const staffOptions = Array.from(
    new Map(
      linkOptions.users
        .filter((u) => u.email)
        .map((u) => [u.email!.toLowerCase(), { name: u.name, email: u.email as string }]),
    ).values(),
  );
  const currentUserName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  const currentUserEmail = profile?.email ?? "";
  const canAskSteward = profile ? can(profile.role, PERMISSIONS.MANAGE_SETTINGS) : false;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SectionHeader
          eyebrow="Workspace"
          title="Project Manager"
          description="Plan stewardship and operations work across projects, phases, tasks, and milestones — with templates, dependencies, and multiple views."
        />
        {canAskSteward && <AskSteward />}
      </div>
      <ProjectManagerClient
        initialData={data}
        staffOptions={staffOptions}
        currentUserName={currentUserName}
        currentUserEmail={currentUserEmail}
        linkOptions={linkOptions}
      />
    </div>
  );
}
