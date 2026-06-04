"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROLE_LABELS, ROLES, type AppRole } from "@/lib/rbac/roles";

const inviteRoles = [ROLES.ADMIN, ROLES.TEAM_MEMBER, ROLES.CONTENT_REVIEWER, ROLES.PASTOR_ELDER_REVIEWER, ROLES.PARTICIPANT];

export function InviteUserForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AppRole>(ROLES.TEAM_MEMBER);
  const [inviteMethod, setInviteMethod] = useState<"email" | "sms" | "manual">("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/user-management/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, phone, role, inviteMethod, siteUrl: window.location.origin }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Invitation could not be created.");
      setLoading(false);
      return;
    }

    setEmail("");
    setPhone("");
    setMessage("Invitation saved in Supabase.");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="grid gap-3 md:grid-cols-[1fr_1fr_180px_140px_auto]" onSubmit={submitInvite}>
      <Input onChange={(event) => setEmail(event.target.value)} placeholder="Email" type="email" value={email} />
      <Input onChange={(event) => setPhone(event.target.value)} placeholder="Phone, optional" type="tel" value={phone} />
      <Select value={role} onValueChange={(value) => setRole(value as AppRole)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {inviteRoles.map((item) => (
            <SelectItem key={item} value={item}>{ROLE_LABELS[item]}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={inviteMethod} onValueChange={(value) => setInviteMethod(value as "email" | "sms" | "manual")}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
          <SelectItem value="sms">SMS</SelectItem>
        </SelectContent>
      </Select>
      <Button disabled={loading || (!email && !phone)} type="submit">
        <Send className="h-4 w-4" />
        {loading ? "Inviting..." : "Invite"}
      </Button>
      {error ? <p className="text-sm text-destructive md:col-span-5">{error}</p> : null}
      {message ? <p className="text-sm text-primary md:col-span-5">{message}</p> : null}
    </form>
  );
}
