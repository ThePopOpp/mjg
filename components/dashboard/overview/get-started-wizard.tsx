"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BarChart3, Bot, Check, Megaphone, Phone, Sparkles, UsersRound, Wand2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { WIDGET_BY_ID, allowed } from "@/lib/dashboard/overview/catalog";
import { card, type OverviewRow } from "@/lib/dashboard/overview/layout";
import type { AppRole } from "@/lib/rbac/roles";
import { WIDGET_UI } from "./widgets";

// Blank mode's setup wizard: pick what you focus on, tick the cards you want,
// choose density, name the view. Builds rows from those choices.

const FOCI = [
  { id: "comms", label: "Calls & Texts", icon: Phone, cards: ["stat.calls", "stat.missed", "stat.sms", "tools.dialpad", "comms.calls", "comms.sms", "comms.email"] },
  { id: "content", label: "Content & Website", icon: Megaphone, cards: ["content.blog", "content.website", "content.social", "rep.traffic", "rep.top-pages", "files.recent"] },
  { id: "community", label: "Community", icon: UsersRound, cards: ["stat.checkins", "stat.messages", "community.metrics", "community.recent-checkins", "comms.dms", "community.invitations"] },
  { id: "sales", label: "Sales & Revenue", icon: BarChart3, cards: ["stat.leads", "stat.signups", "stat.revenue", "pipe.leads", "pipe.recent-leads", "fin.revenue", "fin.orders", "rep.signups"] },
  { id: "ai", label: "AI Agents", icon: Bot, cards: ["alert.agent", "ai.shepherd", "ai.tasks", "ai.dev-requests", "ai.steward"] },
  { id: "me", label: "My Day", icon: Sparkles, cards: ["tasks.my", "calendar.month", "tools.todo", "tools.reminders", "tools.notepad", "tools.recorder", "calendar.upcoming"] },
] as const;

const TOOLBAR = ["toolbar.search", "toolbar.features", "toolbar.clock", "toolbar.weather"];
const ALERTS = ["alert.agent", "alert.next-todo", "alert.jobs"];

export type WizardResult = { rows: OverviewRow[]; density: "comfy" | "compact"; name: string };

export function GetStartedWizard({ open, onOpenChange, role, onFinish }: { open: boolean; onOpenChange: (o: boolean) => void; role: AppRole; onFinish: (r: WizardResult) => void }) {
  const ok = (id: string) => {
    const d = WIDGET_BY_ID.get(id);
    return !!d && allowed(role, d.access);
  };
  const foci = FOCI.map((f) => ({ ...f, cards: f.cards.filter(ok) })).filter((f) => f.cards.length);
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string[]>(["me"]);
  const [chosen, setChosen] = useState<Set<string> | null>(null);
  const [toolbar, setToolbar] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [density, setDensity] = useState<"comfy" | "compact">("comfy");
  const [perRow, setPerRow] = useState(5);
  const [name, setName] = useState("My Dashboard");

  const suggested = useMemo(() => [...new Set(foci.filter((f) => picked.includes(f.id)).flatMap((f) => f.cards))], [foci, picked]);
  const selected = chosen ?? new Set(suggested);

  const finish = () => {
    const rows: OverviewRow[] = [];
    const used = new Set<string>();
    const take = (ids: string[]) => ids.filter((id) => ok(id) && !used.has(id) && (used.add(id), true));
    if (toolbar) rows.push({ id: "w-toolbar", kind: "grid", cards: take(TOOLBAR).map((id) => card(id)) });
    if (alerts) {
      const a = take(ALERTS);
      if (a.length) rows.push({ id: "w-alerts", kind: "grid", title: "Notifications", cards: a.map((id) => card(id)) });
    }
    const all = [...selected];
    const tiles = take(all.filter((id) => WIDGET_BY_ID.get(id)?.tile));
    if (tiles.length) rows.push({ id: "w-stats", kind: "rail", title: "At a Glance", visible: perRow, cards: tiles.map((id) => card(id)) });
    for (const f of foci) {
      const ids = take(f.cards.filter((id) => selected.has(id)));
      if (ids.length) rows.push({ id: `w-${f.id}`, kind: "grid", title: f.label, cards: ids.map((id) => card(id)) });
    }
    onFinish({ rows, density, name: name.trim() || "My Dashboard" });
    setStep(0);
  };

  const steps = ["Focus", "Cards", "Layout", "Name"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The built-in close button sits on the dark header, so it is restyled light. */}
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 [&>button:last-child]:!bg-transparent [&>button:last-child]:!text-[#f4f1ea] [&>button:last-child]:opacity-80">
        <div className="bg-gradient-to-r from-[#141211] to-[#2d261f] px-6 pb-5 pt-6 text-[#f4f1ea]">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e9c991]">
            <Wand2 className="h-3.5 w-3.5" aria-hidden /> Setup wizard
          </p>
          <DialogTitle className="mt-1 text-xl font-semibold">Build your dashboard</DialogTitle>
          <DialogDescription className="text-sm text-[#f4f1ea]/70">Four quick steps. You can change everything afterwards.</DialogDescription>
          <ol className="mt-4 flex gap-2" aria-label="Steps">
            {steps.map((s, i) => (
              <li key={s} className="flex flex-1 flex-col gap-1">
                <span className={cn("h-1 rounded-full", i <= step ? "bg-[#b88a4a]" : "bg-white/15")} />
                <span className={cn("text-[11px]", i === step ? "text-[#f4f1ea]" : "text-[#f4f1ea]/50")} aria-current={i === step ? "step" : undefined}>
                  {i + 1}. {s}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="max-h-[56vh] overflow-y-auto px-6 py-5">
          {step === 0 ? (
            <fieldset>
              <legend className="mb-3 text-sm font-medium">What do you spend your day on? Pick any.</legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {foci.map((f) => {
                  const on = picked.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setPicked((p) => (on ? p.filter((x) => x !== f.id) : [...p, f.id]));
                        setChosen(null);
                      }}
                      className={cn("flex items-center gap-3 rounded-xl border p-3 text-left transition", on ? "border-[#b88a4a] bg-[#b88a4a]/10 ring-1 ring-[#b88a4a]" : "hover:bg-muted")}
                    >
                      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", on ? "bg-[#b88a4a] text-white" : "bg-muted text-muted-foreground")}>
                        <f.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{f.label}</span>
                        <span className="block text-xs text-muted-foreground">{f.cards.length} cards</span>
                      </span>
                      {on ? <Check className="h-4 w-4 text-[#b88a4a]" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm font-medium">Here&apos;s what we suggest. Untick anything you don&apos;t want.</p>
              {suggested.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {suggested.map((id) => {
                    const d = WIDGET_BY_ID.get(id)!;
                    const Icon = WIDGET_UI[id]?.icon;
                    return (
                      <li key={id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-2.5 hover:bg-muted/50">
                          <Checkbox
                            checked={selected.has(id)}
                            onCheckedChange={(v) => {
                              const next = new Set(selected);
                              if (v) next.add(id);
                              else next.delete(id);
                              setChosen(next);
                            }}
                          />
                          {Icon ? <Icon className="h-4 w-4 text-[#b88a4a]" aria-hidden /> : null}
                          <span className="min-w-0 flex-1 truncate text-sm">{d.title}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Go back and pick at least one focus, or finish with just the toolbar.</p>
              )}
              <div className="space-y-2 border-t pt-3">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={toolbar} onCheckedChange={(v) => setToolbar(v === true)} /> Search, All Features, time and weather bar
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={alerts} onCheckedChange={(v) => setAlerts(v === true)} /> Notifications row (AI agent, up next, job alerts)
                </label>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-6">
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Density</legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {(["comfy", "compact"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={density === d}
                      onClick={() => setDensity(d)}
                      className={cn("rounded-xl border p-3 text-left", density === d ? "border-[#b88a4a] ring-1 ring-[#b88a4a]" : "hover:bg-muted")}
                    >
                      <span className={cn("mb-2 grid grid-cols-3", d === "comfy" ? "gap-2" : "gap-1")} aria-hidden>
                        {Array.from({ length: 6 }).map((_, i) => (
                          <span key={i} className={cn("rounded bg-muted", d === "comfy" ? "h-5" : "h-3.5")} />
                        ))}
                      </span>
                      <span className="text-sm font-semibold capitalize">{d}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium" id="per-row">
                    Stat cards visible in a sliding row
                  </label>
                  <span className="text-sm font-semibold tabular-nums">{perRow}</span>
                </div>
                <Slider min={3} max={8} step={0.5} value={[perRow]} onValueChange={([v]) => setPerRow(v)} aria-labelledby="per-row" thumbLabel="Cards per row" />
                <div className="mt-3 flex gap-2 overflow-hidden" aria-hidden>
                  {Array.from({ length: Math.ceil(perRow) }).map((_, i) => (
                    <span key={i} className="h-10 shrink-0 rounded-lg border bg-muted/60" style={{ width: `calc((100% - ${(perRow - 1) * 0.5}rem) / ${perRow})` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium" htmlFor="view-name">
                Name this dashboard
              </label>
              <Input id="view-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
              <p className="text-xs text-muted-foreground">You can keep several dashboards (for example “Calls” and “Content”) and switch between them with the tabs.</p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button type="button" variant="ghost" onClick={() => (step ? setStep(step - 1) : onOpenChange(false))} className="gap-1.5">
            {step ? <ArrowLeft className="h-4 w-4" /> : null} {step ? "Back" : "Skip for now"}
          </Button>
          {step < 3 ? (
            <Button type="button" onClick={() => setStep(step + 1)} className="gap-1.5 bg-[#141211] text-[#f4f1ea] hover:bg-[#2a2622] dark:bg-[#b88a4a] dark:text-white">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="button" onClick={finish} className="gap-1.5 bg-[#b88a4a] text-white hover:bg-[#a47a3e]">
              <Check className="h-4 w-4" /> Build my dashboard
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
