import { SectionHeader } from "@/components/dashboard/section-header";
import { PageHelp } from "@/components/dashboard/page-help";
import { MediaStudioDashboard } from "@/components/media-studio/media-studio-dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { MEDIA_STUDIO_HELP, MEDIA_STUDIO_HELP_INTRO, MEDIA_STUDIO_HELP_TITLE } from "@/lib/content/help-text";
import { createAdminActionToken } from "@/lib/auth/action-token";
import { getCurrentProfile } from "@/lib/auth/server";
import { getMediaStudioData, getShareableSuperAdmins } from "@/lib/content/media";
import { ROLES } from "@/lib/rbac/roles";

export const dynamic = "force-dynamic";

export default async function MediaStudioPage() {
  const [data, profile, superAdmins] = await Promise.all([
    getMediaStudioData(),
    getCurrentProfile(),
    getShareableSuperAdmins(),
  ]);
  const isSuperAdmin = profile?.role === ROLES.SUPER_ADMIN;
  const shareableAdmins = superAdmins.filter((a) => a.id !== profile?.id);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Media Studio"
        description="Manage audio, video, photos, galleries, public embeds, and future dashboard publishing targets."
        action={<PageHelp title={MEDIA_STUDIO_HELP_TITLE} intro={MEDIA_STUDIO_HELP_INTRO} sections={MEDIA_STUDIO_HELP} />}
      />
      <MediaStudioDashboard
        actionToken={profile ? createAdminActionToken(profile) : ""}
        assets={data.assets as any[]}
        superAdmins={shareableAdmins}
        isSuperAdmin={isSuperAdmin}
      />
      {data.error ? (
        <Card>
          <CardContent className="p-4 text-sm text-destructive">{data.error}</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
