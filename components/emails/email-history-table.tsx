"use client";

import { Fragment } from "react";
import { useState } from "react";
import { Archive, ChevronDown, EyeOff, Mail, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type EmailHistoryRow = {
  id: string;
  sourceId?: string;
  direction: "Sent" | "Received";
  contact: string | null;
  fromName?: string | null;
  subject: string;
  template?: string;
  status: string;
  date?: string | null;
  error?: string | null;
  snippet?: string | null;
  htmlBody?: string | null;
  textBody?: string | null;
  linkedRecord?: string | null;
  flags?: string[];
};

export function EmailHistoryTable({ rows, emptyMessage, mode = "history" }: { rows: EmailHistoryRow[]; emptyMessage: string; mode?: "inbox" | "history" }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function action(row: EmailHistoryRow, actionName: "hide" | "remove" | "delete") {
    if (!row.sourceId) return;
    if (actionName === "delete" && !window.confirm("Soft delete this email message?")) return;
    setBusyId(row.id);
    setMessage(null);

    const response = await fetch(`/api/admin/email/messages/${row.sourceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: actionName }),
    });
    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error ?? "Email action failed.");
      setBusyId(null);
      return;
    }

    setMessage(actionName === "hide" ? "Message hidden from Inbox." : actionName === "remove" ? "Message removed from History." : "Message deleted.");
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            {mode === "history" ? <TableHead>Direction</TableHead> : null}
            <TableHead>{mode === "inbox" ? "From" : "Contact"}</TableHead>
            <TableHead>Subject</TableHead>
            {mode === "history" ? <TableHead>Template</TableHead> : <TableHead>Linked record</TableHead>}
            <TableHead>Status</TableHead>
            {mode === "history" ? <TableHead>Error</TableHead> : null}
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const expanded = expandedId === row.id;
            return (
              <Fragment key={row.id}>
                <TableRow className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : row.id)}>
                  <TableCell>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                  </TableCell>
                  {mode === "history" ? <TableCell className="font-medium">{row.direction}</TableCell> : null}
                  <TableCell className="font-medium">
                    <div>{row.fromName || row.contact || "-"}</div>
                    {row.fromName ? <div className="text-xs text-muted-foreground">{row.contact}</div> : null}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{row.subject}</div>
                    {row.snippet ? <div className="line-clamp-1 text-xs text-muted-foreground">{row.snippet}</div> : null}
                  </TableCell>
                  {mode === "history" ? <TableCell>{row.template ?? "-"}</TableCell> : <TableCell>{row.linkedRecord ?? "-"}</TableCell>}
                  <TableCell><StatusBadge status={row.status} /></TableCell>
                  {mode === "history" ? <TableCell>{row.error ?? "-"}</TableCell> : null}
                  <TableCell>{row.date ? new Date(row.date).toLocaleString() : "-"}</TableCell>
                  <TableCell>
                    <RowActions row={row} busy={busyId === row.id} mode={mode} onAction={action} />
                  </TableCell>
                </TableRow>
                {expanded ? (
                  <TableRow key={`${row.id}-expanded`}>
                    <TableCell colSpan={mode === "history" ? 8 : 7}>
                      <ExpandedEmail row={row} busy={busyId === row.id} mode={mode} onAction={action} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
          {!rows.length ? <TableRow><TableCell colSpan={mode === "history" ? 8 : 7}>{emptyMessage}</TableCell></TableRow> : null}
        </TableBody>
      </Table>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </div>
  );
}

function RowActions({
  row,
  busy,
  mode,
  onAction,
}: {
  row: EmailHistoryRow;
  busy: boolean;
  mode: "inbox" | "history";
  onAction: (row: EmailHistoryRow, actionName: "hide" | "remove" | "delete") => void;
}) {
  return (
    <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
      {row.contact ? (
        <Button asChild size="icon" variant="ghost" aria-label="Reply">
          <a href={`mailto:${row.contact}?subject=Re: ${encodeURIComponent(row.subject)}`}>
            <Mail className="h-4 w-4" />
          </a>
        </Button>
      ) : null}
      {row.sourceId && mode === "inbox" ? (
        <Button disabled={busy} size="icon" variant="ghost" aria-label="Hide" onClick={() => onAction(row, "hide")}>
          <EyeOff className="h-4 w-4" />
        </Button>
      ) : null}
      {row.sourceId && mode === "history" ? (
        <Button disabled={busy} size="icon" variant="ghost" aria-label="Remove" onClick={() => onAction(row, "remove")}>
          <Archive className="h-4 w-4" />
        </Button>
      ) : null}
      {row.sourceId ? (
        <Button disabled={busy} size="icon" variant="ghost" aria-label="Delete" onClick={() => onAction(row, "delete")}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

function ExpandedEmail({
  row,
  busy,
  mode,
  onAction,
}: {
  row: EmailHistoryRow;
  busy: boolean;
  mode: "inbox" | "history";
  onAction: (row: EmailHistoryRow, actionName: "hide" | "remove" | "delete") => void;
}) {
  return (
    <div className="space-y-4 rounded-md border bg-card p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-semibold">{row.subject}</p>
          <p className="text-sm text-muted-foreground">{row.direction} {row.date ? `on ${new Date(row.date).toLocaleString()}` : ""}</p>
          <p className="text-sm text-muted-foreground">{row.contact}</p>
        </div>
        <RowActions row={row} busy={busy} mode={mode} onAction={onAction} />
      </div>
      {row.htmlBody ? (
        <div className="overflow-hidden rounded-md border bg-white">
          <iframe className="h-[34rem] w-full bg-white" sandbox="" srcDoc={row.htmlBody} title="Email message content" />
        </div>
      ) : (
        <pre className="max-h-[34rem] overflow-auto whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">{row.textBody || row.snippet || "No message body available."}</pre>
      )}
    </div>
  );
}
