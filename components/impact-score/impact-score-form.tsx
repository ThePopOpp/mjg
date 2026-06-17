"use client";

import { useState } from "react";
import {
  Award,
  BookOpen,
  Building2,
  Clock,
  DollarSign,
  Gift,
  Globe,
  Heart,
  Leaf,
  RefreshCw,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Icon catalogue ─────────────────────────────────────────────────────────────
const ICON_OPTIONS = [
  { name: "star",        Icon: Star,       label: "Star" },
  { name: "clock",       Icon: Clock,      label: "Clock" },
  { name: "refresh",     Icon: RefreshCw,  label: "Refresh" },
  { name: "users",       Icon: Users,      label: "Users" },
  { name: "heart",       Icon: Heart,      label: "Heart" },
  { name: "globe",       Icon: Globe,      label: "Globe" },
  { name: "trending-up", Icon: TrendingUp, label: "Trending" },
  { name: "target",      Icon: Target,     label: "Target" },
  { name: "book",        Icon: BookOpen,   label: "Book" },
  { name: "dollar",      Icon: DollarSign, label: "Dollar" },
  { name: "award",       Icon: Award,      label: "Award" },
  { name: "gift",        Icon: Gift,       label: "Gift" },
  { name: "leaf",        Icon: Leaf,       label: "Leaf" },
  { name: "shield",      Icon: Shield,     label: "Shield" },
  { name: "building",    Icon: Building2,  label: "Building" },
] as const;

type IconName = (typeof ICON_OPTIONS)[number]["name"];

// ── Date helpers ───────────────────────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(currentYear - 2 + i));

function dateToparts(raw?: string): { month: string; day: string; year: string } {
  if (!raw) {
    const n = new Date();
    return { month: String(n.getMonth() + 1), day: String(n.getDate()), year: String(n.getFullYear()) };
  }
  const d = new Date(raw + "T12:00:00Z");
  return { month: String(d.getUTCMonth() + 1), day: String(d.getUTCDate()), year: String(d.getUTCFullYear()) };
}

function partsToIso(month: string, day: string, year: string) {
  const m = String(month).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

// ── Dollar formatting ──────────────────────────────────────────────────────────
function formatDollars(raw: string): string {
  const stripped = raw.replace(/[^0-9]/g, "");
  if (!stripped) return "";
  return Number(stripped).toLocaleString("en-US");
}

function parseDollars(formatted: string): string {
  return formatted.replace(/[^0-9]/g, "");
}

// ── Types ──────────────────────────────────────────────────────────────────────
type Category = { icon: string; title: string; description: string };

type Props = {
  score: {
    score_date?: string;
    total_amount?: number;
    goal_label?: string;
    headline?: string;
    body_text?: string;
    notes?: string;
    published?: boolean;
    categories?: Category[];
  } | null;
  actionToken: string;
};

const DEFAULT_CATEGORIES: Category[] = [
  { icon: "star",    title: "Financial Education", description: "Teaching Biblical stewardship principles to individuals & families" },
  { icon: "clock",   title: "Intentional Giving",  description: "Empowering generous, purposeful charitable contributions" },
  { icon: "refresh", title: "Impact Investing",    description: "Aligning investments with values for lasting community transformation" },
  { icon: "users",   title: "Community Building",  description: "A movement of 25,000 inspired, purposeful stewards" },
];

// ── Icon picker ────────────────────────────────────────────────────────────────
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ICON_OPTIONS.map(({ name, Icon, label }) => (
        <button
          key={name}
          type="button"
          title={label}
          onClick={() => onChange(name)}
          className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors ${
            value === name
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          <Icon className="h-5 w-5" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main form ──────────────────────────────────────────────────────────────────
export function ImpactScoreForm({ score, actionToken }: Props) {
  const initDate = dateToparts(score?.score_date);
  const [dateMonth, setDateMonth] = useState(initDate.month);
  const [dateDay,   setDateDay]   = useState(initDate.day);
  const [dateYear,  setDateYear]  = useState(initDate.year);

  const [amountDisplay, setAmountDisplay] = useState(
    score?.total_amount ? Number(score.total_amount).toLocaleString("en-US") : ""
  );
  const [goalLabel, setGoalLabel] = useState(score?.goal_label ?? "$1 Billion");
  const [headline,  setHeadline]  = useState(score?.headline ?? "Tracking Progress Towards");
  const [bodyText,  setBodyText]  = useState(score?.body_text ?? "");
  const [notes,     setNotes]     = useState(score?.notes ?? "");
  const [published, setPublished] = useState(score?.published ?? false);
  const [categories, setCategories] = useState<Category[]>(
    score?.categories?.length ? score.categories : DEFAULT_CATEGORIES
  );
  const [saving,   setSaving]   = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function updateCategory(index: number, field: keyof Category, value: string) {
    setCategories((prev) => prev.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const scoreDate = partsToIso(dateMonth, dateDay, dateYear);
      const totalAmount = Number(parseDollars(amountDisplay));
      const res = await fetch("/api/admin/impact-score", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ scoreDate, totalAmount, goalLabel, headline, bodyText, notes, published, categories, actionToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save.");
      setFeedback({ ok: true, message: "Impact score saved successfully." });
    } catch (err) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Score details ── */}
      <Card>
        <CardHeader>
          <CardTitle>Score details</CardTitle>
          <CardDescription>The headline numbers shown on the Mission page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          {/* Date */}
          <div className="space-y-2">
            <span className="block text-sm font-medium">Score date</span>
            <div className="grid grid-cols-3 gap-2">
              <Select value={dateMonth} onValueChange={setDateMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateDay} onValueChange={setDateDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateYear} onValueChange={setDateYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount */}
          <label className="space-y-2 text-sm font-medium">
            <span>Total amount</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                className="pl-7"
                inputMode="numeric"
                value={amountDisplay}
                onChange={(e) => setAmountDisplay(formatDollars(e.target.value))}
                placeholder="96,061,108,000"
                required
              />
            </div>
          </label>

          <label className="space-y-2 text-sm font-medium">
            <span>Goal label</span>
            <Input value={goalLabel} onChange={(e) => setGoalLabel(e.target.value)} placeholder="$1 Billion" required />
          </label>

          <label className="space-y-2 text-sm font-medium">
            <span>Headline</span>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Tracking Progress Towards" required />
          </label>

          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            <span>Body text</span>
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Every dollar given…"
            />
          </label>
        </CardContent>
      </Card>

      {/* ── Impact categories ── */}
      <Card>
        <CardHeader>
          <CardTitle>Impact categories</CardTitle>
          <CardDescription>The four pillars shown below the score on the Mission page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {categories.map((cat, i) => (
            <div key={i} className="space-y-3 rounded-lg border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium">
                  <span>Title</span>
                  <Input value={cat.title} onChange={(e) => updateCategory(i, "title", e.target.value)} placeholder="Financial Education" />
                </label>
                <label className="space-y-1 text-sm font-medium">
                  <span>Description</span>
                  <Input value={cat.description} onChange={(e) => updateCategory(i, "description", e.target.value)} placeholder="Short description…" />
                </label>
              </div>
              <div className="space-y-2">
                <span className="block text-sm font-medium">Icon</span>
                <IconPicker value={cat.icon} onChange={(v) => updateCategory(i, "icon", v)} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Notes & publish ── */}
      <Card>
        <CardHeader>
          <CardTitle>Admin notes &amp; publish</CardTitle>
          <CardDescription>Notes are internal only and not shown on the public site.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <label className="space-y-2 text-sm font-medium">
            <span>Admin notes</span>
            <textarea
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional internal notes…"
            />
          </label>
          <div className="flex items-center gap-3">
            <Switch id="published" checked={published} onCheckedChange={setPublished} />
            <label htmlFor="published" className="cursor-pointer text-sm font-medium">
              {published ? "Published — live on Mission page" : "Unpublished — hidden from site"}
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save impact score"}
        </Button>
        {feedback ? (
          <p className={`text-sm font-medium ${feedback.ok ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
            {feedback.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
