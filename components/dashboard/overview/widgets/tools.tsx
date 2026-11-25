"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Calculator, Clock3, Link2, Mic, NotebookPen, Phone, Plus, Square, Trash2, Wand2, X } from "lucide-react";
import { Softphone } from "@/components/dialer/softphone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";
import type { PersonalItem } from "@/lib/dashboard/overview/items";
import { useOverview } from "../overview-context";
import { invalidateWidget, useWidgetData } from "../use-widget-data";
import { Empty, Load, WidgetCard, relTime, type WidgetProps } from "./kit";

// ── Dialpad ──────────────────────────────────────────────────────────────────
export function DialpadWidget() {
  return (
    <WidgetCard icon={Phone} title="Dialpad" href="/dashboard/dialer" hrefLabel="Dialer">
      <Softphone />
    </WidgetCard>
  );
}

// ── Voice recorder ───────────────────────────────────────────────────────────
export function RecorderWidget() {
  const token = useDashboardActionToken();
  const { role } = useOverview();
  const state = useWidgetData<{ items: PersonalItem[] }>("items");
  const [extra, setExtra] = useState<PersonalItem[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<{ mr: MediaRecorder; chunks: Blob[]; stream: MediaStream; raf: number; timer: number; ctx: AudioContext } | null>(null);

  const memos = [...extra, ...(state.data?.items ?? [])].filter((i, idx, arr) => i.kind === "recording" && !removed.has(i.id) && arr.findIndex((x) => x.id === i.id) === idx);
  const canTranscribe = !["participant", "facilitator", "church_admin"].includes(role);

  useEffect(() => () => stopTracks(), []);
  function stopTracks() {
    const r = rec.current;
    if (!r) return;
    cancelAnimationFrame(r.raf);
    window.clearInterval(r.timer);
    r.stream.getTracks().forEach((t) => t.stop());
    r.ctx.close().catch(() => undefined);
  }

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
      const mr = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      // A live level meter so it's obvious the mic is hearing you.
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let peak = 0;
        for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
        setLevel(peak / 128);
        if (rec.current) rec.current.raf = requestAnimationFrame(tick);
      };
      const timer = window.setInterval(() => setSeconds((s) => s + 1), 1000);
      rec.current = { mr, chunks, stream, raf: 0, timer, ctx };
      rec.current.raf = requestAnimationFrame(tick);
      mr.start(250);
      setSeconds(0);
      setRecording(true);
    } catch {
      setError("Microphone access was blocked. Allow it in your browser to record.");
    }
  };

  const stop = () => {
    const r = rec.current;
    if (!r) return;
    const duration = seconds;
    r.mr.onstop = async () => {
      stopTracks();
      rec.current = null;
      setRecording(false);
      setLevel(0);
      const blob = new Blob(r.chunks, { type: r.mr.mimeType || "audio/webm" });
      if (!blob.size) return;
      setBusy("saving");
      try {
        const form = new FormData();
        form.append("file", new File([blob], "memo", { type: blob.type }));
        form.append("durationS", String(duration));
        form.append("title", `Voice memo · ${new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`);
        const res = await fetch("/api/me/dashboard-items", { method: "POST", body: form });
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || "Couldn't save the recording.");
        setExtra((x) => [j.item, ...x]);
        invalidateWidget("items");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(null);
      }
    };
    r.mr.stop();
  };

  const transcribe = async (id: string) => {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/me/dashboard-items/transcribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, actionToken: token }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Transcription failed.");
      setExtra((x) => [j.item, ...x.filter((i) => i.id !== id)]);
      invalidateWidget("items");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setRemoved((s) => new Set(s).add(id));
    await fetch(`/api/me/dashboard-items?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    invalidateWidget("items");
  };

  return (
    <WidgetCard icon={Mic} title="Voice Recorder">
      <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-3">
        <button
          type="button"
          onClick={recording ? stop : start}
          disabled={busy === "saving"}
          aria-label={recording ? "Stop recording" : "Start recording"}
          className={cn(
            "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white shadow-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            recording ? "bg-red-600 hover:bg-red-700" : "bg-[#141211] hover:bg-[#2a2622] dark:bg-[#b88a4a] dark:hover:bg-[#a47a3e]",
          )}
        >
          {recording ? (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/40 motion-safe:animate-ping" aria-hidden />
              <Square className="relative h-5 w-5 fill-current" />
            </>
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{recording ? "Recording…" : busy === "saving" ? "Saving…" : "Tap to record a memo"}</p>
          <p className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {recording ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}` : "Private to you"}
          </p>
          {/* Level meter */}
          <div className="mt-1.5 flex h-4 items-end gap-0.5" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="w-1 rounded-full bg-[#b88a4a] transition-[height] duration-75" style={{ height: `${recording ? Math.max(12, Math.min(100, level * 260 * (0.5 + Math.abs(Math.sin(i * 1.7 + seconds))))) : 12}%` }} />
            ))}
          </div>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      <div className="mt-3">
        <Load state={state} rows={2}>
          {() =>
            memos.length ? (
              <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {memos.map((m) => (
                  <li key={m.id} className="rounded-lg border p-2">
                    <div className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">{m.title}</span>
                      <span className="text-[11px] text-muted-foreground">{relTime(m.createdAt)}</span>
                      {canTranscribe && !m.body ? (
                        <button type="button" onClick={() => transcribe(m.id)} disabled={busy === m.id} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium hover:bg-muted" aria-label="Transcribe">
                          <Wand2 className="h-3 w-3" /> {busy === m.id ? "…" : "Transcribe"}
                        </button>
                      ) : null}
                      <button type="button" onClick={() => remove(m.id)} className="rounded p-1 text-muted-foreground hover:text-red-600" aria-label={`Delete ${m.title}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {m.audioUrl ? <audio controls preload="none" src={m.audioUrl} className="mt-1 h-8 w-full" /> : null}
                    {m.body ? <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{m.body}</p> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No memos yet.</Empty>
            )
          }
        </Load>
      </div>
    </WidgetCard>
  );
}

// ── Notepad ──────────────────────────────────────────────────────────────────
export function NotepadWidget() {
  const token = useDashboardActionToken();
  const state = useWidgetData<{ items: PersonalItem[] }>("items");
  const note = state.data?.items.find((i) => i.kind === "note");
  const [text, setText] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const idRef = useRef<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (note && text === null) {
      setText(note.body);
      idRef.current = note.id;
    } else if (state.data && !note && text === null) setText("");
  }, [note, state.data, text]);

  const save = async (value: string) => {
    setStatus("saving");
    try {
      const res = idRef.current
        ? await fetch("/api/me/dashboard-items", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: idRef.current, body: value, actionToken: token }) })
        : await fetch("/api/me/dashboard-items", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "note", title: "Notepad", body: value, actionToken: token }) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error);
      idRef.current = j.item.id;
      invalidateWidget("items");
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  const onChange = (v: string) => {
    setText(v);
    setStatus("idle");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(v), 800);
  };

  return (
    <WidgetCard
      icon={NotebookPen}
      title="Notepad"
      action={
        <span className="text-[11px] text-muted-foreground" aria-live="polite">
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Not saved" : ""}
        </span>
      }
    >
      {text === null ? (
        <Load state={state}>{() => null}</Load>
      ) : (
        <Textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Jot anything down. It saves as you type and only you can see it."
          className="h-full min-h-[200px] resize-y rounded-xl bg-[#fbf8f1] font-[450] leading-relaxed dark:bg-muted/40"
          aria-label="Notepad"
          maxLength={20000}
        />
      )}
    </WidgetCard>
  );
}

// ── Calculator ───────────────────────────────────────────────────────────────
function evaluate(expr: string): string {
  // Only digits, operators, dots, parentheses and % reach the evaluator.
  if (!/^[\d+\-*/().% ]+$/.test(expr)) return "Error";
  try {
    const js = expr.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");
    const v = Function(`"use strict"; return (${js})`)() as number;
    if (!Number.isFinite(v)) return "Error";
    return String(Math.round(v * 1e10) / 1e10);
  } catch {
    return "Error";
  }
}

export function CalculatorWidget() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const press = (k: string) => {
    if (k === "C") return (setExpr(""), setResult(null));
    if (k === "⌫") return setExpr((e) => e.slice(0, -1));
    if (k === "=") {
      const r = evaluate(expr);
      setResult(r);
      if (r !== "Error") setExpr(r);
      return;
    }
    setResult(null);
    setExpr((e) => (e + k).slice(0, 60));
  };
  const keys = ["C", "(", ")", "/", "7", "8", "9", "*", "4", "5", "6", "-", "1", "2", "3", "+", "0", ".", "⌫", "="];
  return (
    <WidgetCard icon={Calculator} title="Calculator">
      <div
        className="mb-2 rounded-xl bg-[#141211] px-3 py-2 text-right text-[#f4f1ea]"
        tabIndex={0}
        role="textbox"
        aria-label="Calculator display. Type numbers and operators."
        onKeyDown={(e) => {
          if (/^[\d+\-*/().%]$/.test(e.key)) press(e.key);
          else if (e.key === "Enter" || e.key === "=") press("=");
          else if (e.key === "Backspace") press("⌫");
          else if (e.key === "Escape") press("C");
          else return;
          e.preventDefault();
        }}
      >
        <p className="h-4 truncate text-xs text-[#f4f1ea]/60">{result !== null ? "=" : " "}</p>
        <p className="truncate text-2xl font-semibold tabular-nums">{expr || "0"}</p>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {keys.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => press(k)}
            className={cn(
              "h-10 rounded-lg text-sm font-semibold transition active:scale-95",
              k === "=" ? "bg-[#b88a4a] text-white hover:bg-[#a47a3e]" : /[/*\-+()]/.test(k) ? "bg-[#b88a4a]/15 hover:bg-[#b88a4a]/25" : "bg-muted hover:bg-muted/70",
            )}
          >
            {k === "*" ? "×" : k === "/" ? "÷" : k}
          </button>
        ))}
      </div>
    </WidgetCard>
  );
}

// ── World clock ──────────────────────────────────────────────────────────────
const DEFAULT_ZONES = ["America/Phoenix", "America/New_York", "Europe/London"];
const ZONE_CHOICES = [
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Pacific/Honolulu",
  "Europe/London",
  "Europe/Paris",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function WorldClockWidget({ card }: WidgetProps) {
  const { setCardSettings } = useOverview();
  const zones = (Array.isArray(card.settings?.zones) ? (card.settings!.zones as string[]) : DEFAULT_ZONES).filter((z) => ZONE_CHOICES.includes(z));
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  const add = (z: string) => z && !zones.includes(z) && setCardSettings(card.uid, { ...card.settings, zones: [...zones, z].slice(0, 6) });
  const remove = (z: string) => setCardSettings(card.uid, { ...card.settings, zones: zones.filter((x) => x !== z) });
  return (
    <WidgetCard icon={Clock3} title="World Clock">
      <ul className="space-y-1.5">
        {zones.map((z) => (
          <li key={z} className="group flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-sm">{z.split("/").pop()!.replace(/_/g, " ")}</span>
            <span className="text-sm font-semibold tabular-nums">{now ? now.toLocaleTimeString(undefined, { timeZone: z, hour: "numeric", minute: "2-digit" }) : "—"}</span>
            <span className="w-10 text-right text-[11px] text-muted-foreground">{now ? now.toLocaleDateString(undefined, { timeZone: z, weekday: "short" }) : ""}</span>
            <button type="button" onClick={() => remove(z)} className="rounded p-0.5 text-muted-foreground opacity-0 hover:text-foreground focus:opacity-100 group-hover:opacity-100" aria-label={`Remove ${z}`}>
              <X className="h-3 w-3" />
            </button>
          </li>
        ))}
      </ul>
      {zones.length < 6 ? (
        <select className="mt-3 h-8 w-full rounded-md border bg-background px-2 text-xs" value="" onChange={(e) => add(e.target.value)} aria-label="Add a time zone">
          <option value="">+ Add a time zone</option>
          {ZONE_CHOICES.filter((z) => !zones.includes(z)).map((z) => (
            <option key={z} value={z}>
              {z.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      ) : null}
    </WidgetCard>
  );
}

// ── Quick links ──────────────────────────────────────────────────────────────
type QuickLink = { label: string; href: string };

export function QuickLinksWidget({ card }: WidgetProps) {
  const { setCardSettings } = useOverview();
  const links = (Array.isArray(card.settings?.links) ? (card.settings!.links as QuickLink[]) : []).filter((l) => l && typeof l.href === "string");
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [adding, setAdding] = useState(false);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const h = href.trim();
    // Internal paths or https links only.
    if (!h || !(h.startsWith("/") || /^https:\/\//i.test(h))) return;
    setCardSettings(card.uid, { ...card.settings, links: [...links, { label: label.trim().slice(0, 40) || h, href: h.slice(0, 300) }].slice(0, 12) });
    setLabel("");
    setHref("");
    setAdding(false);
  };
  return (
    <WidgetCard
      icon={Link2}
      title="Quick Links"
      action={
        <button type="button" onClick={() => setAdding((a) => !a)} className="rounded-md p-1 hover:bg-muted" aria-label="Add a link">
          <Plus className="h-4 w-4" />
        </button>
      }
    >
      {adding ? (
        <form onSubmit={add} className="mb-3 space-y-2">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" className="h-8" aria-label="Link label" />
          <div className="flex gap-2">
            <Input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/dashboard/bookings or https://…" className="h-8" aria-label="Link address" />
            <Button type="submit" size="sm" className="h-8">
              Add
            </Button>
          </div>
        </form>
      ) : null}
      {links.length ? (
        <ul className="grid grid-cols-2 gap-2">
          {links.map((l, i) => (
            <li key={`${l.href}-${i}`} className="group relative">
              <Link href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block truncate rounded-lg border bg-muted/30 px-3 py-2 text-sm font-medium hover:border-[#b88a4a]/60 hover:bg-muted">
                {l.label}
              </Link>
              <button
                type="button"
                onClick={() => setCardSettings(card.uid, { ...card.settings, links: links.filter((_, j) => j !== i) })}
                className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:text-red-600 group-hover:flex"
                aria-label={`Remove ${l.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : !adding ? (
        <Empty>Add shortcuts to the pages you use most.</Empty>
      ) : null}
    </WidgetCard>
  );
}
