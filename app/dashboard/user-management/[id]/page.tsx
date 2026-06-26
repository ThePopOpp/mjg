import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserProfileEditor } from "@/components/user-management/user-profile-editor";
import { DeleteUserButton } from "@/components/user-management/delete-user-button";
import { ROLE_LABELS, isAppRole } from "@/lib/rbac/roles";
import { getCurrentProfile } from "@/lib/auth/server";
import { getUserManagementProfile } from "@/lib/user-management/repository";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [data, currentProfile] = await Promise.all([getUserManagementProfile(id), getCurrentProfile()]);

  if (!data.profile) {
    return (
      <div className="space-y-6">
        <SectionHeader title="User not found" description={data.error ?? `No Supabase profile was found for ${id}.`} />
      </div>
    );
  }

  const profile = data.profile as any;
  const displayName = profile.full_name || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || profile.email;
  const isSelf = currentProfile?.id === profile.id;
  const isOwner = String(profile.email ?? "").toLowerCase() === "jw@michaeljgauthier.com";
  const canDelete = !isSelf && !isOwner;

  return (
    <div className="space-y-6">
      <SectionHeader title={displayName} description="Profile, role, permissions, status, activity, and linked participant records." />

      <div className="grid gap-4 md:grid-cols-4">
        <Summary label="Role" value={roleLabel(profile.role)} />
        <Summary label="Status" value={<StatusBadge status={profile.status} />} />
        <Summary label="Email" value={profile.email} />
        <Summary label="Phone" value={profile.phone ?? "-"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <UserProfileEditor profile={profile} currentUserRole={currentProfile?.role} />
        </CardContent>
      </Card>

      {canDelete ? (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Danger zone</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Permanently delete this user&apos;s login and profile. This cannot be undone.
            </p>
            <DeleteUserButton
              userId={profile.id}
              userName={displayName}
              redirectTo="/dashboard/user-management"
              label="Delete user"
              variant="button"
            />
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.activity.map((activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.action}</TableCell>
                    <TableCell>{activity.entity_type ?? "-"}</TableCell>
                    <TableCell>{new Date(activity.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!data.activity.length ? <TableRow><TableCell colSpan={3}>No user activity yet.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connected participant links</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Wave</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.links.map((link: any) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      {link.participants ? `${link.participants.first_name} ${link.participants.last_name}` : "-"}
                    </TableCell>
                    <TableCell>{link.participants?.email ?? "-"}</TableCell>
                    <TableCell>{link.participants?.wave ?? "-"}</TableCell>
                  </TableRow>
                ))}
                {!data.links.length ? <TableRow><TableCell colSpan={3}>No participant links yet.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected form submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.submissions.map((submission: any) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.form_type}</TableCell>
                  <TableCell>{submission.email ?? "-"}</TableCell>
                  <TableCell>{submission.phone ?? "-"}</TableCell>
                  <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!data.submissions.length ? <TableRow><TableCell colSpan={4}>No connected form submissions yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 text-sm font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function roleLabel(role: unknown) {
  return typeof role === "string" && isAppRole(role) ? ROLE_LABELS[role] : String(role ?? "-");
}
