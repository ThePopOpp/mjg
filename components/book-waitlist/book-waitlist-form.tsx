"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FORMAT_ANY, FORMAT_OPTIONS, type FormatValue } from "@/lib/book-waitlist/repository";
import { cn } from "@/lib/utils";

export function BookWaitlistForm({
  signedIn,
  defaults,
}: {
  signedIn: boolean;
  defaults?: { firstName?: string | null; lastName?: string | null; email?: string | null };
}) {
  const [form, setForm] = useState({
    firstName: defaults?.firstName ?? "",
    lastName: defaults?.lastName ?? "",
    email: defaults?.email ?? "",
    phone: "",
    interest: "",
  });
  const [formats, setFormats] = useState<FormatValue[]>([]);

  // Multi-select, but "Whichever comes first" is exclusive — it contradicts naming editions.
  function toggleFormat(value: FormatValue) {
    setFormats((current) => {
      if (value === FORMAT_ANY) return current.includes(FORMAT_ANY) ? [] : [FORMAT_ANY];
      const next = current.filter((v) => v !== FORMAT_ANY);
      return next.includes(value) ? next.filter((v) => v !== value) : [...next, value];
    });
  }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ hasAccount: boolean; alreadyOnList: boolean } | null>(null);
  const [countdown, setCountdown] = useState(6);

  const set = <K extends keyof typeof form>(k: K, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/book-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, formatPreferences: formats, source: "book_waitlist_page" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setDone({ hasAccount: Boolean(data.hasAccount), alreadyOnList: Boolean(data.alreadyOnList) });

      // No MJG account yet → offer registration, and take them there shortly. Anyone who
      // already has an account just gets the confirmation.
      if (!data.hasAccount) {
        let left = 6;
        const timer = setInterval(() => {
          left -= 1;
          setCountdown(left);
          if (left <= 0) {
            clearInterval(timer);
            window.location.assign("/register");
          }
        }, 1000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <Card className="border-[#b88a4a]/50">
        <CardContent className="space-y-4 p-6 text-center sm:p-8">
          <Check className="mx-auto h-10 w-10 text-[#b88a4a]" />
          <h2 className="font-serif text-2xl font-semibold">
            {done.alreadyOnList ? "You're already on the list" : "You're on the list"}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {done.alreadyOnList
              ? "We've refreshed your details. You'll be among the first to know when The Life You're Building is available."
              : "You'll be among the first to know when The Life You're Building is available, along with early access to launch resources."}
          </p>

          {done.hasAccount ? (
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to your dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          ) : (
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-left">
              <p className="text-sm font-semibold">Create your free MJG account</p>
              <p className="text-sm leading-6 text-muted-foreground">
                An account keeps your waitlist spot, your assessments, and your next steps together in one place.
                Taking you there in {countdown}s…
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button asChild className="w-full">
                  <Link href="/register">Create my account <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">No thanks</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <BookOpen className="h-5 w-5 shrink-0 text-[#b88a4a]" />
          <div>
            <p className="text-sm font-semibold">Join the book waitlist</p>
            <p className="text-xs text-muted-foreground">No cost. Unsubscribe any time.</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bw-first">First name</Label>
              <Input id="bw-first" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} autoComplete="given-name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bw-last">Last name</Label>
              <Input id="bw-last" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} autoComplete="family-name" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bw-email">Email</Label>
            <Input id="bw-email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bw-phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="bw-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          </div>

          <div className="space-y-1.5">
            <Label>
              Preferred format <span className="font-normal text-muted-foreground">(select all that apply)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((f) => {
                const checked = formats.includes(f.value);
                return (
                  <button
                    key={f.value}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleFormat(f.value)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors",
                      checked ? "border-[#b88a4a] bg-[#b88a4a]/10" : "hover:border-[#b88a4a]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        checked ? "border-[#b88a4a] bg-[#b88a4a] text-white" : "border-input",
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bw-interest">What are you hoping this book helps with? <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="bw-interest" value={form.interest} onChange={(e) => set("interest", e.target.value)} className="min-h-20" />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding you…</> : "Join the waitlist"}
          </Button>

          {!signedIn ? (
            <p className="text-center text-xs text-muted-foreground">
              Already have an account? <Link href="/login" className="font-semibold text-[#b88a4a] hover:underline">Sign in</Link> first and we&rsquo;ll link this to it.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
