import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { DeployEmailForm } from "@/components/email-templates/deploy-email-form";
import { DynamicFieldCopyGrid } from "@/components/email-templates/dynamic-field-copy-grid";
import { EmailTabs } from "@/components/emails/email-tabs";
import { ManualEmailComposer } from "@/components/emails/manual-email-composer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { DEFAULT_EMAIL_FIELDS, getEmailTemplateData } from "@/lib/email/templates";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function SendEmailPage() {
  const profile = await getCurrentProfile();
  if (!can(profile?.role, PERMISSIONS.MANAGE_USERS)) {
    redirect("/access-restricted");
  }

  const data = await getEmailTemplateData();
  const supabase = createSupabaseAdminClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id,full_name,email,role")
    .eq("status", "active")
    .order("full_name", { ascending: true });

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Send a test, manual email, or controlled audience deployment." />
      <EmailTabs active="send" />

      <Card>
        <CardHeader>
          <CardTitle>Send Email</CardTitle>
          <CardDescription>Send a regular email to dashboard users, non-users, CC/BCC recipients, and attachments.</CardDescription>
        </CardHeader>
        <CardContent>
          <ManualEmailComposer users={(users ?? []) as any[]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send from template</CardTitle>
          <CardDescription>Choose a saved template, send a test first, then deploy to a limited audience when ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <DeployEmailForm templates={data.templates as any[]} defaultEmail={profile?.email ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dynamic fields</CardTitle>
          <CardDescription>Copy fields and paste them into templates or email content.</CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicFieldCopyGrid fields={DEFAULT_EMAIL_FIELDS} />
        </CardContent>
      </Card>
    </div>
  );
}
