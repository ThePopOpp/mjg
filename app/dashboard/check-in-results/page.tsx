import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function CheckInResultsPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Check-In Results" description="Review stewardship scores, lowest scoring areas, ranges, and completion trends." />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Lowest area</TableHead>
                <TableHead>Score range</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.checkIns.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.participants?.first_name} {row.participants?.last_name}</TableCell>
                  <TableCell>{row.total_score}</TableCell>
                  <TableCell>{row.lowest_area_label}</TableCell>
                  <TableCell>{row.score_range_category}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!data.checkIns.length ? <TableRow><TableCell colSpan={5}>No Check-In results yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
