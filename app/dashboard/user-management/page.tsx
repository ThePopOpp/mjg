import Link from "next/link";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InviteUserForm } from "@/components/user-management/invite-user-form";
import { ROLE_LABELS, ROLES, isAppRole } from "@/lib/rbac/roles";
import { getCurrentProfile } from "@/lib/auth/server";
import { getUserManagementData } from "@/lib/user-management/repository";

export default async function UserManagementPage() {
  const [data, profile] = await Promise.all([getUserManagementData(), getCurrentProfile()]);

  return (
    <div className="space-y-6">
      <SectionHeader title="User Management" description="Invite admins, team members, content reviewers, Pastor/Elder reviewers, and future participants." />

      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Profiles" value={data.profiles.length} />
        <SummaryCard label="Invitations" value={data.invitations.length} />
        <SummaryCard label="Form submissions" value={data.submissions.length} />
        <SummaryCard label="Participant links" value={data.links.length} />
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard/user-management/communications" className="inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
          Communications & Opt-In Management →
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite user</CardTitle>
          {profile?.role === ROLES.SUPER_ADMIN ? (
            <p className="text-sm text-muted-foreground">As a Super Admin you can also invite another Super Admin.</p>
          ) : null}
        </CardHeader>
        <CardContent>
          <InviteUserForm currentUserRole={profile?.role} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users and profiles</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.profiles.map((profile: any) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.full_name || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "-"}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.phone ?? "-"}</TableCell>
                  <TableCell>{roleLabel(profile.role)}</TableCell>
                  <TableCell><StatusBadge status={profile.status} /></TableCell>
                  <TableCell>{profile.participants ? `${profile.participants.first_name} ${profile.participants.last_name}` : "-"}</TableCell>
                  <TableCell>{profile.last_login_at ? new Date(profile.last_login_at).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="text-right">
                    <Link className="text-sm font-medium text-primary hover:underline" href={`/dashboard/user-management/${profile.id}`}>
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {!data.profiles.length ? <TableRow><TableCell colSpan={8}>No Supabase profiles found yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invitations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Invite link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.invitations.map((invite: any) => (
                  <TableRow key={invite.id}>
                    <TableCell>{invite.email ?? invite.phone}</TableCell>
                    <TableCell>{roleLabel(invite.role)}</TableCell>
                    <TableCell>{invite.invite_method}</TableCell>
                    <TableCell><StatusBadge status={invite.invite_status} /></TableCell>
                    <TableCell>{invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>
                      {invite.metadata?.inviteUrl ? (
                        <Link className="text-sm font-medium text-primary hover:underline" href={invite.metadata.inviteUrl}>
                          Open
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!data.invitations.length ? <TableRow><TableCell colSpan={6}>No invitations yet.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
                {data.activity.slice(0, 12).map((activity: any) => (
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
                <TableHead>User linked</TableHead>
                <TableHead>Participant linked</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.submissions.slice(0, 25).map((submission: any) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.form_type}</TableCell>
                  <TableCell>{submission.email ?? "-"}</TableCell>
                  <TableCell>{submission.phone ?? "-"}</TableCell>
                  <TableCell>{submission.user_id ? "Yes" : "No"}</TableCell>
                  <TableCell>{submission.participant_id ? "Yes" : "No"}</TableCell>
                  <TableCell>{new Date(submission.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {!data.submissions.length ? <TableRow><TableCell colSpan={6}>No connected form submissions yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function roleLabel(role: unknown) {
  return typeof role === "string" && isAppRole(role) ? ROLE_LABELS[role] : String(role ?? "-");
}
