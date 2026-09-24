import { getCurrentProfile } from "@/lib/auth/server";
import { listPages } from "@/lib/website/data";
import { WebsiteWorkspace } from "@/components/website/website-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Website Editor — MJG Dashboard" };

// Super-Admin-only via app/dashboard/cms/layout.tsx, which wraps this route.
export default async function WebsiteEditorPage() {
  const [pages, profile] = await Promise.all([listPages({ includeDeleted: false }), getCurrentProfile()]);
  const displayName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.email
    : undefined;

  return <WebsiteWorkspace initialPages={pages} displayName={displayName} />;
}
