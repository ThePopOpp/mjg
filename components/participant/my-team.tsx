"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, MessageSquareText, UsersRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TeamParticipant } from "@/lib/facilitator/team";

const DONE = (v: string | null | undefined) => Boolean(v && v !== "not_sent" && v !== "not_started" && v !== "none");
const fullName = (p: TeamParticipant) => `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() || p.email || "Teammate";

function StatusBadge({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
      {label}: {done ? "Complete" : "Pending"}
    </span>
  );
}

export function ParticipantTeamView({ self, teammates }: { self: TeamParticipant | null; teammates: TeamParticipant[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teammates;
    return teammates.filter((p) => fullName(p).toLowerCase().includes(q));
  }, [teammates, search]);

  return (
    <div className="space-y-4">
      {self ? (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your progress</p>
              <p className="font-medium">{fullName(self)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge done={DONE(self.check_in_status)} label="Check-In" />
              <StatusBadge done={DONE(self.survey_status)} label="Survey" />
              <StatusBadge done={DONE(self.journey_status)} label="Journey" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teammates…" className="pl-8" />
      </div>

      {!teammates.length ? (
        <Card><CardContent className="flex flex-col items-center gap-2 p-10 text-center text-sm text-muted-foreground"><UsersRound className="h-6 w-6" /> You'll see your teammates here once your group is set up.</CardContent></Card>
      ) : (
        <Card><CardContent className="divide-y p-0">
          {filtered.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{fullName(p)}</p>
                {p.wave ? <p className="text-xs text-muted-foreground">{p.wave}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge done={DONE(p.check_in_status)} label="Check-In" />
                <StatusBadge done={DONE(p.survey_status)} label="Survey" />
                <Link href="/dashboard/direct-messages" className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent"><MessageSquareText className="h-3.5 w-3.5" /> Message</Link>
              </div>
            </div>
          ))}
        </CardContent></Card>
      )}
    </div>
  );
}
