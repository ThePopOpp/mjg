import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function ParticipantsPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Participants"
        description="Manage Created for More pilot contacts, Check-In progress, tags, notes, and consent records."
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Wave/source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Survey</TableHead>
                <TableHead>Inner Circle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.participants.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.first_name} {row.last_name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.wave ?? row.source ?? "-"}</TableCell>
                  <TableCell>{row.participant_type}</TableCell>
                  <TableCell><StatusBadge status={row.check_in_status ?? "not_started"} /></TableCell>
                  <TableCell><StatusBadge status={row.survey_status ?? "not_sent"} /></TableCell>
                  <TableCell><StatusBadge status={row.inner_circle_status ?? "not_invited"} /></TableCell>
                </TableRow>
              ))}
              {!data.participants.length ? (
                <TableRow><TableCell colSpan={7}>No participants yet.</TableCell></TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}
