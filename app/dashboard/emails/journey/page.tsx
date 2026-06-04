import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmailTabs } from "@/components/emails/email-tabs";
import { SendDueJourneyButton } from "@/components/emails/send-due-journey-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function EmailJourneyPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Manage scheduled 7-day journey events and manual Wave 0 sends." />
      <EmailTabs active="journey" />

      <Card>
        <CardHeader>
          <CardTitle>7-day journey sender</CardTitle>
          <CardDescription>Send due scheduled journey emails using mapped templates. Start with a small limit while testing Wave 0.</CardDescription>
        </CardHeader>
        <CardContent>
          <SendDueJourneyButton />
        </CardContent>
      </Card>

      <Card>
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
              {data.emailEvents.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.participants?.first_name} {row.participants?.last_name}</TableCell>
                  <TableCell>{row.step_number}</TableCell>
                  <TableCell>{row.subject}</TableCell>
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  <TableCell>{row.last_attempt_at ? new Date(row.last_attempt_at).toLocaleString() : "-"}</TableCell>
                  <TableCell>{row.scheduled_at ? new Date(row.scheduled_at).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
              {!data.emailEvents.length ? <TableRow><TableCell colSpan={6}>No journey events yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
