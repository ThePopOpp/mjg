import { SectionHeader } from "@/components/dashboard/section-header";
import { EmailTemplateManager } from "@/components/email-templates/email-template-manager";
import { EmailTabs } from "@/components/emails/email-tabs";
import { getEmailTemplateData } from "@/lib/email/templates";
import { getCurrentProfile } from "@/lib/auth/server";

export default async function EmailTemplatesHubPage() {
  const [data, profile] = await Promise.all([getEmailTemplateData(), getCurrentProfile()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Review and manage saved email templates." />
      <EmailTabs active="templates" />

      <EmailTemplateManager templates={data.templates as any[]} mappings={data.mappings as any[]} defaultEmail={profile?.email ?? ""} />

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
