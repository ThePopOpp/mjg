"use client";

// CMS -> Legal. Edits the legal documents in public.legal_documents.
//
// The shape of this screen follows the one rule the 2026-10-09 package insists
// on: a draft is not a page. So "save" and "publish" are separate actions, the
// unresolved placeholders are listed rather than summarised, and the publish
// button is disabled with the reason attached while any remain. The server
// refuses too — this UI is the explanation, not the enforcement.

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileText,
  History,
  Loader2,
  Lock,
  Mail,
  Save,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";

type Issue = { kind: "placeholder" | "draft-marker"; text: string; line: number };

type LegalDoc = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  category: "public" | "internal" | "ui_copy";
  draft_md: string;
  published_md: string | null;
  effective_date: string | null;
  has_unpublished_changes: boolean;
  published_at: string | null;
  source_file: string | null;
  isPublished: boolean;
  publicPath: string | null;
  readiness: {
    ready: boolean;
    reason: string | null;
    placeholderCount: number;
    draftMarkerCount: number;
    issues: Issue[];
  };
};

type Contact = {
  key: string;
  address: string;
  purpose: string;
  citedInPolicy: boolean;
  mustBeMonitored: boolean;
};

type MailServer = Record<string, { host: string; port: number; security: string; recommended?: boolean }>;

type Version = {
  id: string;
  version_number: number;
  body_md: string;
  effective_date: string | null;
  action: string;
  note: string;
  created_at: string;
};

const CATEGORY_LABEL: Record<LegalDoc["category"], string> = {
  public: "Public page",
  internal: "Internal",
  ui_copy: "In-app copy",
};

export function LegalManager() {
  const token = useDashboardActionToken();
  const [docs, setDocs] = React.useState<LegalDoc[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [mailServer, setMailServer] = React.useState<MailServer>({});
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Local edits, so typing doesn't fight the server copy.
  const [draft, setDraft] = React.useState("");
  const [effective, setEffective] = React.useState("");
  const [dirty, setDirty] = React.useState(false);

  const [versions, setVersions] = React.useState<Version[]>([]);
  const [showVersions, setShowVersions] = React.useState(false);

  const selected = docs.find((d) => d.id === selectedId) ?? null;

  const load = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms/legal", { headers: { "x-mjg-action-token": token } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load legal documents.");
      setDocs(json.documents ?? []);
      setContacts(json.contacts ?? []);
      setMailServer(json.mailServer ?? {});
      setSelectedId((current) => current ?? json.documents?.[0]?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load legal documents.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => { void load(); }, [load]);

  // Pull the selected document into the editor, but never over unsaved edits.
  React.useEffect(() => {
    if (!selected || dirty) return;
    setDraft(selected.draft_md);
    setEffective(selected.effective_date ?? "");
  }, [selected?.id, selected?.draft_md, selected?.effective_date]); // eslint-disable-line react-hooks/exhaustive-deps

  async function send(url: string, method: string, body: Record<string, unknown>) {
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...body, actionToken: token }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(json.error || "Request failed.") as Error & { issues?: Issue[] };
      err.issues = json.issues;
      throw err;
    }
    return json as { document: LegalDoc };
  }

  function replaceDoc(next: LegalDoc) {
    setDocs((prev) => prev.map((d) => (d.id === next.id ? next : d)));
  }

  async function save() {
    if (!selected) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const { document } = await send(`/api/admin/cms/legal/${selected.id}`, "PATCH", {
        draft_md: draft,
        effective_date: effective || null,
      });
      replaceDoc(document);
      setDirty(false);
      setNotice("Draft saved. Nothing on the public site has changed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save.");
    } finally {
      setBusy(false);
    }
  }

  async function act(action: "publish" | "unpublish", extra: Record<string, unknown> = {}) {
    if (!selected) return;
    setBusy(true); setError(null); setNotice(null);
    try {
      const { document } = await send(`/api/admin/cms/legal/${selected.id}/publish`, "POST", { action, ...extra });
      replaceDoc(document);
      setDirty(false);
      setNotice(
        action === "publish"
          ? `Published. ${document.publicPath} is now live.`
          : `Withdrawn. ${document.publicPath} now returns 404.`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed.");
    } finally {
      setBusy(false);
    }
  }

  async function loadVersions() {
    if (!selected) return;
    const res = await fetch(`/api/admin/cms/legal/${selected.id}`, { headers: { "x-mjg-action-token": token } });
    const json = await res.json();
    if (res.ok) setVersions(json.versions ?? []);
    setShowVersions(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading legal documents…
      </div>
    );
  }

  // Readiness is recomputed server-side on every save, so this reflects the
  // SAVED draft. Unsaved edits show the stale count until you save, which is
  // why the publish button is disabled while dirty.
  const readiness = selected?.readiness;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold">These are attorney-review drafts.</p>
            <p className="text-muted-foreground">
              Every document in the 2026-10-09 package is marked draft and carries unresolved
              placeholders. Publishing is blocked until they are resolved and an effective date is
              set — the package&rsquo;s own instruction is &ldquo;Do not publish this draft with
              placeholders.&rdquo; <strong>Privacy Policy</strong> and <strong>Terms of
              Service</strong> are currently serving the A2P 10DLC documents Twilio approved; those
              two stay live until you publish a replacement.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        {/* Document list */}
        <div className="space-y-1.5">
          {docs.map((doc) => {
            const active = doc.id === selectedId;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => { setSelectedId(doc.id); setDirty(false); setShowVersions(false); setError(null); setNotice(null); }}
                className={cn(
                  "w-full rounded-md border px-3 py-2.5 text-left transition-colors",
                  active ? "border-primary bg-primary/5" : "hover:bg-muted/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight">{doc.title}</span>
                  {doc.category === "public" ? (
                    doc.isPublished ? (
                      <Badge variant="outline" className="shrink-0 border-emerald-500/40 text-emerald-600">Live</Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">Draft</Badge>
                    )
                  ) : (
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span>{CATEGORY_LABEL[doc.category]}</span>
                  {doc.publicPath ? <span className="font-mono">{doc.publicPath}</span> : null}
                </div>
                {doc.readiness.placeholderCount > 0 ? (
                  <p className="mt-1 text-[11px] text-amber-600">
                    {doc.readiness.placeholderCount} placeholder{doc.readiness.placeholderCount === 1 ? "" : "s"}
                  </p>
                ) : null}
              </button>
            );
          })}

          {/* Contact addresses the policies commit us to answering. */}
          <div className="mt-5 rounded-md border p-3">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> Contact addresses
            </h4>
            <ul className="mt-2 space-y-2">
              {contacts.map((c) => (
                <li key={c.key} className="text-[11px] leading-snug">
                  <span className="font-mono text-foreground">{c.address}</span>
                  {c.citedInPolicy ? (
                    <Badge variant="outline" className="ml-1.5 border-primary/40 px-1 py-0 text-[9px] text-primary">
                      in policy
                    </Badge>
                  ) : null}
                  <span className="block text-muted-foreground">{c.purpose}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 border-t pt-2 text-[11px] text-muted-foreground">
              Mailboxes run on Hostinger, not Resend:{" "}
              {Object.entries(mailServer)
                .filter(([, v]) => v.recommended !== false)
                .map(([k, v]) => `${k.toUpperCase()} ${v.host}:${v.port}`)
                .join(" · ")}
            </p>
          </div>
        </div>

        {/* Editor */}
        {selected ? (
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {selected.title}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{selected.summary}</p>
                {selected.source_file ? (
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{selected.source_file}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {selected.publicPath && selected.isPublished ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={selected.publicPath} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View live
                    </a>
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" onClick={() => void loadVersions()}>
                  <History className="mr-1.5 h-3.5 w-3.5" /> History
                </Button>
              </div>
            </div>

            {selected.category !== "public" ? (
              <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                <Lock className="mr-1.5 inline h-3.5 w-3.5" />
                {selected.category === "internal"
                  ? "Internal document. It has no public page and cannot be published — the server refuses."
                  : "In-app copy, used inside registration, consent and checkout. It has no public page of its own."}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                {notice}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <div className="space-y-1.5">
                <Label htmlFor="legal-effective">Effective date</Label>
                <Input
                  id="legal-effective"
                  type="date"
                  value={effective}
                  onChange={(e) => { setEffective(e.target.value); setDirty(true); }}
                />
                <p className="text-[11px] text-muted-foreground">
                  Required to publish. Shown in the page header.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex h-9 items-center gap-2 text-sm">
                  {selected.isPublished ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>
                        Live at <span className="font-mono">{selected.publicPath}</span>
                        {selected.has_unpublished_changes ? " — with unpublished draft changes" : ""}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Not published{selected.publicPath ? ` — ${selected.publicPath} returns 404` : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Placeholder report — the reason publishing is refused. */}
            {readiness && !readiness.ready ? (
              <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3">
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {readiness.reason}
                </p>
                {readiness.issues.length > 0 ? (
                  <ul className="mt-2 max-h-44 space-y-1 overflow-y-auto">
                    {readiness.issues.map((issue, i) => (
                      <li key={`${issue.line}-${i}`} className="flex gap-2 text-[12px]">
                        <span className="w-12 shrink-0 text-right font-mono text-muted-foreground">
                          L{issue.line}
                        </span>
                        <span className="min-w-0 break-words">
                          <Badge variant="outline" className="mr-1.5 px-1 py-0 text-[9px]">
                            {issue.kind === "placeholder" ? "placeholder" : "draft"}
                          </Badge>
                          <span className="font-mono">{issue.text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
            {readiness?.ready ? (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="mr-1.5 inline h-4 w-4" />
                No placeholders or draft markers left in the saved draft.
              </div>
            ) : null}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="legal-body">Draft (markdown)</Label>
                <span className="text-[11px] text-muted-foreground">
                  {draft.length.toLocaleString()} characters
                  {dirty ? " · unsaved" : ""}
                </span>
              </div>
              <Textarea
                id="legal-body"
                value={draft}
                onChange={(e) => { setDraft(e.target.value); setDirty(true); }}
                spellCheck={false}
                className="min-h-[26rem] font-mono text-[12.5px] leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => void save()} disabled={busy || !dirty}>
                {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                Save draft
              </Button>

              {selected.category === "public" ? (
                <>
                  <Button
                    variant="default"
                    onClick={() => void act("publish")}
                    disabled={busy || dirty || !readiness?.ready || !effective}
                    title={
                      dirty
                        ? "Save your changes first."
                        : !readiness?.ready
                          ? (readiness?.reason ?? "Not ready to publish.")
                          : !effective
                            ? "Set an effective date first."
                            : undefined
                    }
                  >
                    <Upload className="mr-1.5 h-4 w-4" />
                    {selected.isPublished ? "Publish changes" : "Publish"}
                  </Button>
                  {selected.isPublished ? (
                    <Button variant="outline" onClick={() => void act("unpublish")} disabled={busy}>
                      Withdraw
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>

            {showVersions ? (
              <div className="rounded-md border">
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <h4 className="text-sm font-semibold">History</h4>
                  <Button variant="ghost" size="sm" onClick={() => setShowVersions(false)}>Close</Button>
                </div>
                <ul className="max-h-64 divide-y overflow-y-auto">
                  {versions.length === 0 ? (
                    <li className="px-3 py-3 text-sm text-muted-foreground">No versions recorded yet.</li>
                  ) : (
                    versions.map((v) => (
                      <li key={v.id} className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="min-w-0">
                          <span className="text-sm font-medium">v{v.version_number}</span>
                          <Badge variant="outline" className="ml-2 px-1 py-0 text-[9px]">{v.action}</Badge>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {new Date(v.created_at).toLocaleString()} · {v.note}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true); setError(null); setNotice(null);
                            try {
                              const { document } = await send(`/api/admin/cms/legal/${selected.id}/publish`, "POST", {
                                action: "restore",
                                versionId: v.id,
                              });
                              replaceDoc(document);
                              setDraft(document.draft_md);
                              setEffective(document.effective_date ?? "");
                              setDirty(false);
                              setNotice(`v${v.version_number} restored into the draft. It is not published.`);
                            } catch (e) {
                              setError(e instanceof Error ? e.message : "Failed to restore.");
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          Restore to draft
                        </Button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">Select a document.</p>
        )}
      </div>
    </div>
  );
}
