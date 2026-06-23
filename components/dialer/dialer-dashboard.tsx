"use client";

import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Voicemail, Mic, MessageSquare, RotateCcw, RefreshCw, Clock,
  NotebookPen, Loader2, Sparkles,
} from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Softphone } from "./softphone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Call = {
  id: string;
  direction: "inbound" | "outbound";
  from_number: string;
  to_number: string;
  status: string;
  duration_seconds: number | null;
  recording_url: string | null;
  voicemail_url: string | null;
  transcription_text: string | null;
  transcription_status: string | null;
  voicemail_transcription: string | null;
  price: number | null;
  price_unit: string | null;
  notes: string | null;
  started_at: string | null;
  answered_at: string | null;
  ended_at: string | null;
  participants: { first_name: string; last_name: string } | null;
  profiles: { full_name: string } | null;
};

type ExpandedRow = { id: string; type: "recording" | "voicemail" | "transcript" | "notes" } | null;

export function DialerDashboard() {
  const actionToken = useDashboardActionToken();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState<ExpandedRow>(null);
  const [callbackNumber, setCallbackNumber] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const fetchCalls = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch("/api/admin/voice/calls?limit=100", {
        headers: { "x-mjg-action-token": actionToken },
      });
      if (res.ok) {
        const data = await res.json();
        setCalls(data.calls ?? []);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [actionToken]);

  useEffect(() => { fetchCalls(); }, [fetchCalls]);

  // A call counts as missed if Twilio reported no-answer/busy, or if an inbound
  // call ended without ever being answered by the agent (rang out to voicemail).
  const isMissed = useCallback(
    (c: Call) =>
      c.status === "no-answer" ||
      c.status === "busy" ||
      (c.direction === "inbound" && !c.answered_at && !!c.ended_at),
    [],
  );

  const stats = useMemo(() => ({
    total: calls.length,
    inbound: calls.filter((c) => c.direction === "inbound").length,
    outbound: calls.filter((c) => c.direction === "outbound").length,
    missed: calls.filter(isMissed).length,
    talkTime: calls.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0),
    voicemails: calls.filter((c) => c.voicemail_url).length,
    recordings: calls.filter((c) => c.recording_url).length,
    cost: calls.reduce((sum, c) => sum + (c.price ?? 0), 0),
    costUnit: calls.find((c) => c.price_unit)?.price_unit ?? "USD",
  }), [calls, isMissed]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "inbound":    return calls.filter((c) => c.direction === "inbound");
      case "outbound":   return calls.filter((c) => c.direction === "outbound");
      case "missed":     return calls.filter(isMissed);
      case "voicemails": return calls.filter((c) => c.voicemail_url);
      case "recordings": return calls.filter((c) => c.recording_url);
      default:           return calls;
    }
  }, [calls, activeTab, isMissed]);

  function toggleRow(id: string, type: "recording" | "voicemail" | "transcript" | "notes", note?: string | null) {
    setTranscribeError(null);
    setExpanded((prev) => {
      const next = prev?.id === id && prev?.type === type ? null : { id, type };
      if (next?.type === "notes") setNoteDraft(note ?? "");
      return next;
    });
  }

  async function saveNote(id: string) {
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/voice/calls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, notes: noteDraft }),
      });
      if (res.ok) {
        setCalls((prev) => prev.map((c) => (c.id === id ? { ...c, notes: noteDraft } : c)));
        setExpanded(null);
      }
    } finally {
      setSavingNote(false);
    }
  }

  async function transcribe(id: string, target: "recording" | "voicemail") {
    setTranscribingId(id);
    setTranscribeError(null);
    try {
      const res = await fetch(`/api/admin/voice/calls/${id}/transcribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken, target }),
      });
      const data = await res.json();
      if (res.ok && data.text) {
        setCalls((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  transcription_status: "completed",
                  ...(target === "voicemail"
                    ? { voicemail_transcription: data.text }
                    : { transcription_text: data.text }),
                }
              : c,
          ),
        );
      } else {
        setTranscribeError(data.error ?? "Transcription failed.");
      }
    } catch {
      setTranscribeError("Transcription failed.");
    } finally {
      setTranscribingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Phone}         label="Total calls"  value={loading ? "—" : stats.total} />
        <StatCard icon={PhoneIncoming} label="Inbound"      value={loading ? "—" : stats.inbound} />
        <StatCard icon={PhoneOutgoing} label="Outbound"     value={loading ? "—" : stats.outbound} />
        <StatCard icon={PhoneMissed}   label="Missed"       value={loading ? "—" : stats.missed} />
        <StatCard icon={Clock}         label="Talk time"    value={loading ? "—" : formatTalkTime(stats.talkTime)} />
        <StatCard icon={Voicemail}     label="Voicemails"   value={loading ? "—" : stats.voicemails} />
      </div>

      {/* ── Softphone + Call log ── */}
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Softphone</CardTitle></CardHeader>
          <CardContent>
            <Softphone
              callbackNumber={callbackNumber}
              onCallbackNumberUsed={() => setCallbackNumber(null)}
              onCallEnded={() => fetchCalls(true)}
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle>Call log</CardTitle>
            <div className="flex items-center gap-3">
              {!loading && stats.cost > 0 && (
                <span className="text-xs text-muted-foreground">
                  Total cost: <span className="font-medium text-foreground">{formatCost(stats.cost, stats.costUnit)}</span>
                </span>
              )}
              <Button
                variant="outline" size="sm"
                onClick={() => fetchCalls(true)}
                disabled={refreshing}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>

          <div className="px-6 pb-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8 flex-wrap">
                <TabsTrigger value="all"        className="text-xs px-3">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="inbound"    className="text-xs px-3">Inbound ({stats.inbound})</TabsTrigger>
                <TabsTrigger value="outbound"   className="text-xs px-3">Outbound ({stats.outbound})</TabsTrigger>
                <TabsTrigger value="missed"     className="text-xs px-3">Missed ({stats.missed})</TabsTrigger>
                <TabsTrigger value="voicemails" className="text-xs px-3">Voicemails ({stats.voicemails})</TabsTrigger>
                <TabsTrigger value="recordings" className="text-xs px-3">Recordings ({stats.recordings})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <CardContent className="p-0 flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[110px]">Direction</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      Loading call log…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                      No calls yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((call) => {
                    const contactName = call.participants
                      ? `${call.participants.first_name} ${call.participants.last_name}`.trim()
                      : call.profiles?.full_name ?? null;
                    const contactType = call.participants ? "participant" : call.profiles ? "user" : null;
                    const displayNumber = call.direction === "inbound" ? call.from_number : call.to_number;
                    const isThisExpanded = expanded?.id === call.id;

                    return (
                      <Fragment key={call.id}>
                        <TableRow className={isThisExpanded ? "border-b-0" : ""}>
                          <TableCell>
                            <Badge variant="outline" className="gap-1 text-xs">
                              {call.direction === "inbound"
                                ? <PhoneIncoming className="h-3 w-3" />
                                : <PhoneOutgoing className="h-3 w-3" />}
                              {call.direction}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-medium text-sm">{contactName ?? "—"}</span>
                              {contactType && (
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 w-fit capitalize">
                                  {contactType}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{displayNumber}</TableCell>
                          <TableCell><CallStatusBadge status={call.status} /></TableCell>
                          <TableCell className="text-sm">
                            {call.duration_seconds != null ? formatDuration(call.duration_seconds) : "—"}
                          </TableCell>
                          <TableCell className="text-sm tabular-nums">
                            {call.price != null ? formatCost(call.price, call.price_unit) : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {call.started_at
                              ? new Date(call.started_at).toLocaleString([], {
                                  month: "short", day: "numeric",
                                  hour: "2-digit", minute: "2-digit",
                                })
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-0.5">
                              {call.recording_url && (
                                <ActionBtn
                                  title="Play recording"
                                  active={isThisExpanded && expanded?.type === "recording"}
                                  onClick={() => toggleRow(call.id, "recording")}
                                >
                                  <Mic className="h-3.5 w-3.5" />
                                </ActionBtn>
                              )}
                              {call.voicemail_url && (
                                <ActionBtn
                                  title="Play voicemail"
                                  active={isThisExpanded && expanded?.type === "voicemail"}
                                  onClick={() => toggleRow(call.id, "voicemail")}
                                >
                                  <Voicemail className="h-3.5 w-3.5" />
                                </ActionBtn>
                              )}
                              {(call.transcription_text || call.voicemail_transcription) && (
                                <ActionBtn
                                  title="View transcript"
                                  active={isThisExpanded && expanded?.type === "transcript"}
                                  onClick={() => toggleRow(call.id, "transcript")}
                                >
                                  <MessageSquare className="h-3.5 w-3.5" />
                                </ActionBtn>
                              )}
                              <ActionBtn
                                title={call.notes ? "Edit notes" : "Add notes"}
                                active={isThisExpanded && expanded?.type === "notes"}
                                onClick={() => toggleRow(call.id, "notes", call.notes)}
                                hoverColor={call.notes ? "hover:text-primary" : "hover:text-primary"}
                              >
                                <NotebookPen className={`h-3.5 w-3.5 ${call.notes ? "text-primary" : ""}`} />
                              </ActionBtn>
                              {displayNumber && (
                                <ActionBtn
                                  title="Call back"
                                  active={callbackNumber === displayNumber}
                                  onClick={() => setCallbackNumber(displayNumber)}
                                  hoverColor="hover:text-green-600"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </ActionBtn>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {isThisExpanded && (
                          <TableRow key={`${call.id}-exp`}>
                            <TableCell colSpan={8} className="bg-muted/40 px-6 py-4">
                              {expanded?.type === "recording" && call.recording_url && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recording</p>
                                  <audio controls preload="none" className="w-full h-10">
                                    <source src={call.recording_url} type="audio/mpeg" />
                                  </audio>
                                  {call.transcription_text ? (
                                    <p className="text-sm italic text-muted-foreground border-l-2 border-border pl-3 mt-2">
                                      &ldquo;{call.transcription_text}&rdquo;
                                    </p>
                                  ) : (
                                    <TranscribeControl
                                      busy={transcribingId === call.id}
                                      error={transcribeError}
                                      onClick={() => transcribe(call.id, "recording")}
                                    />
                                  )}
                                </div>
                              )}
                              {expanded?.type === "voicemail" && call.voicemail_url && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Voicemail</p>
                                  <audio controls preload="none" className="w-full h-10">
                                    <source src={call.voicemail_url} type="audio/mpeg" />
                                  </audio>
                                  {call.voicemail_transcription ? (
                                    <p className="text-sm italic text-muted-foreground border-l-2 border-border pl-3 mt-2">
                                      &ldquo;{call.voicemail_transcription}&rdquo;
                                    </p>
                                  ) : (
                                    <TranscribeControl
                                      busy={transcribingId === call.id}
                                      error={transcribeError}
                                      onClick={() => transcribe(call.id, "voicemail")}
                                    />
                                  )}
                                </div>
                              )}
                              {expanded?.type === "transcript" && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Transcript</p>
                                  <p className="text-sm italic text-muted-foreground border-l-2 border-border pl-3">
                                    &ldquo;{call.transcription_text ?? call.voicemail_transcription}&rdquo;
                                  </p>
                                </div>
                              )}
                              {expanded?.type === "notes" && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes</p>
                                  <Textarea
                                    value={noteDraft}
                                    onChange={(e) => setNoteDraft(e.target.value)}
                                    placeholder="Add notes about this call…"
                                    rows={3}
                                    className="resize-none text-sm bg-background"
                                  />
                                  <div className="flex items-center gap-2">
                                    <Button size="sm" onClick={() => saveNote(call.id)} disabled={savingNote} className="gap-1.5">
                                      {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <NotebookPen className="h-3.5 w-3.5" />}
                                      Save notes
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setExpanded(null)}>Cancel</Button>
                                  </div>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ActionBtn({
  children, title, active, onClick, hoverColor = "hover:text-primary",
}: {
  children: React.ReactNode;
  title: string;
  active?: boolean;
  onClick: () => void;
  hoverColor?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-accent text-primary"
          : `text-muted-foreground hover:bg-accent ${hoverColor}`
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-semibold leading-none mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CallStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, string> = {
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
    <Badge variant={(variantMap[status] ?? "outline") as any} className="text-xs capitalize">
      {status.replace(/-/g, " ")}
    </Badge>
  );
}

function TranscribeControl({ busy, error, onClick }: { busy: boolean; error: string | null; onClick: () => void }) {
  return (
    <div className="space-y-1.5">
      <Button size="sm" variant="outline" onClick={onClick} disabled={busy} className="gap-1.5">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
        {busy ? "Transcribing…" : "Transcribe recording"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function formatCost(amount: number, unit: string | null) {
  const currency = unit ?? "USD";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  } catch {
    return `${amount.toFixed(4)} ${currency}`;
  }
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function formatTalkTime(totalSeconds: number) {
  if (totalSeconds === 0) return "0:00";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
