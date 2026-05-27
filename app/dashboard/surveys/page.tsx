import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPilotDashboardData } from "@/lib/dashboard/pilot-data";

export default async function SurveysPage() {
  const data = await getPilotDashboardData();

  return (
    <div className="space-y-6">
      <SectionHeader title="Surveys" description="Monitor general survey and Pastor/Elder survey distribution, completions, and feedback themes." />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Anonymous use</TableHead>
                <TableHead>Story/interview</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.surveys.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.survey_type}</TableCell>
                  <TableCell>{row.participants?.first_name} {row.participants?.last_name}</TableCell>
                  <TableCell>{row.anonymous_feedback_permission ? "Yes" : "No"}</TableCell>
                  <TableCell>{row.story_interview_permission ? "Yes" : "No"}</TableCell>
                  <TableCell>{row.follow_up_permission ? "Yes" : "No"}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!data.surveys.length ? <TableRow><TableCell colSpan={6}>No survey responses yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
