"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Check, Loader2, AlertTriangle } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Input } from "@/components/ui/input";

// Plate touches browser APIs — load it client-only to avoid SSR issues.
const PlateEditor = dynamic(() => import("@/components/workspace/plate-editor").then((m) => m.PlateEditor), {
  ssr: false,
  loading: () => <div className="min-h-[60vh] rounded-md border bg-background px-4 py-3 text-sm text-muted-foreground">Loading editor…</div>,
});

type SaveState = "idle" | "saving" | "saved" | "error";

export function WorkspaceEditor({ doc }: { doc: { id: string; title: string; content_json: unknown } }) {
  const actionToken = useDashboardActionToken();
  const [title, setTitle] = useState(doc.title);
  const [state, setState] = useState<SaveState>("idle");

  const latest = useRef<{ title: string; content: unknown }>({ title: doc.title, content: doc.content_json });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    setState("saving");
    try {
      const res = await fetch(`/api/workspace/documents/${doc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, title: latest.current.title, content: latest.current.content }),
      });
      setState(res.ok ? "saved" : "error");
    } catch {
      setState("error");
    }
  }, [actionToken, doc.id]);

  const scheduleSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 900);
  }, [save]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/workspace" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Workspace
        </Link>
        <SaveStatus state={state} />
      </div>

      <Input
        value={title}
        onChange={(e) => { setTitle(e.target.value); latest.current.title = e.target.value; scheduleSave(); }}
        placeholder="Untitled"
        className="h-auto border-0 bg-transparent px-0 text-3xl font-bold shadow-none focus-visible:ring-0"
      />

      <PlateEditor
        initialValue={doc.content_json}
        onChange={(value) => { latest.current.content = value; scheduleSave(); }}
      />
    </div>
  );
}

function SaveStatus({ state }: { state: SaveState }) {
  if (state === "saving") return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</span>;
  if (state === "saved") return <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400"><Check className="h-3.5 w-3.5" /> Saved</span>;
  if (state === "error") return <span className="inline-flex items-center gap-1.5 text-xs text-destructive"><AlertTriangle className="h-3.5 w-3.5" /> Save failed</span>;
  return <span className="text-xs text-muted-foreground">All changes save automatically</span>;
}
