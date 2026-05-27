import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function InnerCirclePage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Inner Circle" description="Track invitations, acceptances, cohort readiness, and high-interest participants." />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Willing</TableHead>
                <TableHead>Future feedback</TableHead>
                <TableHead>Story/interview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.innerCircle.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.willing ? "Yes" : "No"}</TableCell>
                  <TableCell>{row.future_feedback_permission ? "Yes" : "No"}</TableCell>
                  <TableCell>{row.story_interview_permission ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
              {!data.innerCircle.length ? <TableRow><TableCell colSpan={5}>No Inner Circle responses yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
