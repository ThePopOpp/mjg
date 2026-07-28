import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/facilitator/profile-form";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/profile");

  // getCurrentProfile omits phone — load it directly.
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("phone").eq("id", profile.id).maybeSingle();

  return (
    <div className="space-y-6">
      <SectionHeader title="My Profile" description="Update your name and contact details." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="space-y-2 p-5">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <p className="font-medium">{profile.email}</p>
            <p className="text-sm text-muted-foreground">Role: {ROLE_LABELS[profile.role]}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardContent className="p-5">
            <ProfileForm
              initial={{ firstName: profile.firstName, lastName: profile.lastName, phone: data?.phone ?? "" }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
