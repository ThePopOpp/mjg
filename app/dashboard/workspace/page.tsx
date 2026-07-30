import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { WorkspaceHome } from "@/components/workspace/workspace-home";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { listDocuments, listFolders } from "@/lib/workspace/repository";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/workspace");
  if (!can(profile.role, PERMISSIONS.MANAGE_WORKSPACE)) redirect("/access-restricted");

  const [{ mine, shared }, folders] = await Promise.all([listDocuments(profile.id), listFolders(profile.id)]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Workspace" description="Living documents for notes, plans, and collaboration." />
      <WorkspaceHome mine={mine} shared={shared} folders={folders} />
    </div>
  );
}
