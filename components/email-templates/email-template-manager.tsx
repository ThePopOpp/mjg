"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, Copy, Eye, Pencil } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

type EmailTemplateRow = {
  id: string;
  name: string;
  slug: string;
  subject: string;
  category: string;
  status: "draft" | "active" | "archived";
  html_body: string;
  text_body: string | null;
  available_fields: string[] | null;
};

export function EmailTemplateManager({ templates }: { templates: EmailTemplateRow[] }) {
  const actionToken = useDashboardActionToken();
  const [search, setSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateRow | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const visibleTemplates = templates.filter((template) =>
    `${template.name} ${template.subject} ${template.category} ${template.status}`.toLowerCase().includes(search.toLowerCase()),
  );

  async function duplicateTemplate(template: EmailTemplateRow) {
    setActionMessage(null);
    setActionError(null);
    const response = await fetch("/api/admin/email/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({
        actionToken,
        name: `${template.name} Copy`,
        subject: template.subject,
        category: template.category,
        status: "draft",
        htmlBody: template.html_body,
        textBody: template.text_body,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setActionError(payload.error ?? "Template could not be duplicated.");
      return;
    }

    setActionMessage("Template duplicated as a draft.");
    window.location.reload();
  }

  async function archiveTemplate(template: EmailTemplateRow) {
    setActionMessage(null);
    setActionError(null);
    const response = await fetch("/api/admin/email/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({
        actionToken,
        id: template.id,
        name: template.name,
        subject: template.subject,
        category: template.category,
        status: "archived",
        htmlBody: template.html_body,
        textBody: template.text_body,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setActionError(payload.error ?? "Template could not be archived.");
      return;
    }

    setActionMessage("Template archived.");
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>Review, preview, edit, duplicate, or archive saved email templates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input className="max-w-md" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search templates..." />
            <Button asChild>
              <Link href="/dashboard/emails/editor">Create template</Link>
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fields</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>{template.category}</TableCell>
                  <TableCell><StatusBadge status={template.status} /></TableCell>
                  <TableCell>{(template.available_fields ?? []).join(", ") || "-"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" type="button" variant="outline" onClick={() => setPreviewTemplate(template)}>
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button asChild size="sm" type="button" variant="outline">
                        <Link href={`/dashboard/emails/editor?id=${template.id}`}>
                        <Pencil className="h-4 w-4" />
                        Edit
                        </Link>
                      </Button>
                      <Button size="sm" type="button" variant="outline" onClick={() => duplicateTemplate(template)}>
                        <Copy className="h-4 w-4" />
                        Duplicate
                      </Button>
                      <Button disabled={template.status === "archived"} size="sm" type="button" variant="outline" onClick={() => archiveTemplate(template)}>
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!visibleTemplates.length ? <TableRow><TableCell colSpan={6}>No templates found.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
      {actionMessage ? <p className="text-sm text-primary">{actionMessage}</p> : null}
      {previewTemplate ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3" role="dialog" aria-modal="true">
          <div className="flex h-[92vh] w-full max-w-[92rem] flex-col overflow-hidden rounded-md border bg-background shadow-xl">
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{previewTemplate.name}</p>
                <p className="truncate text-xs text-muted-foreground">{previewTemplate.subject}</p>
              </div>
              <Button className="ml-auto" type="button" variant="ghost" onClick={() => setPreviewTemplate(null)}>Close</Button>
            </div>
            <div className="flex-1 overflow-auto bg-muted p-3">
              <div className="mx-auto w-full max-w-[86rem] overflow-hidden rounded-md border bg-white shadow-sm">
                <iframe className="h-[80vh] w-full bg-white" sandbox="" srcDoc={previewTemplate.html_body} title="Email template preview" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
