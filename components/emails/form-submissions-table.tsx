"use client";

import { Fragment, useMemo, useState } from "react";
import { Archive, ChevronDown, Eye, EyeOff, Mail, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function FormSubmissionsTable({ submissions }: { submissions: any[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return submissions;
    return submissions.filter((row) =>
      [row.form_type, row.email, row.phone, row.subject, row.message, row.source]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [query, submissions]);

  async function action(id: string, actionName: string) {
    setLoading(`${id}:${actionName}`);
    await fetch(`/api/admin/form-submissions/${id}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionName }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search form type, email, phone, subject..." />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Form</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Received</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => {
              const expanded = expandedId === row.id;
              return (
                <Fragment key={row.id}>
                  <TableRow className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : row.id)}>
                    <TableCell><ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} /></TableCell>
                    <TableCell className="font-medium">{labelize(row.form_type)}</TableCell>
                    <TableCell>
                      <div>{row.email || "-"}</div>
                      <div className="text-xs text-muted-foreground">{row.phone || row.source || ""}</div>
                    </TableCell>
                    <TableCell>{row.subject || row.message?.slice(0, 64) || "-"}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.created_at ? new Date(row.created_at).toLocaleString() : "-"}</TableCell>
                    <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" title="Reply by email" asChild>
                          <a href={`mailto:${row.email}?subject=Re: ${encodeURIComponent(row.subject || labelize(row.form_type))}`}><Mail className="h-4 w-4" /></a>
                        </Button>
                        <Button size="icon" variant="ghost" title="Show" onClick={() => action(row.id, "show")} disabled={Boolean(loading)}><Eye className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" title="Hide" onClick={() => action(row.id, "hide")} disabled={Boolean(loading)}><EyeOff className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" title="Remove" onClick={() => action(row.id, "remove")} disabled={Boolean(loading)}><Archive className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" title="Delete" onClick={() => action(row.id, "delete")} disabled={Boolean(loading)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  {expanded ? (
                    <TableRow key={`${row.id}-expanded`}>
                      <TableCell colSpan={7} className="bg-muted/30">
                        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.35fr)]">
                          <div>
                            <p className="text-sm font-medium">Full message</p>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{row.message || row.payload?.notes || row.payload?.questions || "No message body."}</p>
                          </div>
                          <div className="rounded-md border bg-background p-3 text-xs">
                            <p className="mb-2 font-semibold">Submission payload</p>
                            <pre className="max-h-80 overflow-auto whitespace-pre-wrap">{JSON.stringify(row.payload ?? {}, null, 2)}</pre>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </Fragment>
              );
            })}
            {!filtered.length ? <TableRow><TableCell colSpan={7}>No form submissions match these filters.</TableCell></TableRow> : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function labelize(value: string) {
  return (value || "Form").replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
