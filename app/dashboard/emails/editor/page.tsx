import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { EmailTemplateForm } from "@/components/email-templates/email-template-form";
import { DynamicFieldCopyGrid } from "@/components/email-templates/dynamic-field-copy-grid";
import { EmailTabs } from "@/components/emails/email-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { DEFAULT_EMAIL_FIELDS, getEmailTemplateData } from "@/lib/email/templates";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";

export default async function TemplateEditorPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const profile = await getCurrentProfile();
  if (!can(profile?.role, PERMISSIONS.MANAGE_USERS)) {
    redirect("/access-restricted");
  }

  const params = await searchParams;
  const data = await getEmailTemplateData();
  const template = params.id ? data.templates.find((item: any) => item.id === params.id) : undefined;

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description={template ? `Editing ${template.name}` : "Create a new email template."} />
      <EmailTabs active="editor" />

      <Card>
        <CardHeader>
          <CardTitle>{template ? "Edit template" : "Create template"}</CardTitle>
          <CardDescription>Use advanced HTML or the simple block tools, then preview before saving.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailTemplateForm initialTemplate={template as any} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dynamic fields</CardTitle>
          <CardDescription>Click a field to copy it, then paste it into the subject or body.</CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicFieldCopyGrid fields={DEFAULT_EMAIL_FIELDS} />
        </CardContent>
      </Card>
    </div>
  );
}
