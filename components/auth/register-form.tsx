"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/rbac/roles";
import { cn } from "@/lib/utils";

type Choice = typeof ROLES.PARTICIPANT | typeof ROLES.FACILITATOR;

const CARDS: {
  role: Choice;
  badge: string;
  badgeTone: string;
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  icon: typeof User;
}[] = [
  {
    role: ROLES.PARTICIPANT,
    badge: "Most common",
    badgeTone: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
    title: "Participant",
    subtitle: "Joining a group",
    body: "You're walking through the 6-Week Challenge with a group. You'll get the weekly emails, the videos, and your own check-in results.",
    bullets: [
      "Receive the weekly challenge emails",
      "Watch the video library and work the homework",
      "Track your own Created for More check-in",
    ],
    icon: User,
  },
  {
    role: ROLES.FACILITATOR,
    badge: "Group leader",
    badgeTone: "bg-[#c9aa70]/20 text-[#8a6d33] dark:bg-[#c9aa70]/20 dark:text-[#e2ca9a]",
    title: "Facilitator",
    subtitle: "Leading a group",
    body: "You're leading a group of men through the challenge. You get everything a participant gets, plus a team view and the leader coaching emails.",
    bullets: [
      "Launch a challenge for your group",
      "See your team's progress in one place",
      "Get the leader coaching email series",
    ],
    icon: Users,
  },
];

export function RegisterForm() {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; needsChallengeAccess: boolean } | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    groupName: "",
    churchOrOrg: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!choice) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role: choice }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Registration failed.");
      setDone({ email: data.email, needsChallengeAccess: Boolean(data.needsChallengeAccess) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-[#c9aa70]" />
          <h2 className="font-serif text-2xl font-semibold">You&rsquo;re all set</h2>
          <p className="text-sm text-muted-foreground">
            Your account for <span className="font-medium text-foreground">{done.email}</span> is ready. Sign in to get started.
          </p>
          {done.needsChallengeAccess ? (
            <p className="rounded-md bg-[#c9aa70]/10 px-4 py-3 text-left text-xs leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">One more step for facilitators:</span> before you can launch a
              challenge for your group, a Super Admin needs to grant you access to it. You can sign in and look around in
              the meantime — we&rsquo;ll be in touch.
            </p>
          ) : null}
          <Button asChild className="mt-1 w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Step 1 — pick the account type. The card you choose sets your role.
  if (!choice) {
    return (
      <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.role}
              type="button"
              onClick={() => setChoice(card.role)}
              className="group rounded-xl border bg-card p-6 text-left transition-all hover:-translate-y-0.5 hover:border-[#c9aa70] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9aa70]"
            >
              <div className="flex items-start justify-between">
                <Icon className="h-7 w-7 text-muted-foreground transition-colors group-hover:text-[#c9aa70]" />
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", card.badgeTone)}>{card.badge}</span>
              </div>
              <h3 className="mt-5 font-serif text-2xl font-semibold">{card.title}</h3>
              <p className="text-sm text-muted-foreground">{card.subtitle}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              <ul className="mt-4 space-y-2">
                {card.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#c9aa70]" />
                    {b}
                  </li>
                ))}
              </ul>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9aa70]">
                Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          );
        })}
        <p className="md:col-span-2 text-center text-xs text-muted-foreground">
          Not sure? Most people start as a Participant — you can switch to Facilitator later from your profile.
        </p>
      </div>
    );
  }

  // Step 2 — the details form for the chosen role.
  const card = CARDS.find((c) => c.role === choice)!;
  const isFacilitator = choice === ROLES.FACILITATOR;

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="p-6 sm:p-8">
        <button
          type="button"
          onClick={() => { setChoice(null); setError(null); }}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Choose a different account type
        </button>

        <div className="mb-6 flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
          <card.icon className="h-5 w-5 shrink-0 text-[#c9aa70]" />
          <div>
            <p className="text-sm font-semibold">Registering as a {card.title}</p>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required autoComplete="given-name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required autoComplete="family-name" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required autoComplete="email" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          </div>

          {isFacilitator ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="groupName">Group name <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="groupName" value={form.groupName} onChange={(e) => set("groupName", e.target.value)} placeholder="e.g. Core 5 Group" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="churchOrOrg">Church / organization <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="churchOrOrg" value={form.churchOrOrg} onChange={(e) => set("churchOrOrg", e.target.value)} />
              </div>
            </div>
          ) : null}

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>

          {isFacilitator ? (
            <p className="rounded-md bg-[#c9aa70]/10 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
              Facilitators can sign in right away. Launching a challenge for your group needs a Super Admin to grant you
              access first — we&rsquo;ll reach out.
            </p>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</> : `Create ${card.title} account`}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#c9aa70] hover:underline">Sign in</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
