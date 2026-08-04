"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Shell><p className="text-center text-sm text-muted-foreground">Loading…</p></Shell>}>
      <ResetInner />
    </Suspense>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1eee7] px-4 py-10 dark:bg-background">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_black_white.png" alt="Michael J. Gauthier" className="mx-auto mb-2 h-10 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/mjg-logos/mjg_white.png" alt="" className="mx-auto mb-2 hidden h-10 w-auto dark:block" />
          <p className="text-[11px] tracking-[0.22em] text-foreground">MICHAEL J. GAUTHIER</p>
        </div>
        {children}
      </div>
    </main>
  );
}

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [phase, setPhase] = useState<"verifying" | "ready" | "error" | "done">("verifying");
  const [error, setError] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function run() {
      const tokenHash = params.get("token_hash");
      const type = params.get("type") || "recovery";
      if (tokenHash) {
        const { error: vErr } = await supabase.auth.verifyOtp({ type: type as "recovery", token_hash: tokenHash });
        if (!active) return;
        if (vErr) { setError("This reset link is invalid or has expired. Ask an admin to send a new one."); setPhase("error"); return; }
        setPhase("ready"); return;
      }
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      if (data.user) setPhase("ready"); else { setError("This reset link is invalid or has expired."); setPhase("error"); }
    }
    run();
    return () => { active = false; };
  }, [params, supabase]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (pw.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (pw !== pw2) { setError("Passwords do not match."); return; }
    setBusy(true);
    const { error: uErr } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (uErr) { setError(uErr.message); return; }
    setPhase("done");
    setTimeout(() => router.push("/dashboard"), 1600);
  }

  if (phase === "verifying") return <Shell><p className="text-center text-sm text-muted-foreground">Verifying your reset link…</p></Shell>;
  if (phase === "error") return (
    <Shell>
      <h1 className="mb-2 text-lg font-semibold">Reset link problem</h1>
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button asChild className="mt-5 w-full"><a href="/login">Back to sign in</a></Button>
    </Shell>
  );
  if (phase === "done") return (
    <Shell>
      <h1 className="mb-2 text-lg font-semibold">Password updated</h1>
      <p className="text-sm text-muted-foreground">You're all set — taking you to your dashboard…</p>
    </Shell>
  );

  return (
    <Shell>
      <h1 className="mb-1 text-lg font-semibold">Set a new password</h1>
      <p className="mb-5 text-sm text-muted-foreground">Choose a new password for your account.</p>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5"><label className="text-sm font-medium">New password</label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required /></div>
        <div className="space-y-1.5"><label className="text-sm font-medium">Confirm password</label><Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" required /></div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Saving…" : "Update password"}</Button>
      </form>
    </Shell>
  );
}
