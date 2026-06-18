import { SectionHeader } from "@/components/dashboard/section-header";
import { EmailTabs } from "@/components/emails/email-tabs";
import { ManualEmailComposer } from "@/components/emails/manual-email-composer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function SendEmailPage() {
  const profile = await getCurrentProfile();
  const supabase = createSupabaseAdminClient();

  const [{ data: users }, { data: templates }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email,role")
      .eq("status", "active")
      .order("full_name", { ascending: true }),
    supabase
      .from("email_templates")
      .select("id,name,subject,status,html_body")
      .neq("status", "archived")
      .order("updated_at", { ascending: false })
      .limit(100),
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Emails" description="Send a test, manual email, or controlled audience deployment." />
      <EmailTabs active="send" />

      <Card>
        <CardHeader>
          <CardTitle>Compose Email</CardTitle>
          <CardDescription>
            Send to specific recipients or deploy a saved template to an audience. Pick a template next to the subject
            line to preview and deploy it, or compose a custom email manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManualEmailComposer
            users={(users ?? []) as any[]}
            templates={(templates ?? []) as any[]}
            defaultEmail={profile?.email ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
