import { SectionHeader } from "@/components/dashboard/section-header";
import { SyncEmailButton } from "@/components/email-inbox/sync-email-button";
import { EmailHistoryTable, type EmailHistoryRow } from "@/components/emails/email-history-table";
import { EmailTabs } from "@/components/emails/email-tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmailInboxData } from "@/lib/email/inbox";

export default async function EmailInboxHubPage() {
  const data = await getEmailInboxData();
  const rows: EmailHistoryRow[] = data.messages.map((message: any) => ({
    id: `received-${message.id}`,
    sourceId: message.id,
    direction: "Received",
    contact: message.from_email,
    fromName: message.from_name,
    subject: message.subject || "(no subject)",
    status: (message.flags ?? [])[0] ?? "received",
    date: message.received_at ?? message.created_at,
    snippet: message.snippet,
    htmlBody: message.html_body,
    textBody: message.text_body,
    linkedRecord: message.participants
      ? `${message.participants.first_name} ${message.participants.last_name}`
      : message.profile?.full_name ?? "-",
    flags: message.flags ?? [],
  }));

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Sync and review inbound mailbox messages." />
      <EmailTabs active="inbox" />

      <Card>
        <CardHeader>
          <CardTitle>Mailbox sync</CardTitle>
        </CardHeader>
        <CardContent>
          <SyncEmailButton />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <EmailHistoryTable rows={rows} emptyMessage="No emails synced yet." mode="inbox" />
        </CardContent>
      </Card>

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
