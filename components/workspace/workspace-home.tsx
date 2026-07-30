"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, FolderPlus, LayoutGrid, Table as TableIcon, Star, Pencil, Archive, Trash2, FileText } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { WorkspaceDocListItem, WorkspaceFolder } from "@/lib/workspace/types";

type View = "cards" | "table";
type Tab = "mine" | "shared" | "favorites";

export function WorkspaceHome({ mine, shared, folders }: { mine: WorkspaceDocListItem[]; shared: WorkspaceDocListItem[]; folders: WorkspaceFolder[] }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [tab, setTab] = useState<Tab>("mine");
  const [view, setView] = useState<View>("cards");
  const [folderId, setFolderId] = useState<string>("all");
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const favorites = useMemo(() => [...mine, ...shared].filter((d) => d.is_favorite), [mine, shared]);
  const source = tab === "mine" ? mine : tab === "shared" ? shared : favorites;
  const docs = folderId === "all" ? source : source.filter((d) => d.folder_id === folderId);

  async function post(url: string, body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE" = "POST") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actionToken, ...body }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function newDocument() {
    const scope = tab === "shared" ? "shared" : "personal";
    const data = await post("/api/workspace/documents", { scope, folderId: folderId === "all" ? null : folderId });
    if (data?.id) router.push(`/dashboard/workspace/${data.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="mine">My Documents</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          {folders.length ? (
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger className="h-9 w-44"><SelectValue placeholder="All folders" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All folders</SelectItem>
                {folders.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : null}
          <div className="inline-flex rounded-md border bg-card p-0.5">
            {([["cards", LayoutGrid], ["table", TableIcon]] as const).map(([k, Icon]) => (
              <button key={k} type="button" onClick={() => setView(k)} className={cn("rounded px-2.5 py-1.5 transition-colors", view === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")} aria-label={`${k} view`}><Icon className="h-4 w-4" /></button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => setNewFolderOpen(true)}><FolderPlus className="mr-2 h-4 w-4" /> New Folder</Button>
          <Button size="sm" onClick={newDocument} disabled={busy}><Plus className="mr-2 h-4 w-4" /> New Document</Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Tabs value={tab}>
        <TabsContent value={tab} className="mt-0">
          {!docs.length ? (
            <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">{tab === "favorites" ? "No favorites yet." : tab === "shared" ? "Nothing shared with you yet." : "No documents yet — create one to get started."}</CardContent></Card>
          ) : view === "cards" ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {docs.map((d) => <DocCard key={d.id} doc={d} onAction={post} folders={folders} refresh={() => router.refresh()} />)}
            </div>
          ) : (
            <Card><CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Folder</TableHead><TableHead>Owner</TableHead><TableHead>Updated</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {docs.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium"><Link href={`/dashboard/workspace/${d.id}`} className="hover:underline">{d.title}</Link></TableCell>
                      <TableCell>{d.folder_name ?? "-"}</TableCell>
                      <TableCell>{d.owner_name ?? "-"}</TableCell>
                      <TableCell>{new Date(d.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right"><DocActions doc={d} onAction={post} refresh={() => router.refresh()} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent></Card>
          )}
        </TabsContent>
      </Tabs>

      <NewFolderDialog open={newFolderOpen} onOpenChange={setNewFolderOpen} defaultScope={tab === "shared" ? "shared" : "personal"} onCreate={async (name, scope) => { await post("/api/workspace/folders", { name, scope }); setNewFolderOpen(false); router.refresh(); }} busy={busy} />
    </div>
  );
}

function DocCard({ doc, onAction, refresh }: { doc: WorkspaceDocListItem; onAction: any; refresh: () => void; folders: WorkspaceFolder[] }) {
  return (
    <Card className="group relative transition-colors hover:border-primary/50">
      <CardContent className="p-4">
        <Link href={`/dashboard/workspace/${doc.id}`} className="block">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="truncate font-medium">{doc.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{doc.folder_name ? `${doc.folder_name} · ` : ""}{doc.owner_name ?? ""} · {new Date(doc.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </Link>
        <div className="mt-3 flex items-center justify-end">
          <DocActions doc={doc} onAction={onAction} refresh={refresh} />
        </div>
      </CardContent>
    </Card>
  );
}

function DocActions({ doc, onAction, refresh }: { doc: WorkspaceDocListItem; onAction: any; refresh: () => void }) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(doc.title);

  return (
    <div className="flex items-center gap-0.5">
      <button type="button" title="Favorite" onClick={async () => { await onAction(`/api/workspace/documents/${doc.id}/favorite`, { favorite: !doc.is_favorite }); refresh(); }} className={cn("rounded p-1.5 transition-colors hover:bg-accent", doc.is_favorite ? "text-amber-500" : "text-muted-foreground hover:text-foreground")}>
        <Star className={cn("h-4 w-4", doc.is_favorite && "fill-current")} />
      </button>
      <button type="button" title="Rename" onClick={() => setRenameOpen(true)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Pencil className="h-4 w-4" /></button>
      <button type="button" title="Archive" onClick={async () => { await onAction(`/api/workspace/documents/${doc.id}`, { status: "archived" }, "PATCH"); refresh(); }} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"><Archive className="h-4 w-4" /></button>
      <button type="button" title="Delete" onClick={() => setConfirmDelete(true)} className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rename document</DialogTitle></DialogHeader>
          <div className="space-y-1.5"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={async () => { await onAction(`/api/workspace/documents/${doc.id}`, { title }, "PATCH"); setRenameOpen(false); refresh(); }} disabled={!title.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete document?</DialogTitle><DialogDescription>“{doc.title}” will be removed. This can&apos;t be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { await onAction(`/api/workspace/documents/${doc.id}`, {}, "DELETE"); setConfirmDelete(false); refresh(); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewFolderDialog({ open, onOpenChange, defaultScope, onCreate, busy }: { open: boolean; onOpenChange: (v: boolean) => void; defaultScope: "personal" | "shared"; onCreate: (name: string, scope: "personal" | "shared") => void; busy: boolean }) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"personal" | "shared">(defaultScope);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>New folder</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Folder name" /></div>
          <div className="space-y-1.5"><Label>Scope</Label>
            <Select value={scope} onValueChange={(v) => setScope(v as "personal" | "shared")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="personal">Personal</SelectItem><SelectItem value="shared">Shared</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onCreate(name, scope)} disabled={busy || !name.trim()}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
