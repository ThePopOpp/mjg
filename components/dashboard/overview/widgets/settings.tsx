"use client";

import Link from "next/link";
import { BellRing, Check, CircleUserRound, Palette, Rocket, Wand2, X } from "lucide-react";
import { FrequencyCard } from "@/components/facilitator/frequency-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useFabVisible } from "@/components/layout/fab-visibility";
import { cn } from "@/lib/utils";
import { useOverview } from "../overview-context";
import { useWidgetData } from "../use-widget-data";
import { Load, WidgetCard, type WidgetProps } from "./kit";

type Steps = { steps: { id: string; label: string; done: boolean; href?: string; action?: "customize" }[]; done: number; total: number };

function Progress({ value, total, dark = false }: { value: number; total: number; dark?: boolean }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-2 flex-1 overflow-hidden rounded-full", dark ? "bg-white/15" : "bg-muted")} role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={value} aria-label="Setup progress">
        <div className="h-full rounded-full bg-[#b88a4a] transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-xs font-medium tabular-nums", dark ? "text-[#f4f1ea]/70" : "text-muted-foreground")}>
        {value}/{total}
      </span>
    </div>
  );
}

export function GetStartedWidget({ card }: WidgetProps) {
  const { profile, startCustomize, openWizard, openFeatures, hideCard, layout } = useOverview();
  const state = useWidgetData<Steps>("getstarted");
  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();
  return (
    <section aria-label="Get Started" className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-[#141211] via-[#1f1b18] to-[#2d261f] p-5 text-[#f4f1ea] shadow-sm sm:p-6">
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#b88a4a]/30 blur-3xl" />
      <button type="button" onClick={() => hideCard(card.uid)} className="absolute right-3 top-3 rounded-md p-1.5 text-[#f4f1ea]/60 hover:bg-white/10 hover:text-[#f4f1ea]" aria-label="Hide Get Started">
        <X className="h-4 w-4" />
      </button>
      <div className="relative grid gap-5 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e9c991]">Get Started</p>
          <h2 className="mt-1.5 text-balance font-display text-2xl font-medium leading-tight sm:text-[28px]">
            {greeting}
            {profile.firstName ? `, ${profile.firstName}` : ""}.
          </h2>
          <p className="mt-1.5 max-w-md text-pretty text-sm text-[#f4f1ea]/70">Finish a few steps and shape this dashboard around the work you do every day.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={startCustomize} className="gap-2 bg-[#b88a4a] text-white hover:bg-[#a47a3e]">
              <Wand2 className="h-4 w-4" aria-hidden /> Customize
            </Button>
            <Button type="button" variant="outline" onClick={layout.mode === "blank" ? openWizard : openFeatures} className="gap-2 border-white/25 bg-transparent text-[#f4f1ea] hover:bg-white/10 hover:text-[#f4f1ea]">
              <Rocket className="h-4 w-4" aria-hidden /> {layout.mode === "blank" ? "Setup wizard" : "Explore features"}
            </Button>
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.06] p-4 ring-1 ring-white/10">
          {state.data ? (
            <>
              <Progress value={state.data.done} total={state.data.total} dark />
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {state.data.steps.map((s) => {
                  const body = (
                    <>
                      <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full border", s.done ? "border-[#b88a4a] bg-[#b88a4a] text-white" : "border-white/30")}>
                        {s.done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                      </span>
                      <span className={cn("text-sm", s.done && "text-[#f4f1ea]/50 line-through")}>{s.label}</span>
                    </>
                  );
                  return (
                    <li key={s.id}>
                      {s.action === "customize" ? (
                        <button type="button" onClick={startCustomize} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-white/10">
                          {body}
                        </button>
                      ) : (
                        <Link href={s.href ?? "/dashboard"} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/10">
                          {body}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <div className="h-28 animate-pulse rounded-lg bg-white/10" />
          )}
        </div>
      </div>
    </section>
  );
}

export function AppearanceWidget() {
  const fab = useFabVisible();
  return (
    <WidgetCard icon={Palette} title="Appearance">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">Light or dark theme</span>
          <ThemeToggle />
        </div>
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">Show the help button</span>
          <Switch checked={fab.visible ?? true} disabled={!fab.ready} onCheckedChange={fab.setVisible} />
        </label>
      </div>
    </WidgetCard>
  );
}

export function NotifySettingsWidget() {
  return (
    <WidgetCard icon={BellRing} title="Notification Settings" href="/dashboard/settings" hrefLabel="All settings" bodyClassName="[&>div]:border-0 [&>div]:shadow-none">
      <FrequencyCard />
    </WidgetCard>
  );
}

export function ProfileWidget() {
  const { profile } = useOverview();
  const state = useWidgetData<Steps>("getstarted");
  return (
    <WidgetCard icon={CircleUserRound} title="Profile" href="/dashboard/profile" hrefLabel="Edit">
      <div className="flex items-center gap-3">
        <UserAvatar firstName={profile.firstName} lastName={profile.lastName} email={profile.email} avatarUrl={profile.avatarUrl} className="h-12 w-12" />
        <div className="min-w-0">
          <p className="truncate font-medium">{`${profile.firstName} ${profile.lastName}`.trim() || "Your name"}</p>
          <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
        </div>
      </div>
      <div className="mt-3">
        <Load state={state} rows={1}>
          {(d) => {
            const profileSteps = d.steps.filter((s) => s.href === "/dashboard/profile");
            const done = profileSteps.filter((s) => s.done).length;
            return (
              <>
                <Progress value={done} total={profileSteps.length} />
                <p className="mt-1 text-xs text-muted-foreground">{done === profileSteps.length ? "Your profile is complete." : `Next: ${profileSteps.find((s) => !s.done)?.label.toLowerCase()}`}</p>
              </>
            );
          }}
        </Load>
      </div>
    </WidgetCard>
  );
}
