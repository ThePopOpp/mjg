"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldSelect } from "@/components/ui/field-select";
import { cn } from "@/lib/utils";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { platformLabel } from "@/lib/social-media/constants";
import type { SocialTemplate } from "@/lib/social-media/types";

const statusClass: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  draft: "bg-muted text-muted-foreground",
  archived: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
};

export function SocialTemplateManager({ initialTemplates }: { initialTemplates: SocialTemplate[] }) {
  const token = useDashboardActionToken();
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const visible = templates.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (search && !`${t.name} ${t.category} ${t.body_text}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function remove(t: SocialTemplate) {
    if (!window.confirm(`Delete template "${t.name}"?`)) return;
    setBusy(t.id); setError(null);
    try {
      const res = await fetch("/api/admin/social-media/templates", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: t.id, actionToken: token }) });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Delete failed.");
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
    } catch (e) { setError(e instanceof Error ? e.message : "Delete failed."); }
    finally { setBusy(null); }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates…" className="h-9 w-56" />
        <div className="w-40"><FieldSelect value={statusFilter} onChange={setStatusFilter} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Active" }, { value: "draft", label: "Draft" }, { value: "archived", label: "Archived" }]} className="h-9" /></div>
        <Button asChild size="sm" className="ml-auto"><Link href="/dashboard/social-media/editor"><Plus className="h-3.5 w-3.5" /> New template</Link></Button>
      </div>

      {error && <div className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No templates. Build one in the Block Editor.</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((t) => (
            <div key={t.id} className="flex flex-col rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold">{t.name}</span>
                <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium capitalize", statusClass[t.status])}>{t.status}</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">{t.category}{t.platforms.length ? ` · ${t.platforms.map(platformLabel).join(", ")}` : ""}</div>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">{t.body_text || "—"}</p>
              {t.hashtags.length > 0 && <div className="mt-2 line-clamp-1 text-[11px] text-primary">{t.hashtags.join(" ")}</div>}
              <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                <Button asChild size="sm" variant="outline"><Link href={`/dashboard/social-media/compose?template=${t.id}`}><Send className="h-3.5 w-3.5" /> Use</Link></Button>
                <Link href={`/dashboard/social-media/editor?id=${t.id}`} className="ml-auto text-muted-foreground hover:text-primary"><Pencil className="h-4 w-4" /></Link>
                <button onClick={() => remove(t)} disabled={busy === t.id} className="text-muted-foreground hover:text-destructive">{busy === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
