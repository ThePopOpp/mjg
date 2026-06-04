import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { EmailTemplateManager } from "@/components/email-templates/email-template-manager";
import { EmailTabs } from "@/components/emails/email-tabs";
import { getCurrentProfile } from "@/lib/auth/server";
import { getEmailTemplateData } from "@/lib/email/templates";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";

export default async function EmailTemplatesHubPage() {
  const profile = await getCurrentProfile();
  if (!can(profile?.role, PERMISSIONS.MANAGE_USERS)) {
    redirect("/access-restricted");
  }

  const data = await getEmailTemplateData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Review and manage saved email templates." />
      <EmailTabs active="templates" />

      <EmailTemplateManager templates={data.templates as any[]} />

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
