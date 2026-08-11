import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { WorkspaceHome } from "@/components/workspace/workspace-home";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { listDocuments, listFolders, listWorkspaces, listHiddenTemplateIds, listFavoriteTemplateIds, listArchivedDocuments, DEFAULT_WORKSPACE_ID } from "@/lib/workspace/repository";
import { WORKSPACE_TEMPLATES } from "@/lib/workspace/templates";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({ searchParams }: { searchParams: Promise<{ ws?: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/workspace");
  if (!can(profile.role, PERMISSIONS.MANAGE_WORKSPACE)) redirect("/access-restricted");

  const { ws } = await searchParams;
  const workspaces = await listWorkspaces();
  const currentWorkspaceId = ws && workspaces.some((w) => w.id === ws) ? ws : (workspaces[0]?.id ?? DEFAULT_WORKSPACE_ID);

  const [{ mine, shared }, folders, hiddenTemplateIds, favoriteTemplateIds, archived] = await Promise.all([
    listDocuments(profile.id, currentWorkspaceId),
    listFolders(profile.id, currentWorkspaceId),
    listHiddenTemplateIds(),
    listFavoriteTemplateIds(profile.id),
    listArchivedDocuments(profile.id, currentWorkspaceId),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Workspace" description="Living documents for notes, plans, and collaboration." />
      <WorkspaceHome
        mine={mine}
        shared={shared}
        folders={folders}
        templates={WORKSPACE_TEMPLATES.map((t) => ({ id: t.id, name: t.name, description: t.description, category: t.category }))}
        hiddenTemplateIds={hiddenTemplateIds}
        favoriteTemplateIds={favoriteTemplateIds}
        archived={archived}
        workspaces={workspaces}
        currentWorkspaceId={currentWorkspaceId}
      />
    </div>
  );
}
