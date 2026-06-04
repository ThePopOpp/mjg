import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { EmailHistoryTable, type EmailHistoryRow } from "@/components/emails/email-history-table";
import { EmailTabs } from "@/components/emails/email-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { getEmailMessageHistoryData } from "@/lib/email/inbox";
import { getEmailTemplateData, renderTemplate } from "@/lib/email/templates";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";

export default async function EmailHistoryPage() {
  const profile = await getCurrentProfile();
  if (!can(profile?.role, PERMISSIONS.MANAGE_USERS)) {
    redirect("/access-restricted");
  }

  const [templateData, inboxData] = await Promise.all([getEmailTemplateData(), getEmailMessageHistoryData()]);

  const history: EmailHistoryRow[] = [
    ...templateData.logs.map((log: any) => ({
      id: `sent-${log.id}`,
      direction: "Sent" as const,
      contact: log.recipient_email,
      subject: log.subject,
      template: log.email_templates?.name ?? "-",
      status: log.status,
      date: log.sent_at ?? log.created_at,
      error: log.error_message,
      htmlBody: log.email_templates?.html_body ? renderTemplate(log.email_templates.html_body, log.merge_data ?? {}) : null,
      textBody: log.email_templates?.text_body ? renderTemplate(log.email_templates.text_body, log.merge_data ?? {}) : null,
    })),
    ...inboxData.messages.map((message: any) => ({
      id: `received-${message.id}`,
      sourceId: message.id,
      direction: "Received" as const,
      contact: message.from_email,
      fromName: message.from_name,
      subject: message.subject || "(no subject)",
      template: "-",
      status: (message.flags ?? [])[0] ?? "received",
      date: message.received_at ?? message.created_at,
      error: null,
      snippet: message.snippet,
      htmlBody: message.html_body,
      textBody: message.text_body,
      linkedRecord: message.participants
        ? `${message.participants.first_name} ${message.participants.last_name}`
        : message.profile?.full_name ?? "-",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Review sent and received email history." />
      <EmailTabs active="history" />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Sent SMTP logs and received inbox messages in one audit trail.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <EmailHistoryTable rows={history} emptyMessage="No email history yet." mode="history" />
        </CardContent>
      </Card>

      {templateData.error || inboxData.error ? <p className="text-sm text-destructive">{templateData.error ?? inboxData.error}</p> : null}
    </div>
  );
}
