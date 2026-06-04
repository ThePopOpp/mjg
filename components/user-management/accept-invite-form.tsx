"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/browser";

export function AcceptInviteForm({ token }: { token: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function acceptInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/user-management/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, firstName, lastName, phone, password }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Invitation could not be accepted.");
      setLoading(false);
      return;
    }

    setEmail(payload.email);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: payload.email, password });
    if (signInError) {
      setMessage("Account created. Sign in from the login page with your new password.");
      setLoading(false);
      return;
    }

    window.location.assign("/dashboard");
  }

  return (
    <form className="space-y-4" onSubmit={acceptInvite}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input onChange={(event) => setFirstName(event.target.value)} placeholder="First name" required value={firstName} />
        <Input onChange={(event) => setLastName(event.target.value)} placeholder="Last name" required value={lastName} />
      </div>
      <Input onChange={(event) => setPhone(event.target.value)} placeholder="Phone, optional" type="tel" value={phone} />
      <div className="relative">
        <Input
          className="pr-10"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Create a password"
          required
          type={showPassword ? "text" : "password"}
          value={password}
        />
        <button
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => setShowPassword((current) => !current)}
          type="button"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      {message ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
      {email ? <p className="text-xs text-muted-foreground">Account email: {email}</p> : null}
      <Button className="w-full" disabled={loading || !token} type="submit">
        {loading ? "Creating account..." : "Accept invitation"}
      </Button>
    </form>
  );
}
