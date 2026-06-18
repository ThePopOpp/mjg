"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download, Filter, Import, LayoutList, Mail, Phone, Plus, Search, Settings2,
  MessageSquare, RefreshCw, Trash2, UserPlus, X, ChevronLeft, ChevronRight,
  MoreHorizontal, Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ContactFormFields, BLANK_CONTACT, type ContactFormData } from "./contact-form-fields";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

type Contact = {
  id: string; type: string; status: string;
  first_name: string | null; last_name: string | null;
  email: string | null; phone: string | null;
  company: string | null; church: string | null;
  source: string | null; list: string | null; tags: string[];
  notes: string | null; profile_photo_url: string | null;
  address_line_1: string | null; address_line_2: string | null;
  city: string | null; state: string | null; zip_code: string | null;
  website: string | null; sms_opt_in: boolean; email_opt_in: boolean;
  converted_to_participant_id: string | null; converted_to_profile_id: string | null;
  created_at: string;
  [key: string]: unknown;
};

const PAGE_SIZE = 50;

function fullName(c: Contact) {
  return [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || "—";
}

function statusColor(s: string) {
  return { active: "default", inactive: "secondary", converted: "outline", archived: "outline" }[s] ?? "outline";
}

export function ContactsManager({ initialType = "contact" }: { initialType?: "contact" | "lead" }) {
  const actionToken = useDashboardActionToken();
  const [tab, setTab] = useState<"contact" | "lead">(initialType);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  // Add / edit modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(BLANK_CONTACT);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Import modal
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail / quick-actions sheet
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Convert modal
  const [showConvert, setShowConvert] = useState(false);
  const [convertTarget, setConvertTarget] = useState<"participant" | "profile">("participant");
  const [converting, setConverting] = useState(false);
  const [convertMsg, setConvertMsg] = useState<string | null>(null);

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Custom fields settings
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: tab, page: String(page), limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/contacts?${params}`, {
        headers: { "x-mjg-action-token": actionToken },
      });
      const data = await res.json();
      setContacts(data.data ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [tab, page, search, statusFilter, actionToken]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);
  useEffect(() => { setPage(1); }, [tab, search, statusFilter]);

  // ── Add / Edit ────────────────────────────────────────
  function openAdd() {
    setEditContact(null);
    setFormData({ ...BLANK_CONTACT });
    setSaveError(null);
    setShowAddModal(true);
  }

  function openEdit(c: Contact) {
    setEditContact(c);
    setFormData({
      first_name: c.first_name ?? "", last_name: c.last_name ?? "",
      email: c.email ?? "", phone: c.phone ?? "",
      company: c.company ?? "", website: c.website ?? "", church: c.church ?? "",
      source: c.source ?? "", list: c.list ?? "",
      tags: (c.tags ?? []).join(", "), status: c.status,
      address_line_1: c.address_line_1 ?? "", address_line_2: c.address_line_2 ?? "",
      city: c.city ?? "", state: c.state ?? "", zip_code: c.zip_code ?? "",
      notes: c.notes ?? "", profile_photo_url: c.profile_photo_url ?? "",
      sms_opt_in: c.sms_opt_in, email_opt_in: c.email_opt_in,
    });
    setSaveError(null);
    setShowAddModal(true);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(/[,;]+/).map((t) => t.trim()).filter(Boolean),
        type: tab,
        actionToken,
      };
      const url = editContact ? `/api/admin/contacts/${editContact.id}` : "/api/admin/contacts";
      const method = editContact ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setShowAddModal(false);
      await fetchContacts();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  // ── Import ────────────────────────────────────────────
  async function handleImport() {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const fd = new FormData();
      fd.set("file", importFile);
      fd.set("type", tab);
      fd.set("actionToken", actionToken);
      const res = await fetch("/api/admin/contacts/import", {
        method: "POST",
        headers: { "x-mjg-action-token": actionToken },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed.");
      setImportResult(`Imported ${data.imported} ${tab}s. Mapped columns: ${(data.mappedColumns ?? []).join(", ")}.`);
      setImportFile(null);
      await fetchContacts();
    } catch (err) {
      setImportResult(`Error: ${err instanceof Error ? err.message : "Import failed."}`);
    } finally {
      setImporting(false);
    }
  }

  // ── Export ────────────────────────────────────────────
  function handleExport() {
    const params = new URLSearchParams({ type: tab, actionToken });
    if (statusFilter) params.set("status", statusFilter);
    window.open(`/api/admin/contacts/export?${params}`, "_blank");
  }

  // ── Delete ────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/contacts/${deleteConfirm.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ actionToken }),
      });
      setDeleteConfirm(null);
      await fetchContacts();
    } finally {
      setDeleting(false);
    }
  }

  // ── Convert ───────────────────────────────────────────
  async function handleConvert() {
    if (!selectedContact) return;
    setConverting(true);
    setConvertMsg(null);
    try {
      const res = await fetch(`/api/admin/contacts/${selectedContact.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({ target: convertTarget, actionToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Conversion failed.");
      const msg = convertTarget === "participant"
        ? `Converted to participant (ID: ${data.participantId}). View in Participants.`
        : `Profile created. Complete the invitation from User Management.`;
      setConvertMsg(msg);
      await fetchContacts();
    } catch (err) {
      setConvertMsg(`Error: ${err instanceof Error ? err.message : "Failed."}`);
    } finally {
      setConverting(false);
    }
  }

  // ── Custom fields ─────────────────────────────────────
  async function loadCustomFields() {
    const res = await fetch("/api/admin/contacts/fields", {
      headers: { "x-mjg-action-token": actionToken },
    });
    const data = await res.json();
    setCustomFields(data.fields ?? []);
  }

  async function addCustomField() {
    if (!newFieldLabel.trim()) return;
    await fetch("/api/admin/contacts/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ field_label: newFieldLabel, field_type: newFieldType, actionToken }),
    });
    setNewFieldLabel("");
    await loadCustomFields();
  }

  async function deleteCustomField(id: string) {
    await fetch(`/api/admin/contacts/fields/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ actionToken }),
    });
    await loadCustomFields();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* ── Tabs + actions bar ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v: string) => setTab(v as "contact" | "lead")}>
          <TabsList>
            <TabsTrigger value="contact">Contacts</TabsTrigger>
            <TabsTrigger value="lead">Leads</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { setShowFieldSettings(true); loadCustomFields(); }} className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" /> Fields
          </Button>
          <Button size="sm" variant="outline" onClick={() => setShowImport(true)} className="gap-1.5">
            <Import className="h-3.5 w-3.5" /> Import CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openAdd} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add {tab === "contact" ? "Contact" : "Lead"}
          </Button>
        </div>
      </div>

      {/* ── Search + filter ─── */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${tab}s…`}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter || "all"} onValueChange={(v: string) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-36">
            <Filter className="h-3.5 w-3.5 mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={fetchContacts} title="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ── Table ─── */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading…</TableCell></TableRow>
            )}
            {!loading && contacts.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No {tab}s found.</TableCell></TableRow>
            )}
            {contacts.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => { setSelectedContact(c); setShowDetail(true); }}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {c.profile_photo_url ? (
                      <img src={c.profile_photo_url} alt="" className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {(c.first_name?.[0] ?? c.email?.[0] ?? "?").toUpperCase()}
                      </div>
                    )}
                    {fullName(c)}
                  </div>
                </TableCell>
                <TableCell className="text-sm">{c.email ?? "—"}</TableCell>
                <TableCell className="font-mono text-sm">{c.phone ?? "—"}</TableCell>
                <TableCell className="text-sm">{c.company ?? "—"}</TableCell>
                <TableCell className="text-sm">{c.source ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={statusColor(c.status) as any} className="text-xs capitalize">{c.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(c.tags ?? []).slice(0, 2).map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                    {(c.tags ?? []).length > 2 && <Badge variant="outline" className="text-xs">+{c.tags.length - 2}</Badge>}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(c)} className="h-7 w-7">
                      <LayoutList className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteConfirm(c)} className="h-7 w-7 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ─── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────
          Add / Edit Modal
      ───────────────────────────────────────────────────── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editContact ? "Edit" : "Add"} {tab === "contact" ? "Contact" : "Lead"}</DialogTitle>
          </DialogHeader>
          <ContactFormFields data={formData} onChange={(patch) => setFormData((d) => ({ ...d, ...patch }))} />
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          Import Modal
      ───────────────────────────────────────────────────── */}
      <Dialog open={showImport} onOpenChange={(o: boolean) => { setShowImport(o); if (!o) { setImportFile(null); setImportResult(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import {tab === "contact" ? "Contacts" : "Leads"} from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border-2 border-dashed border-muted-foreground/25 p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
              />
              {importFile ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{importFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(importFile.size / 1024).toFixed(1)} KB</p>
                  <Button variant="ghost" size="sm" onClick={() => setImportFile(null)}>Change file</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Import className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Upload a CSV with any of these headers:</p>
                  <p className="text-xs text-muted-foreground">
                    First Name, Last Name, Email, Phone, Company, Church, Source, List, Tags, Status, Website, Address Line 1, Address Line 2, City, State, Zip Code, Notes, Profile Photo
                  </p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose CSV file</Button>
                </div>
              )}
            </div>
            {importResult && (
              <div className={`rounded-md p-3 text-sm ${importResult.startsWith("Error") ? "bg-destructive/10 text-destructive" : "bg-green-50 text-green-700"}`}>
                {importResult}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowImport(false)}>Cancel</Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              {importing ? "Importing…" : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          Contact detail + quick actions sheet
      ───────────────────────────────────────────────────── */}
      <Sheet open={showDetail} onOpenChange={setShowDetail}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {selectedContact && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-start gap-3">
                  {selectedContact.profile_photo_url ? (
                    <img src={selectedContact.profile_photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-xl font-semibold text-muted-foreground">
                      {(selectedContact.first_name?.[0] ?? selectedContact.email?.[0] ?? "?").toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-lg">{fullName(selectedContact)}</SheetTitle>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <Badge variant={statusColor(selectedContact.status) as any} className="text-xs capitalize">{selectedContact.status}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{selectedContact.type}</Badge>
                      {selectedContact.converted_to_participant_id && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-300">Converted</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* Quick action buttons */}
              <div className="grid grid-cols-3 gap-2 py-4 border-b">
                <a
                  href={`mailto:${selectedContact.email}`}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors hover:bg-accent ${!selectedContact.email ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </a>
                <a
                  href={`tel:${selectedContact.phone}`}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors hover:bg-accent ${!selectedContact.phone ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <Phone className="h-5 w-5 text-primary" />
                  Call
                </a>
                <a
                  href={`/dashboard/sms/compose?phone=${encodeURIComponent(selectedContact.phone ?? "")}&name=${encodeURIComponent(fullName(selectedContact))}`}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors hover:bg-accent ${!selectedContact.phone ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <MessageSquare className="h-5 w-5 text-primary" />
                  SMS
                </a>
              </div>

              {/* Contact details */}
              <div className="space-y-3 py-4 border-b text-sm">
                {selectedContact.email    && <DetailRow label="Email"   value={selectedContact.email} />}
                {selectedContact.phone    && <DetailRow label="Phone"   value={selectedContact.phone} />}
                {selectedContact.company  && <DetailRow label="Company" value={selectedContact.company} />}
                {selectedContact.church   && <DetailRow label="Church"  value={selectedContact.church} />}
                {selectedContact.website  && <DetailRow label="Website" value={selectedContact.website} link />}
                {selectedContact.source   && <DetailRow label="Source"  value={selectedContact.source} />}
                {selectedContact.list     && <DetailRow label="List"    value={selectedContact.list} />}
                {(selectedContact.tags ?? []).length > 0 && (
                  <div className="flex gap-2">
                    <span className="w-20 shrink-0 text-muted-foreground">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedContact.tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                )}
                {selectedContact.city && (
                  <DetailRow label="Location" value={[selectedContact.city, selectedContact.state, selectedContact.zip_code].filter(Boolean).join(", ")} />
                )}
                {selectedContact.notes && (
                  <div>
                    <span className="text-muted-foreground block mb-1">Notes</span>
                    <p className="rounded bg-muted p-2 text-sm">{selectedContact.notes}</p>
                  </div>
                )}
              </div>

              {/* Convert + Edit buttons */}
              {selectedContact.status !== "converted" && (
                <div className="py-4 border-b">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Convert</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline" size="sm" className="flex-1 gap-1.5"
                      onClick={() => { setShowConvert(true); setConvertMsg(null); }}
                    >
                      <UserPlus className="h-3.5 w-3.5" /> Convert to participant / user
                    </Button>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowDetail(false); openEdit(selectedContact); }}>
                  Edit contact
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
                  onClick={() => { setShowDetail(false); setDeleteConfirm(selectedContact); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ─────────────────────────────────────────────────────
          Convert Modal
      ───────────────────────────────────────────────────── */}
      <Dialog open={showConvert} onOpenChange={setShowConvert}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Convert {selectedContact ? fullName(selectedContact) : "contact"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Choose what to create from this {tab}:</p>
            <Select value={convertTarget} onValueChange={(v: string) => setConvertTarget(v as "participant" | "profile")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="participant">Participant (program attendee)</SelectItem>
                <SelectItem value="profile">Dashboard user (profile / staff)</SelectItem>
              </SelectContent>
            </Select>
            {convertMsg && (
              <div className={`rounded p-3 text-sm ${convertMsg.startsWith("Error") ? "text-destructive bg-destructive/10" : "text-green-700 bg-green-50"}`}>
                {convertMsg}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowConvert(false)}>Cancel</Button>
            <Button onClick={handleConvert} disabled={converting || !!convertMsg?.startsWith("Conv")}>
              {converting ? "Converting…" : "Convert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          Delete Confirm
      ───────────────────────────────────────────────────── */}
      <Dialog open={!!deleteConfirm} onOpenChange={(o: boolean) => { if (!o) setDeleteConfirm(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete {deleteConfirm ? fullName(deleteConfirm) : "contact"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────
          Custom Field Settings
      ───────────────────────────────────────────────────── */}
      <Dialog open={showFieldSettings} onOpenChange={setShowFieldSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Custom Contact Fields</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {customFields.length === 0 && (
                <p className="text-sm text-muted-foreground">No custom fields defined yet.</p>
              )}
              {customFields.map((f) => (
                <div key={f.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{f.field_label}</p>
                    <p className="text-xs text-muted-foreground">{f.field_key} · {f.field_type}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCustomField(f.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Input value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} placeholder="Field label (e.g. Baptism Date)" className="flex-1" />
              <Select value={newFieldType} onValueChange={setNewFieldType}>
                <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["text","email","phone","url","textarea","select","date","number","checkbox"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={addCustomField} disabled={!newFieldLabel.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowFieldSettings(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 text-muted-foreground">{label}</span>
      {link ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">{value}</a>
      ) : (
        <span className="truncate">{value}</span>
      )}
    </div>
  );
}
