import { SectionHeader } from "@/components/dashboard/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Softphone } from "@/components/dialer/softphone";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { Phone, PhoneIncoming, PhoneOutgoing, Voicemail, Mic } from "lucide-react";

export default async function DialerPage() {
  const supabase = createSupabaseAdminClient();

  const { data: calls } = await supabase
    .from("calls")
    .select(`
      id, direction, from_number, to_number, status,
      duration_seconds, recording_url, voicemail_url,
      transcription_text, voicemail_transcription, notes,
      started_at, ended_at,
      participant_id, profile_id,
      participants(first_name, last_name),
      profiles(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  const unlistenedVoicemails = (calls ?? []).filter((c: any) => c.voicemail_url && !c.notes?.includes("[listened]"));

  return (
    <div className="space-y-6">
      <SectionHeader title="Dialer" description="Softphone, call logs, recordings, and voicemails." />

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Phone} label="Total calls" value={(calls ?? []).length} />
        <StatCard icon={PhoneIncoming} label="Inbound" value={(calls ?? []).filter((c: any) => c.direction === "inbound").length} />
        <StatCard icon={PhoneOutgoing} label="Outbound" value={(calls ?? []).filter((c: any) => c.direction === "outbound").length} />
        <StatCard icon={Voicemail} label="Voicemails" value={(calls ?? []).filter((c: any) => c.voicemail_url).length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* Softphone */}
        <Card>
          <CardHeader><CardTitle>Softphone</CardTitle></CardHeader>
          <CardContent>
            <Softphone />
          </CardContent>
        </Card>

        {/* Call logs */}
        <Card>
          <CardHeader><CardTitle>Call log</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Direction</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Media</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(calls ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-muted-foreground">No calls yet.</TableCell>
                  </TableRow>
                )}
                {(calls ?? []).map((call: any) => {
                  const contactName = call.participants
                    ? `${call.participants.first_name} ${call.participants.last_name}`.trim()
                    : call.profiles?.full_name ?? null;
                  const displayNumber = call.direction === "inbound" ? call.from_number : call.to_number;

                  return (
                    <TableRow key={call.id}>
                      <TableCell>
                        <Badge variant="outline" className="gap-1 text-xs">
                          {call.direction === "inbound" ? <PhoneIncoming className="h-3 w-3" /> : <PhoneOutgoing className="h-3 w-3" />}
                          {call.direction}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{contactName ?? "—"}</TableCell>
                      <TableCell className="font-mono text-sm">{displayNumber}</TableCell>
                      <TableCell>
                        <CallStatusBadge status={call.status} />
                      </TableCell>
                      <TableCell>
                        {call.duration_seconds != null
                          ? formatDuration(call.duration_seconds)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {call.started_at ? new Date(call.started_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {call.recording_url && (
                            <a href={call.recording_url} target="_blank" rel="noopener noreferrer" title="Recording" className="text-primary hover:text-primary/80">
                              <Mic className="h-4 w-4" />
                            </a>
                          )}
                          {call.voicemail_url && (
                            <a href={call.voicemail_url} target="_blank" rel="noopener noreferrer" title="Voicemail" className="text-muted-foreground hover:text-foreground">
                              <Voicemail className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Voicemail inbox */}
      {unlistenedVoicemails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Voicemails
              <Badge>{unlistenedVoicemails.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {unlistenedVoicemails.map((call: any) => (
              <div key={call.id} className="py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {call.participants
                        ? `${call.participants.first_name} ${call.participants.last_name}`
                        : call.profiles?.full_name ?? call.from_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {call.from_number} ·{" "}
                      {call.started_at ? new Date(call.started_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <a href={call.voicemail_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Voicemail className="h-4 w-4" /> Play
                    </Button>
                  </a>
                </div>
                {call.voicemail_transcription && (
                  <p className="text-sm bg-muted rounded p-2 italic text-muted-foreground">
                    &ldquo;{call.voicemail_transcription}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CallStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "default",
    "in-progress": "default",
    failed: "destructive",
    "no-answer": "secondary",
    busy: "secondary",
    canceled: "outline",
    ringing: "secondary",
    initiated: "secondary",
  };
  return (
    <Badge variant={(map[status] as any) ?? "outline"} className="text-xs capitalize">
      {status.replace("-", " ")}
    </Badge>
  );
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
