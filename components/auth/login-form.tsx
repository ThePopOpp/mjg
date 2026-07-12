"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";
  const message = searchParams.get("message");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(message);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"password" | "magic" | null>(null);

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
  }, [nextPath]);

  async function handleSignInWithPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setLoading("password");

    const res = await fetch("/api/auth/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      setError(data.error ?? "Sign-in failed.");
      setLoading(null);
      return;
    }

    // Route Handler wrote Set-Cookie headers — navigate with the fresh session
    window.location.assign(nextPath);
  }

  async function sendMagicLink() {
    setError(null);
    setStatus(null);

    if (!email) {
      setError("Enter your email first, then request the sign-in link.");
      return;
    }

    setLoading("magic");
    const supabase = createClient();
    const { error: linkError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (linkError) {
      setError(linkError.message);
      setLoading(null);
      return;
    }

    setStatus("Check your email for a secure sign-in link.");
    setLoading(null);
  }

  return (
    <Card className="w-full max-w-md rounded-md">
      <CardHeader>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl">MJG Dashboard Login</CardTitle>
        <CardDescription>Sign in to manage Created for More pilot records and admin workflows.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSignInWithPassword}>
          <label className="block space-y-2 text-sm font-medium">
            <span>Email</span>
            <Input
              autoComplete="email"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Password</span>
            <div className="relative">
              <Input
                autoComplete="current-password"
                className="pr-10"
                name="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Supabase Auth password"
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
          </label>
          {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
          {status ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{status}</p> : null}
          <Button className="w-full" disabled={loading !== null || !email || !password} type="submit">
            {loading === "password" ? "Signing in..." : "Sign in"}
          </Button>
          <Button className="w-full" disabled={loading !== null || !email} onClick={sendMagicLink} type="button" variant="outline">
            <Mail className="h-4 w-4" />
            {loading === "magic" ? "Sending link..." : "Email me a sign-in link"}
          </Button>
        </form>
        <div className="mt-4 border-t pt-4">
          <InstallAppButton
            fullWidth
            responsiveLabel={false}
            label="Install the MJG App"
            caption="Get the app on your desktop or phone — no app store needed."
          />
        </div>
      </CardContent>
    </Card>
  );
}
