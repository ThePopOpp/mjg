"use client";

import * as React from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, Check, ExternalLink, Send, GripVertical, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldSelect } from "@/components/ui/field-select";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import {
  type PilotForm, type SurveyDefinition, type SurveyField, type SurveyFieldType,
  SURVEY_FIELD_TYPES, TYPE_HAS_OPTIONS, newFieldId, surveyTypeForSlug,
} from "@/lib/pilot/form-types";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

export function SurveyBuilder() {
  const token = useDashboardActionToken();
  const [forms, setForms] = React.useState<PilotForm[]>([]);
  const [current, setCurrent] = React.useState<PilotForm | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const listForms = React.useCallback(async () => {
    const r = await fetch("/api/admin/pilot-forms?kind=survey", { headers: { "x-mjg-action-token": token } }).then((x) => x.json()).catch(() => ({}));
    if (Array.isArray(r.forms)) { setForms(r.forms); return r.forms as PilotForm[]; }
    return [];
  }, [token]);
  React.useEffect(() => { listForms().then((f) => { if (!current && f[0]) selectForm(f[0].slug); }); /* eslint-disable-next-line */ }, [listForms]);

  async function selectForm(slug: string) {
    setError(null);
    const r = await fetch(`/api/admin/pilot-forms?kind=survey&slug=${encodeURIComponent(slug)}`, { headers: { "x-mjg-action-token": token } }).then((x) => x.json()).catch(() => ({}));
    if (r.form) setCurrent(r.form);
  }

  const def = (current?.draft_definition as SurveyDefinition) ?? { version: 1, fields: [] };
  function setDef(fields: SurveyField[]) { setCurrent((c) => (c ? { ...c, draft_definition: { version: 1, fields } } : c)); }
  const updateField = (i: number, patch: Partial<SurveyField>) => setDef(def.fields.map((f, k) => (k === i ? { ...f, ...patch } : f)));
  const addField = () => setDef([...def.fields, { id: newFieldId(), name: `field_${def.fields.length + 1}`, label: "New question", type: "text" }]);
  const removeField = (i: number) => setDef(def.fields.filter((_, k) => k !== i));
  const moveField = (i: number, d: number) => { const a = [...def.fields]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; setDef(a); };

  async function post(body: object) {
    return fetch("/api/admin/pilot-forms", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...body, actionToken: token }) }).then((r) => r.json());
  }
  async function save(): Promise<PilotForm | null> {
    if (!current) return null;
    setBusy(true); setError(null);
    try {
      const r = await post({ action: "save", id: current.id || undefined, kind: "survey", slug: current.slug, title: current.title, description: current.description, definition: current.draft_definition });
      if (r.error) throw new Error(r.error);
      setCurrent(r.form); await listForms(); setSaved(true); setTimeout(() => setSaved(false), 1600);
      return r.form as PilotForm;
    } catch (e) { setError(e instanceof Error ? e.message : "Save failed."); return null; }
    finally { setBusy(false); }
  }
  async function publish() {
    const f = await save(); if (!f) return;
    setBusy(true);
    try { const r = await post({ action: "publish", id: f.id }); if (r.error) throw new Error(r.error); setCurrent(r.form); await listForms(); }
    catch (e) { setError(e instanceof Error ? e.message : "Publish failed."); }
    finally { setBusy(false); }
  }
  async function newSurvey() {
    const title = window.prompt("New survey title:"); if (!title) return;
    const slug = slugify(title); if (["general", "pastor-elder", "check-in"].includes(slug)) { setError("That slug is reserved."); return; }
    setBusy(true);
    try {
      const r = await post({ action: "save", kind: "survey", slug, title, description: "", definition: { version: 1, fields: [{ id: newFieldId(), name: "name", label: "Name", type: "text", required: true }, { id: newFieldId(), name: "email", label: "Email", type: "email", required: true }] } });
      if (r.error) throw new Error(r.error);
      await listForms(); setCurrent(r.form);
    } catch (e) { setError(e instanceof Error ? e.message : "Create failed."); }
    finally { setBusy(false); }
  }
  async function del() {
    if (!current?.id || !window.confirm("Delete this survey definition? (Responses are kept.)")) return;
    await post({ action: "delete", id: current.id }); setCurrent(null); const f = await listForms(); if (f[0]) selectForm(f[0].slug);
  }

  const isSeed = current && ["general", "pastor-elder"].includes(current.slug);
  const liveUrl = current ? `/surveys/${current.slug === "pastor-elder" ? "pastor-elder" : current.slug}` : "#";

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* Survey list */}
      <div className="space-y-2">
        <Button size="sm" className="w-full" onClick={newSurvey} disabled={busy}><Plus className="h-4 w-4" /> New survey</Button>
        <div className="space-y-1 rounded-xl border border-border bg-card p-1.5">
          {forms.map((f) => (
            <button key={f.slug} onClick={() => selectForm(f.slug)} className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs", current?.slug === f.slug ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
              {f.status === "published" ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Circle className="h-3.5 w-3.5 text-muted-foreground" />}
              <span className="min-w-0 flex-1 truncate font-medium">{f.title}</span>
            </button>
          ))}
          {forms.length === 0 && <p className="px-2 py-3 text-center text-[11px] text-muted-foreground">No surveys yet.</p>}
        </div>
      </div>

      {/* Editor */}
      {!current ? <p className="text-sm text-muted-foreground">Select or create a survey.</p> : (
        <div className="space-y-3">
          {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <Input value={current.title} onChange={(e) => setCurrent({ ...current, title: e.target.value })} className="h-9 font-semibold" />
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>/surveys/{current.slug}</span>
                <span className={cn("rounded-full px-1.5 capitalize", current.status === "published" ? "bg-emerald-500/15 text-emerald-600" : "bg-muted")}>{current.status}</span>
                {surveyTypeForSlug(current.slug) !== current.slug && <span>· type: {surveyTypeForSlug(current.slug)}</span>}
              </div>
            </div>
            <a href={liveUrl} target="_blank" rel="noopener" className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-2.5 text-xs hover:bg-muted"><ExternalLink className="h-3.5 w-3.5" /> Live</a>
            {!isSeed && <Button size="sm" variant="outline" className="text-destructive" onClick={del}><Trash2 className="h-4 w-4" /></Button>}
            <Button size="sm" variant="outline" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : null} Save draft</Button>
            <Button size="sm" onClick={publish} disabled={busy}><Send className="h-4 w-4" /> Publish</Button>
          </div>
          <Textarea value={current.description ?? ""} onChange={(e) => setCurrent({ ...current, description: e.target.value })} placeholder="Intro / description shown above the survey…" className="min-h-[52px]" />

          <div className="space-y-2">
            {def.fields.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">Q{i + 1}</span>
                  <div className="ml-auto flex items-center gap-1">
                    <button onClick={() => moveField(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
                    <button onClick={() => moveField(i, 1)} disabled={i === def.fields.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
                    <button onClick={() => removeField(i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <Input value={f.label} onChange={(e) => updateField(i, { label: e.target.value })} placeholder="Question label" className="mb-2 h-9" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div><label className="mb-1 block text-[10px] text-muted-foreground">Type</label><FieldSelect value={f.type} onChange={(v) => updateField(i, { type: v as SurveyFieldType })} options={SURVEY_FIELD_TYPES.map((t) => ({ value: t.value, label: t.label }))} className="h-8" /></div>
                  <div><label className="mb-1 block text-[10px] text-muted-foreground">Field name</label><Input value={f.name} onChange={(e) => updateField(i, { name: e.target.value.replace(/\s+/g, "_") })} className="h-8 font-mono text-xs" /></div>
                  <label className="flex items-end gap-1.5 pb-1.5 text-[11px] text-muted-foreground"><input type="checkbox" checked={Boolean(f.required)} onChange={(e) => updateField(i, { required: e.target.checked })} /> Required</label>
                </div>
                {TYPE_HAS_OPTIONS.has(f.type) && (
                  <div className="mt-2"><label className="mb-1 block text-[10px] text-muted-foreground">Options (one per line)</label>
                    <Textarea value={(f.options ?? []).join("\n")} onChange={(e) => updateField(i, { options: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean) })} className="min-h-[70px] text-xs" placeholder="Option A&#10;Option B" /></div>
                )}
                <Input value={f.help ?? ""} onChange={(e) => updateField(i, { help: e.target.value || undefined })} placeholder="Help text (optional)" className="mt-2 h-8 text-xs" />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addField}><Plus className="h-4 w-4" /> Add question</Button>
          </div>
        </div>
      )}
    </div>
  );
}
