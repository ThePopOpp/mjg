import { notFound, redirect } from "next/navigation";
import { WorkspaceEditor } from "@/components/workspace/workspace-editor";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getDocument, listDocuments, listFolders } from "@/lib/workspace/repository";

export const dynamic = "force-dynamic";

export default async function WorkspaceDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/dashboard/workspace/${id}`);
  if (!can(profile.role, PERMISSIONS.MANAGE_WORKSPACE)) redirect("/access-restricted");

  const [doc, { mine, shared }, folders] = await Promise.all([getDocument(id, profile.id), listDocuments(profile.id), listFolders(profile.id)]);
  if (!doc) notFound();

  const navDocs = [...mine, ...shared].map((d) => ({ id: d.id, title: d.title, is_favorite: d.is_favorite, folder_name: d.folder_name }));

  return (
    <WorkspaceEditor
      doc={{ id: doc.id, title: doc.title, content_json: doc.content_json, scope: doc.scope, updated_at: doc.updated_at }}
      navDocs={navDocs}
      folders={folders.map((f) => ({ id: f.id, name: f.name }))}
    />
  );
}
