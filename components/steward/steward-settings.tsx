"use client";

import * as React from "react";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// The Steward settings console.
//
// Two things this screen does differently from a normal settings page, both
// because of how the docset treats unset values:
//
//   1. "Not set" is a FIRST-CLASS state, shown as a decision still owed rather
//      than as an empty field. The typed config readers throw on a null, so a
//      feature that needs one of these cannot quietly run on a guessed default.
//      Showing that plainly is the point — it is a list of what is still owed.
//
//   2. A value can exist and still not be cleared for production. The
//      "Cleared for real member content" switch is separate from the value, so
//      a model can be set and used in staging while the provider review the
//      handoff notice requires is still outstanding.

export type ConfigRow = {
  id: string;
  key: string;
  value: unknown;
  value_type: string;
  label: string;
  description: string;
  config_group: string;
  production_enabled: boolean;
  updated_at: string;
};

/** Options for keys where free text would invite a typo with consequences. */
const CHOICES: Record<string, { value: string; label: string; note?: string }[]> = {
  "agent.model.provider": [
    { value: "openai", label: "OpenAI", note: "In use today" },
    { value: "anthropic", label: "Anthropic (Claude)" },
    { value: "openrouter", label: "OpenRouter", note: "Routes to third parties — widens the privacy review" },
  ],
};

const RETENTION_PRESETS = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
  { days: 365, label: "12 months" },
];

function toDisplay(row: ConfigRow): string {
  if (row.value === null || row.value === undefined) return "";
  if (typeof row.value === "string") return row.value;
  return JSON.stringify(row.value);
}

export function StewardSettings({ rows }: { rows: ConfigRow[] }) {
  const [state, setState] = React.useState<ConfigRow[]>(rows);
  const [drafts, setDrafts] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((r) => [r.key, toDisplay(r)])),
  );
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [savedKey, setSavedKey] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function save(key: string, rawValue: string | null, productionEnabled?: boolean) {
    setBusyKey(key);
    setError(null);
    setSavedKey(null);

    const row = state.find((r) => r.key === key)!;
    let value: unknown = rawValue;

    if (rawValue === null || rawValue.trim() === "") {
      value = null;
    } else if (row.value_type === "number" || row.value_type.startsWith("duration")) {
      const n = Number(rawValue);
      if (!Number.isFinite(n)) {
        setError(`${row.label} must be a number.`);
        setBusyKey(null);
        return;
      }
      value = n;
    } else if (row.value_type === "boolean") {
      value = rawValue === "true";
    } else if (row.value_type === "json") {
      try {
        value = JSON.parse(rawValue);
      } catch {
        setError(`${row.label} must be valid JSON.`);
        setBusyKey(null);
        return;
      }
    }

    try {
      const res = await fetch("/api/dashboard/steward/config", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, value, productionEnabled }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Could not save.");

      setState((s) => s.map((r) => (r.key === key ? (json.row as ConfigRow) : r)));
      setDrafts((d) => ({ ...d, [key]: toDisplay(json.row as ConfigRow) }));
      setSavedKey(key);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusyKey(null);
    }
  }

  const unset = state.filter((r) => r.value === null || r.value === undefined);
  const groups = Array.from(new Set(state.map((r) => r.config_group)));

  return (
    <div className="space-y-8">
      {unset.length > 0 ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-semibold">
                {unset.length} {unset.length === 1 ? "decision" : "decisions"} still owed
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                These ship deliberately unset. Anything that needs one refuses to run rather than guessing a
                default, so leaving them blank is safe — it just keeps that feature switched off.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{group}</h2>

          {/* Two up on a wide dashboard: these cards are short and the page is
              full width, so a single column leaves most of it empty. */}
          <div className="mt-3 grid gap-5 lg:grid-cols-2">
            {state
              .filter((r) => r.config_group === group)
              .map((row) => {
                  const isUnset = row.value === null || row.value === undefined;
                  const choices = CHOICES[row.key];
                  const isRetention = row.key === "retention.conversation_days";

                return (
                  <Card key={row.key} className="flex h-full flex-col">
                    <CardContent className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold">{row.label}</p>
                            {isUnset ? (
                              <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-500">
                                Not set
                              </Badge>
                            ) : null}
                            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                              {row.key}
                            </code>
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{row.description}</p>
                        </div>

                        {savedKey === row.key ? (
                          <span className="flex items-center gap-1 text-[12px] font-medium text-[#b88a4a]">
                            <Check className="h-3.5 w-3.5" /> Saved
                          </span>
                        ) : null}
                      </div>

                      <div className="mb-5 mt-4 flex flex-wrap items-center gap-2">
                        {choices ? (
                          choices.map((choice) => (
                            <Button
                              key={choice.value}
                              size="sm"
                              variant={toDisplay(row) === choice.value ? "default" : "outline"}
                              disabled={busyKey !== null}
                              onClick={() => void save(row.key, choice.value)}
                              className={cn(
                                "h-8",
                                toDisplay(row) === choice.value && "bg-[#b88a4a] text-white hover:bg-[#a67c42]",
                              )}
                              title={choice.note}
                            >
                              {choice.label}
                            </Button>
                          ))
                        ) : (
                          <>
                            {isRetention
                              ? RETENTION_PRESETS.map((preset) => (
                                  <Button
                                    key={preset.days}
                                    size="sm"
                                    variant={Number(toDisplay(row)) === preset.days ? "default" : "outline"}
                                    disabled={busyKey !== null}
                                    onClick={() => void save(row.key, String(preset.days))}
                                    className={cn(
                                      "h-8",
                                      Number(toDisplay(row)) === preset.days &&
                                        "bg-[#b88a4a] text-white hover:bg-[#a67c42]",
                                    )}
                                  >
                                    {preset.label}
                                  </Button>
                                ))
                              : null}

                            <Input
                              value={drafts[row.key] ?? ""}
                              onChange={(e) => setDrafts((d) => ({ ...d, [row.key]: e.target.value }))}
                              placeholder={isUnset ? "Not set" : ""}
                              aria-label={row.label}
                              className="h-8 max-w-[18rem] text-sm"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              disabled={busyKey !== null || (drafts[row.key] ?? "") === toDisplay(row)}
                              onClick={() => void save(row.key, drafts[row.key] ?? "")}
                            >
                              {busyKey === row.key ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                              Save
                            </Button>
                          </>
                        )}

                        {!isUnset ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-muted-foreground"
                            disabled={busyKey !== null}
                            onClick={() => void save(row.key, null)}
                          >
                            Clear
                          </Button>
                        ) : null}
                      </div>

                      {/* Separate from the value on purpose: a setting can be in
                          use on staging while the provider review this depends
                          on is still outstanding. */}
                      <div className="mt-auto flex items-center gap-2.5 border-t pt-4">
                        <Switch
                          id={`prod-${row.key}`}
                          checked={row.production_enabled}
                          disabled={busyKey !== null || isUnset}
                          onCheckedChange={(checked) => void save(row.key, drafts[row.key] ?? null, checked)}
                        />
                        <Label htmlFor={`prod-${row.key}`} className="text-[13px] font-normal text-muted-foreground">
                          Cleared for real member content
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
