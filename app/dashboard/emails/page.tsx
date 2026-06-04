import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmailTabs } from "@/components/emails/email-tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";
import { getEmailTemplateData } from "@/lib/email/templates";
import { getEmailInboxData } from "@/lib/email/inbox";

export default async function EmailsPage() {
  const [pilotData, templateData, inboxData] = await Promise.all([
    getPilotDashboardData(),
    getEmailTemplateData(),
    getEmailInboxData(),
  ]);
  const sentCount = templateData.logs.filter((log: any) => log.status === "sent").length;
  const failedCount = templateData.logs.filter((log: any) => log.status === "failed").length;
  const skippedCount = templateData.logs.filter((log: any) => log.status === "skipped").length;
  const totalSendCount = templateData.logs.length;
  const activeTemplateCount = templateData.templates.filter((template: any) => template.status === "active").length;
  const draftTemplateCount = templateData.templates.filter((template: any) => template.status === "draft").length;
  const archivedTemplateCount = templateData.templates.filter((template: any) => template.status === "archived").length;
  const mappedAutomationCount = templateData.mappings.filter((mapping: any) => mapping.enabled && mapping.template_id).length;
  const enabledAutomationCount = templateData.mappings.filter((mapping: any) => mapping.enabled).length;
  const unmappedAutomationCount = templateData.mappings.filter((mapping: any) => mapping.enabled && !mapping.template_id).length;
  const dueJourneyCount = pilotData.emailEvents.filter((event: any) => event.status === "scheduled" || event.status === "queued").length;
  const sentJourneyCount = pilotData.emailEvents.filter((event: any) => event.status === "sent").length;
  const inboundCount = inboxData.messages.length;
  const lastInbound = inboxData.messages[0]?.received_at ? new Date(inboxData.messages[0].received_at).toLocaleString() : "No synced mail yet";
  const sendSuccessRate = totalSendCount ? Math.round((sentCount / totalSendCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Email overview for templates, automations, journey sends, inbox sync, and history." />
      <EmailTabs active="overview" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Delivery rate" value={`${sendSuccessRate}%`} detail={`${sentCount} sent from ${totalSendCount} logged sends`} />
        <SummaryCard title="Active templates" value={activeTemplateCount} detail={`${draftTemplateCount} drafts, ${archivedTemplateCount} archived`} />
        <SummaryCard title="Mapped automations" value={mappedAutomationCount} detail={`${unmappedAutomationCount} enabled steps need templates`} />
        <SummaryCard title="Inbox messages" value={inboundCount} detail={lastInbound} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Email health</CardTitle>
            <CardDescription>Quick read on sending, inbox sync, and automation readiness.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <HealthRow label="SMTP sends" value={`${sentCount} sent`} detail={`${failedCount} failed, ${skippedCount} skipped`} good={!failedCount} />
            <HealthRow label="Inbox sync" value={`${inboundCount} received`} detail={lastInbound} good={Boolean(inboundCount)} />
            <HealthRow label="Templates" value={`${activeTemplateCount} active`} detail={`${templateData.templates.length} total templates`} good={Boolean(activeTemplateCount)} />
            <HealthRow label="Automations" value={`${mappedAutomationCount}/${enabledAutomationCount || templateData.mappings.length} mapped`} detail="Enabled automations with templates assigned" good={!unmappedAutomationCount && Boolean(mappedAutomationCount)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journey queue</CardTitle>
            <CardDescription>Created for More 7-day journey status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatLine label="Due or queued" value={dueJourneyCount} />
            <StatLine label="Journey emails sent" value={sentJourneyCount} />
            <StatLine label="Total journey events" value={pilotData.emailEvents.length} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent journey activity</CardTitle>
          <CardDescription>Use the Journey tab to send due events.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempted</TableHead>
                <TableHead>Scheduled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pilotData.emailEvents.slice(0, 8).map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.participants?.first_name} {row.participants?.last_name}</TableCell>
                  <TableCell>{row.step_number}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell>{row.last_attempt_at ? new Date(row.last_attempt_at).toLocaleString() : "-"}</TableCell>
                  <TableCell>{row.scheduled_at ? new Date(row.scheduled_at).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
              {!pilotData.emailEvents.length ? <TableRow><TableCell colSpan={6}>No journey events yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {failedCount ? <p className="text-sm text-destructive">{failedCount} recent email sends failed. Review History for details.</p> : null}
    </div>
  );
}

function SummaryCard({ title, value, detail }: { title: string; value: number | string; detail: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function HealthRow({ label, value, detail, good }: { label: string; value: string; detail: string; good: boolean }) {
  return (
    <div className="rounded-md border bg-background p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className={good ? "text-sm font-semibold text-primary" : "text-sm font-semibold text-destructive"}>
          {good ? "Ready" : "Needs review"}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-background px-4 py-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold">{value}</span>
    </div>
  );
}
