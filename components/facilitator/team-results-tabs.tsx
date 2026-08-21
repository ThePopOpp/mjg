"use client";

import { ClipboardList, ScrollText, HeartHandshake } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreatedForMoreResults } from "@/components/check-in/created-for-more-results";
import { SurveyResponsesDashboard } from "@/components/surveys/survey-responses-dashboard";

type Submission = {
  id: string;
  form_type: string;
  email: string | null;
  status: string | null;
  created_at: string;
  participants?: { first_name: string | null; last_name: string | null } | null;
};

function prettyFormType(t: string) {
  return t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TeamResultsTabs({
  checkIns,
  surveys,
  submissions,
}: {
  // Reused presentational dashboards define their own row types; arrays come from the
  // team-scoped query with a matching shape (see lib/facilitator/team.ts getTeamResults).
  checkIns: any[];
  surveys: any[];
  submissions: Submission[];
}) {
  return (
    <Tabs defaultValue="surveys">
      <TabsList>
        <TabsTrigger value="surveys"><ClipboardList className="mr-2 h-4 w-4" /> Surveys</TabsTrigger>
        <TabsTrigger value="history"><ScrollText className="mr-2 h-4 w-4" /> MJG History</TabsTrigger>
        <TabsTrigger value="checkins"><HeartHandshake className="mr-2 h-4 w-4" /> Check-In Result History</TabsTrigger>
      </TabsList>

      <TabsContent value="surveys" className="mt-4">
        {surveys.length ? <SurveyResponsesDashboard surveys={surveys} /> : <Empty label="No survey responses from your team yet." />}
      </TabsContent>

      <TabsContent value="history" className="mt-4">
        {submissions.length ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{prettyFormType(s.form_type)}</TableCell>
                      <TableCell>{`${s.participants?.first_name ?? ""} ${s.participants?.last_name ?? ""}`.trim() || "-"}</TableCell>
                      <TableCell>{s.email ?? "-"}</TableCell>
                      <TableCell className="capitalize">{s.status ?? "-"}</TableCell>
                      <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : <Empty label="No form history for your team yet." />}
      </TabsContent>

      <TabsContent value="checkins" className="mt-4">
        {checkIns.length ? <CreatedForMoreResults submissions={checkIns} /> : <Empty label="No check-in results from your team yet." />}
      </TabsContent>
    </Tabs>
  );
}

function Empty({ label }: { label: string }) {
  return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{label}</CardContent></Card>;
}
