import { FormSubmissionsTable } from "@/components/emails/form-submissions-table";
import { EmailTabs } from "@/components/emails/email-tabs";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function EmailFormSubmissionsPage() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("form_submissions")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = data ?? [];
  const contactCount = rows.filter((row: any) => row.form_type === "contact").length;
  const newsletterCount = rows.filter((row: any) => row.form_type === "newsletter").length;
  const journeyCount = rows.filter((row: any) => row.form_type === "join_the_journey" || row.form_type === "journey_signup").length;

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Review public form submissions and reply from the email workflow." />
      <EmailTabs active="form-submissions" />

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="Contact forms" value={contactCount} />
        <SummaryCard title="Newsletter forms" value={newsletterCount} />
        <SummaryCard title="Journey signups" value={journeyCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <FormSubmissionsTable submissions={rows as any[]} />
          {error ? <p className="mt-4 text-sm text-destructive">{error.message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
