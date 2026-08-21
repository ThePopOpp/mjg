"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, Clock, UserCheck, ArrowRight, type LucideIcon } from "lucide-react";
import { StatCardRow } from "@/components/dashboard/stat-card-row";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ROLE_LABELS, isAppRole } from "@/lib/rbac/roles";
import type { DashboardInvitation } from "@/lib/user-management/repository";

type StatusKey = "sent" | "pending" | "accepted";
const CARDS: { key: StatusKey; label: string; detail: string; icon: LucideIcon }[] = [
  { key: "sent", label: "Sent", detail: "Awaiting acceptance", icon: Send },
  { key: "pending", label: "Pending", detail: "Queued to send", icon: Clock },
  { key: "accepted", label: "Accepted", detail: "Joined the platform", icon: UserCheck },
];

function roleLabel(role: string) {
  return isAppRole(role) ? ROLE_LABELS[role] : role;
}
function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) : "—";
}

export function InvitationStats({
  counts,
  invitations,
}: {
  counts: { sent: number; pending: number; accepted: number };
  invitations: DashboardInvitation[];
}) {
  const [open, setOpen] = useState<StatusKey | null>(null);
  const active = CARDS.find((c) => c.key === open) ?? null;
  // Pending excludes expired (matches the count) — an expired, never-sent invite isn't pending.
  const rows = open
    ? invitations.filter((i) => i.status === open && (open !== "pending" || !i.expires_at || new Date(i.expires_at) >= new Date()))
    : [];
  const dateCol = open === "accepted" ? "Accepted" : open === "sent" ? "Sent" : "Created";
  const dateVal = (i: DashboardInvitation) => (open === "accepted" ? i.accepted_at : open === "sent" ? i.sent_at ?? i.created_at : i.created_at);

  return (
    <>
      <StatCardRow className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.key} type="button" onClick={() => setOpen(c.key)} className="text-left">
              <Card className="transition hover:border-primary/50 hover:shadow-sm">
                <CardContent className="flex items-start justify-between p-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                    <p className="mt-2 text-3xl font-semibold tabular-nums">{counts[c.key]}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.detail} · view →</p>
                  </div>
                  <div className="rounded-md bg-secondary p-2 text-primary"><Icon className="h-5 w-5" /></div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </StatCardRow>

      <Dialog open={open !== null} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{active?.label} invitations</DialogTitle>
            <DialogDescription>{rows.length} {open === "accepted" ? "people have accepted" : `invitation${rows.length === 1 ? "" : "s"} ${open === "sent" ? "awaiting acceptance" : "queued to send"}`}.</DialogDescription>
          </DialogHeader>

          {rows.length ? (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>{dateCol}</TableHead>
                    {open !== "accepted" ? <TableHead className="text-right">Link</TableHead> : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.email}</TableCell>
                      <TableCell>{roleLabel(i.role)}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">{fmt(dateVal(i))}</TableCell>
                      {open !== "accepted" ? (
                        <TableCell className="text-right">
                          {i.inviteUrl ? <Link href={i.inviteUrl} className="text-sm font-medium text-primary hover:underline">Open</Link> : "—"}
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">No {active?.label.toLowerCase()} invitations.</p>
          )}

          <DialogFooter>
            <Link href="/dashboard/user-management" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
              Manage in User Management <ArrowRight className="h-4 w-4" />
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
