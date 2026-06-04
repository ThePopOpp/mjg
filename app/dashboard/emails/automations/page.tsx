import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { TemplateMappingForm } from "@/components/email-templates/template-mapping-form";
import { EmailTabs } from "@/components/emails/email-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { getEmailTemplateData } from "@/lib/email/templates";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";

export default async function EmailAutomationsPage() {
  const profile = await getCurrentProfile();
  if (!can(profile?.role, PERMISSIONS.MANAGE_USERS)) {
    redirect("/access-restricted");
  }

  const data = await getEmailTemplateData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Connect email templates to the moments that should trigger them." />
      <EmailTabs active="automations" />

      <Card>
        <CardHeader>
          <CardTitle>Email Automations</CardTitle>
          <CardDescription>
            Choose which template powers invitations, Check-In follow-ups, survey invites, Inner Circle invites, and each 7-day journey step.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TemplateMappingForm templates={data.templates as any[]} mappings={data.mappings as any[]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How this works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Email Automations do not create new email content. They connect saved templates to events like user invitations, pilot follow-ups, and scheduled journey steps.
          </p>
          <p>
            If an event has no assigned template, it will be skipped or use a safe fallback where one exists. This keeps the system from sending unfinished content.
          </p>
        </CardContent>
      </Card>

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
