"use client";

import * as React from "react";
import { Check, Loader2, Send, CalendarClock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { composePostText, extractMergeFields, applyMergeFields, normalizeHashtag } from "@/lib/social-media/render";
import { PLATFORM_MAP, platformLabel } from "@/lib/social-media/constants";
import type { SocialAccount, SocialTemplate } from "@/lib/social-media/types";

const pad = (n: number) => String(n).padStart(2, "0");
const TIME_OPTS = Array.from({ length: 96 }, (_, i) => {
  const h = Math.floor(i / 4), m = (i % 4) * 15, v = `${pad(h)}:${pad(m)}`;
  const ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
  return { value: v, label: `${h12}:${pad(m)} ${ap}` };
});

type Mode = "draft" | "schedule" | "now";

export function SocialComposer({ accounts, templates, initialTemplateId }: {
  accounts: SocialAccount[]; templates: SocialTemplate[]; initialTemplateId?: string;
}) {
  const token = useDashboardActionToken();
  const [accountId, setAccountId] = React.useState(accounts[0]?.id ?? "");
  const [templateId, setTemplateId] = React.useState(initialTemplateId ?? "");
  const [body, setBody] = React.useState("");
  const [hashtags, setHashtags] = React.useState("");
  const [media, setMedia] = React.useState("");
  const [link, setLink] = React.useState("");
  const [merge, setMerge] = React.useState<Record<string, string>>({});
  const [mode, setMode] = React.useState<Mode>("draft");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("09:00");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);

  const account = accounts.find((a) => a.id === accountId) ?? null;
  const platform = account?.platform ?? "";

  function applyTemplate(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setBody(t.body_text);
    setHashtags(t.hashtags.join(" "));
    setMedia(t.media_urls.join("\n"));
    setLink(t.link_url ?? "");
    if (t.platforms.length) {
      const match = accounts.find((a) => t.platforms.includes(a.platform));
      if (match) setAccountId(match.id);
    }
  }

  const mergeFields = React.useMemo(() => extractMergeFields(body), [body]);
  const tagList = hashtags.split(/[\s,]+/).map(normalizeHashtag).filter(Boolean);
  const mediaList = media.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const finalBody = applyMergeFields(body, merge);
  const preview = composePostText(finalBody, tagList);
  const limit = platform ? PLATFORM_MAP[platform]?.charLimit ?? null : null;
  const over = limit != null && preview.length > limit;

  const accountOpts = accounts.length
    ? accounts.map((a) => ({ value: a.id, label: `${a.display_name} (${platformLabel(a.platform)})` }))
    : [{ value: "", label: "No accounts — add one in Settings" }];
  const templateOpts = [{ value: "", label: "Start from scratch" }, ...templates.map((t) => ({ value: t.id, label: t.name }))];

  async function submit() {
    setBusy(true); setError(null); setDone(null);
    try {
      if (!account) throw new Error("Choose an account first (add one in Settings).");
      if (!body.trim()) throw new Error("Write some post copy first.");
      const scheduled_at = mode === "schedule" ? new Date(`${date}T${time}:00`).toISOString() : null;
      if (mode === "schedule" && !date) throw new Error("Pick a date to schedule.");

      const res = await fetch("/api/admin/social-media/posts", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          account_id: account.id, platform: account.platform, template_id: templateId || null,
          body_text: finalBody, hashtags: tagList, media_urls: mediaList, link_url: link || null,
          status: mode === "schedule" ? "scheduled" : "draft", scheduled_at, merge_data: merge, actionToken: token,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to create post.");

      if (mode === "now") {
        const pub = await fetch("/api/admin/social-media/publish", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: json.post.id, actionToken: token }) });
        const pj = await pub.json().catch(() => ({}));
        if (!pub.ok) throw new Error(pj.error || "Saved as draft, but publishing failed.");
        setDone("Published! View it under History.");
      } else if (mode === "schedule") {
        setDone(`Scheduled for ${new Date(scheduled_at!).toLocaleString()}.`);
      } else {
        setDone("Saved as a draft. Find it under History to schedule or publish.");
      }
      setBody(""); setHashtags(""); setMedia(""); setLink(""); setMerge({}); setTemplateId("");
    } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
    finally { setBusy(false); }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Account</label><FieldSelect value={accountId} onChange={setAccountId} options={accountOpts} /></div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Template</label><FieldSelect value={templateId} onChange={applyTemplate} options={templateOpts} /></div>
        </div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Post copy</label><Textarea value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[140px]" placeholder="What do you want to share?" /></div>
        {mergeFields.length > 0 && (
          <div className="rounded-lg border border-border p-2.5">
            <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">Fill in merge fields</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {mergeFields.map((f) => (
                <div key={f}><label className="mb-0.5 block text-[11px] text-muted-foreground">{f}</label><Input value={merge[f] ?? ""} onChange={(e) => setMerge((m) => ({ ...m, [f]: e.target.value }))} className="h-8" /></div>
              ))}
            </div>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Hashtags</label><Input value={hashtags} onChange={(e) => setHashtags(e.target.value)} placeholder="#Stewardship #Faith" /></div>
          <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Link URL</label><Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" /></div>
        </div>
        <div><label className="mb-1 block text-xs font-medium text-muted-foreground">Media URLs (one per line)</label><Textarea value={media} onChange={(e) => setMedia(e.target.value)} className="min-h-[56px]" placeholder="https://…/image.jpg" /></div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center justify-between"><span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Preview</span><span className={cn("text-[11px]", over ? "font-semibold text-destructive" : "text-muted-foreground")}>{preview.length}{limit != null ? ` / ${limit}` : ""}</span></div>
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center gap-2"><div className="h-7 w-7 rounded-full bg-primary/15" /><div><div className="text-xs font-semibold leading-none">{account?.display_name ?? "—"}</div><div className="text-[10px] text-muted-foreground">{platform ? platformLabel(platform) : "No platform"}</div></div></div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{preview || <span className="text-muted-foreground">Your post preview appears here.</span>}</div>
            {mediaList.length > 0 && <div className="mt-2 grid grid-cols-2 gap-1">{mediaList.slice(0, 4).map((u, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={u} alt="" className="aspect-square w-full rounded object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
            ))}</div>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">When to post</div>
          <div className="space-y-1.5">
            {([["draft", "Save as draft", FileText], ["schedule", "Schedule", CalendarClock], ["now", "Publish now", Send]] as [Mode, string, React.ElementType][]).map(([m, label, Icon]) => (
              <label key={m} className={cn("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm", mode === m ? "border-primary bg-primary/5" : "border-border")}>
                <input type="radio" className="accent-primary" checked={mode === m} onChange={() => setMode(m)} />
                <Icon className="h-4 w-4 text-muted-foreground" /> {label}
              </label>
            ))}
          </div>
          {mode === "schedule" && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <DatePicker value={date} onChange={setDate} allowClear={false} />
              <FieldSelect value={time} onChange={setTime} options={TIME_OPTS} />
            </div>
          )}
          {mode === "now" && account?.status !== "connected" && (
            <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">This account isn&apos;t marked connected — publishing will fail until you finish setup in Settings.</p>
          )}
        </div>

        {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
        {done && <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"><Check className="h-4 w-4" /> {done}</div>}
        <Button className="w-full" onClick={submit} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {mode === "now" ? "Publish now" : mode === "schedule" ? "Schedule post" : "Save draft"}</Button>
      </div>
    </div>
  );
}
