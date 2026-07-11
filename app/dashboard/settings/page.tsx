import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailTestForm } from "@/components/settings/email-test-form";
import { DmSettingsCard } from "@/components/direct-messages/dm-settings-card";
import { getCurrentProfile } from "@/lib/auth/server";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  return (
    <div className="space-y-6">
      <SectionHeader title="Settings" description="Manage dashboard preferences, Supabase-backed configuration, and admin defaults." />

      <DmSettingsCard />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Email diagnostics</CardTitle>
            <CardDescription>
              Send a Super Admin test email through the configured SMTP mailbox. Results are logged to Supabase notifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailTestForm defaultTo={profile?.email ?? "jw@michaeljgauthier.com"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temporary testing domain</CardTitle>
            <CardDescription>Use these values when deploying the dashboard for live testing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">Dashboard URL</p>
              <p className="text-muted-foreground">https://my.michaeljgauthier.com/dashboard</p>
            </div>
            <div>
              <p className="font-medium">Participant URL example</p>
              <p className="text-muted-foreground">https://my.michaeljgauthier.com/dashboard/participants</p>
            </div>
            <div>
              <p className="font-medium">Production environment value</p>
              <code className="mt-1 block rounded-md bg-muted p-2 text-xs">NEXT_PUBLIC_SITE_URL=https://my.michaeljgauthier.com</code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
