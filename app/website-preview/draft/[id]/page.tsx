// Editor preview target. Rendered inside the live-preview iframe in the page
// editor. Super-Admin-guarded on its own (it deliberately sits OUTSIDE
// /dashboard so the dashboard chrome does not appear in the preview).

import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";
import { DraftPreview } from "@/components/website/draft-preview";
import { getPage } from "@/lib/website/data";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function EditorDraftPreview({ params }: { params: Promise<{ id: string }> }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== ROLES.SUPER_ADMIN) redirect("/access-restricted");

  const { id } = await params;
  const page = await getPage(id);
  if (!page) notFound();

  return <DraftPreview page={page} banner={false} />;
}
