import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function EmailJourneyPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Email Journey" description="Monitor the 7-day stewardship journey, email progress, and engagement signals." />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Step</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell>{row.scheduled_at ? new Date(row.scheduled_at).toLocaleDateString() : "-"}</TableCell>
                </TableRow>
              ))}
              {!data.emailEvents.length ? <TableRow><TableCell colSpan={5}>No journey events yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
