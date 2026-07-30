import { notFound, redirect } from "next/navigation";
import { WorkspaceEditor } from "@/components/workspace/workspace-editor";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getDocument } from "@/lib/workspace/repository";

export const dynamic = "force-dynamic";

export default async function WorkspaceDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/dashboard/workspace/${id}`);
  if (!can(profile.role, PERMISSIONS.MANAGE_WORKSPACE)) redirect("/access-restricted");

  const doc = await getDocument(id, profile.id);
  if (!doc) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <WorkspaceEditor doc={{ id: doc.id, title: doc.title, content_json: doc.content_json }} />
    </div>
  );
}
