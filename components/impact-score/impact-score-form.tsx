"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type Category = {
  icon: string;
  title: string;
  description: string;
};

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
  { icon: "star", title: "Financial Education", description: "Teaching Biblical stewardship principles to individuals & families" },
  { icon: "clock", title: "Intentional Giving", description: "Empowering generous, purposeful charitable contributions" },
  { icon: "refresh", title: "Impact Investing", description: "Aligning investments with values for lasting community transformation" },
  { icon: "users", title: "Community Building", description: "A movement of 25,000 inspired, purposeful stewards" },
];

function toDateInputValue(raw?: string) {
  if (!raw) return new Date().toISOString().slice(0, 10);
  return raw.slice(0, 10);
}

export function ImpactScoreForm({ score, actionToken }: Props) {
  const [scoreDate, setScoreDate] = useState(toDateInputValue(score?.score_date));
  const [totalAmount, setTotalAmount] = useState(String(score?.total_amount ?? "96061108000"));
  const [goalLabel, setGoalLabel] = useState(score?.goal_label ?? "$1 Billion");
  const [headline, setHeadline] = useState(score?.headline ?? "Tracking Progress Towards");
  const [bodyText, setBodyText] = useState(score?.body_text ?? "");
  const [notes, setNotes] = useState(score?.notes ?? "");
  const [published, setPublished] = useState(score?.published ?? false);
  const [categories, setCategories] = useState<Category[]>(
    score?.categories?.length ? score.categories : DEFAULT_CATEGORIES,
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  function updateCategory(index: number, field: keyof Category, value: string) {
    setCategories((prev) => prev.map((cat, i) => (i === index ? { ...cat, [field]: value } : cat)));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/impact-score", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({
          scoreDate,
          totalAmount: Number(totalAmount.replace(/[^0-9.]/g, "")),
          goalLabel,
          headline,
          bodyText,
          notes,
          published,
          categories,
        }),
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
      <Card>
        <CardHeader>
          <CardTitle>Score details</CardTitle>
          <CardDescription>The headline numbers shown on the Mission page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">
            <span>Score date</span>
            <Input type="date" value={scoreDate} onChange={(e) => setScoreDate(e.target.value)} required />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Total amount ($)</span>
            <Input type="text" inputMode="decimal" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="96061108000" required />
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

      <Card>
        <CardHeader>
          <CardTitle>Impact categories</CardTitle>
          <CardDescription>The four pillars shown below the score. Icon names: star, clock, refresh, users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map((cat, i) => (
            <div key={i} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[80px_1fr_2fr]">
              <label className="space-y-1 text-sm font-medium">
                <span>Icon</span>
                <Input value={cat.icon} onChange={(e) => updateCategory(i, "icon", e.target.value)} placeholder="star" />
              </label>
              <label className="space-y-1 text-sm font-medium">
                <span>Title</span>
                <Input value={cat.title} onChange={(e) => updateCategory(i, "title", e.target.value)} placeholder="Financial Education" />
              </label>
              <label className="space-y-1 text-sm font-medium">
                <span>Description</span>
                <Input value={cat.description} onChange={(e) => updateCategory(i, "description", e.target.value)} placeholder="Short description…" />
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admin notes &amp; publish</CardTitle>
          <CardDescription>Notes are internal only and not shown on the frontend.</CardDescription>
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
