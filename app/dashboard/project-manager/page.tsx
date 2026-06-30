import { SectionHeader } from "@/components/dashboard/section-header";
import { loadProjectManagerData, loadProjectLinkOptions } from "@/lib/project-manager/data";
import { getCurrentProfile } from "@/lib/auth/server";
import { ProjectManagerClient } from "./project-manager-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project Manager — MJG Dashboard" };

export default async function ProjectManagerPage() {
  const [data, profile, linkOptions] = await Promise.all([
    loadProjectManagerData("default"), getCurrentProfile(), loadProjectLinkOptions(),
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

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace"
        title="Project Manager"
        description="Plan stewardship and operations work across projects, phases, tasks, and milestones — with templates, dependencies, and multiple views."
      />
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
