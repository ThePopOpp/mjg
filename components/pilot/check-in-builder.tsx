"use client";

import * as React from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, Check, ExternalLink, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import {
  type PilotForm, type CheckInDefinition, type CheckInSectionDef, DEFAULT_RANGES, newSectionId, newQuestionId,
} from "@/lib/pilot/form-types";

const emptyDef: CheckInDefinition = { version: 1, scaleMax: 5, sections: [], reflections: [], ranges: DEFAULT_RANGES };

export function CheckInBuilder() {
  const token = useDashboardActionToken();
  const [current, setCurrent] = React.useState<PilotForm | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    const r = await fetch("/api/admin/pilot-forms?kind=check_in&slug=check-in", { headers: { "x-mjg-action-token": token } }).then((x) => x.json()).catch(() => ({}));
    if (r.form) setCurrent(r.form);
  }, [token]);
  React.useEffect(() => { load(); }, [load]);

  const def = (current?.draft_definition as CheckInDefinition) ?? emptyDef;
  const setDef = (patch: Partial<CheckInDefinition>) => setCurrent((c) => (c ? { ...c, draft_definition: { ...def, ...patch } } : c));
  const setSections = (sections: CheckInSectionDef[]) => setDef({ sections });
  const updSection = (i: number, patch: Partial<CheckInSectionDef>) => setSections(def.sections.map((s, k) => (k === i ? { ...s, ...patch } : s)));
  const moveSection = (i: number, d: number) => { const a = [...def.sections]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setSections(a); };
  const addSection = () => setSections([...def.sections, { id: newSectionId(), key: `section_${def.sections.length + 1}`, title: "New section", lowestTag: "", questions: [] }]);
  const removeSection = (i: number) => setSections(def.sections.filter((_, k) => k !== i));
  const addQ = (si: number) => updSection(si, { questions: [...def.sections[si].questions, { id: newQuestionId(), text: "" }] });
  const updQ = (si: number, qi: number, text: string) => updSection(si, { questions: def.sections[si].questions.map((q, k) => (k === qi ? { ...q, text } : q)) });
  const removeQ = (si: number, qi: number) => updSection(si, { questions: def.sections[si].questions.filter((_, k) => k !== qi) });
  const moveQ = (si: number, qi: number, d: number) => { const a = [...def.sections[si].questions]; const j = qi + d; if (j < 0 || j >= a.length) return; [a[qi], a[j]] = [a[j], a[qi]]; updSection(si, { questions: a }); };

  const maxScore = def.sections.reduce((a, s) => a + s.questions.length * (def.scaleMax || 5), 0);

  async function post(body: object) {
    return fetch("/api/admin/pilot-forms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, actionToken: token }) }).then((r) => r.json());
  }
  async function save(): Promise<PilotForm | null> {
    if (!current) return null;
    setBusy(true); setError(null);
    try {
      const r = await post({ action: "save", id: current.id || undefined, kind: "check_in", slug: "check-in", title: current.title, description: current.description, definition: current.draft_definition });
      if (r.error) throw new Error(r.error);
      setCurrent(r.form); setSaved(true); setTimeout(() => setSaved(false), 1600); return r.form as PilotForm;
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); return null; }
    finally { setBusy(false); }
  }
  async function publish() {
    const f = await save(); if (!f) return;
    setBusy(true);
    try { const r = await post({ action: "publish", id: f.id }); if (r.error) throw new Error(r.error); setCurrent(r.form); }
    catch (e) { setError(e instanceof Error ? e.message : "Publish failed."); }
    finally { setBusy(false); }
  }

  if (!current) return <p className="text-sm text-muted-foreground">Loading check-in…</p>;

  return (
    <div className="space-y-3">
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="min-w-0 flex-1">
          <Input value={current.title} onChange={(e) => setCurrent({ ...current, title: e.target.value })} className="h-9 font-semibold" />
          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>/check-in</span>
            <span className={cn("rounded-full px-1.5 capitalize", current.status === "published" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted")}>{current.status}</span>
            <span>· max score {maxScore}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5"><label className="text-[11px] text-muted-foreground">Scale 1–</label><Input type="number" min={2} max={10} value={def.scaleMax} onChange={(e) => setDef({ scaleMax: Math.max(2, Math.min(10, Number(e.target.value) || 5)) })} className="h-8 w-14" /></div>
        <a href="/check-in" target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /> Live</a>
        <Button size="sm" variant="outline" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null} Save draft</Button>
        <Button size="sm" onClick={publish} disabled={busy}><Send className="h-4 w-4" /> Publish</Button>
      </div>

      {/* Sections */}
      {def.sections.map((s, si) => (
        <div key={s.id} className="rounded-xl border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-2">
            <Input value={s.title} onChange={(e) => updSection(si, { title: e.target.value })} placeholder="Section title" className="h-9 flex-1 font-semibold" />
            <Input value={s.lowestTag} onChange={(e) => updSection(si, { lowestTag: e.target.value })} placeholder="Lowest tag (e.g. Lowest: Purpose)" className="h-9 w-56 text-xs" />
            <button onClick={() => moveSection(si, -1)} disabled={si === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
            <button onClick={() => moveSection(si, 1)} disabled={si === def.sections.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
            <button onClick={() => removeSection(si)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="space-y-1.5 pl-1">
            {s.questions.map((q, qi) => (
              <div key={q.id} className="flex items-center gap-1.5">
                <span className="w-5 text-right text-[10px] text-muted-foreground">{qi + 1}.</span>
                <Input value={q.text} onChange={(e) => updQ(si, qi, e.target.value)} placeholder="Statement rated 1–{scaleMax}" className="h-8 flex-1 text-sm" />
                <button onClick={() => moveQ(si, qi, -1)} disabled={qi === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                <button onClick={() => moveQ(si, qi, 1)} disabled={qi === s.questions.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                <button onClick={() => removeQ(si, qi)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => addQ(si)}><Plus className="h-3.5 w-3.5" /> Add statement</Button>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addSection}><Plus className="h-4 w-4" /> Add section</Button>

      {/* Reflections */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Reflection prompts</div>
        <div className="space-y-1.5">
          {def.reflections.map((r, ri) => (
            <div key={ri} className="flex items-center gap-1.5">
              <Input value={r} onChange={(e) => setDef({ reflections: def.reflections.map((x, k) => (k === ri ? e.target.value : x)) })} className="h-8 flex-1 text-sm" />
              <button onClick={() => setDef({ reflections: def.reflections.filter((_, k) => k !== ri) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDef({ reflections: [...def.reflections, ""] })}><Plus className="h-3.5 w-3.5" /> Add reflection</Button>
        </div>
      </div>

      {/* Score ranges */}
      <div className="rounded-xl border border-border bg-card p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Score ranges (label shown at ≥ % of max)</div>
        <div className="space-y-1.5">
          {def.ranges.map((rg, ri) => (
            <div key={ri} className="flex items-center gap-1.5">
              <Input value={rg.label} onChange={(e) => setDef({ ranges: def.ranges.map((x, k) => (k === ri ? { ...x, label: e.target.value } : x)) })} className="h-8 flex-1 text-sm" />
              <span className="text-[11px] text-muted-foreground">≥</span>
              <Input type="number" min={0} max={100} value={rg.minPct} onChange={(e) => setDef({ ranges: def.ranges.map((x, k) => (k === ri ? { ...x, minPct: Math.max(0, Math.min(100, Number(e.target.value) || 0)) } : x)) })} className="h-8 w-16 text-sm" />
              <span className="text-[11px] text-muted-foreground">%</span>
              <button onClick={() => setDef({ ranges: def.ranges.filter((_, k) => k !== ri) })} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setDef({ ranges: [...def.ranges, { label: "New range", minPct: 0 }] })}><Plus className="h-3.5 w-3.5" /> Add range</Button>
        </div>
      </div>
    </div>
  );
}
