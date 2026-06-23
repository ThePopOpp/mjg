"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABELS, ROLES, type AppRole } from "@/lib/rbac/roles";
import { USER_STATUSES, type UserStatus } from "@/lib/user-management/constants";

type EditableProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  role: AppRole;
  status: UserStatus;
  notes: string | null;
};

export function UserProfileEditor({ profile, currentUserRole }: { profile: EditableProfile; currentUserRole?: AppRole }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  // Only a Super Admin can assign or keep the Super Admin role on a profile.
  const assignableRoles = Object.values(ROLES).filter(
    (item) => item !== ROLES.SUPER_ADMIN || currentUserRole === ROLES.SUPER_ADMIN
  );
  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [role, setRole] = useState<AppRole>(profile.role);
  const [status, setStatus] = useState<UserStatus>(profile.status);
  const [notes, setNotes] = useState(profile.notes ?? "");
  const [statusChangeReason, setStatusChangeReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/user-management/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({
        id: profile.id,
        firstName,
        lastName,
        email,
        phone,
        role,
        status,
        notes,
        statusChangeReason,
        actionToken,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Profile could not be saved.");
      setLoading(false);
      return;
    }

    setMessage("Profile updated in Supabase.");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={saveProfile}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">
          <span>First name</span>
          <Input onChange={(event) => setFirstName(event.target.value)} required value={firstName} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Last name</span>
          <Input onChange={(event) => setLastName(event.target.value)} required value={lastName} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Email</span>
          <Input onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Phone</span>
          <Input onChange={(event) => setPhone(event.target.value)} type="tel" value={phone} />
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Role</span>
          <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {assignableRoles.map((item) => (
              <SelectItem key={item} value={item}>
                {ROLE_LABELS[item]}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </label>
        <label className="space-y-2 text-sm font-medium">
          <span>Status</span>
          <Select value={status} onValueChange={(value) => setStatus(value as UserStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {USER_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
            </SelectContent>
          </Select>
        </label>
      </div>
      <label className="space-y-2 text-sm font-medium">
        <span>Status change reason</span>
        <Input onChange={(event) => setStatusChangeReason(event.target.value)} placeholder="Optional internal note for status changes" value={statusChangeReason} />
      </label>
      <label className="space-y-2 text-sm font-medium">
        <span>Notes</span>
        <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={(event) => setNotes(event.target.value)} value={notes} />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button disabled={loading} type="submit">
        <Save className="h-4 w-4" />
        {loading ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
