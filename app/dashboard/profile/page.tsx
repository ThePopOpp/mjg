import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/facilitator/profile-form";
import { AvatarUploader } from "@/components/user-management/avatar-uploader";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLE_LABELS } from "@/lib/rbac/roles";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/profile");

  // getCurrentProfile omits phone / created_at — load them directly.
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("phone,created_at").eq("id", profile.id).maybeSingle();

  const memberSince = data?.created_at
    ? new Date(data.created_at).toLocaleDateString([], { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="space-y-6">
      <SectionHeader title="My Profile" description="Update your photo, name, and contact details." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="space-y-5 p-5">
            <AvatarUploader firstName={profile.firstName} lastName={profile.lastName} email={profile.email} avatarUrl={profile.avatarUrl} />
            <div className="space-y-2 border-t pt-4 text-sm">
              <div>
                <p className="text-muted-foreground">Signed in as</p>
                <p className="font-medium break-all">{profile.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Role</p>
                <p className="font-medium">{ROLE_LABELS[profile.role]}</p>
              </div>
              {memberSince ? (
                <div>
                  <p className="text-muted-foreground">Member since</p>
                  <p className="font-medium">{memberSince}</p>
                </div>
              ) : null}
            </div>
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
