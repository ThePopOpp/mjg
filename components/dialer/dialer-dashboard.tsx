"use client";

import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Voicemail, Mic, MessageSquare, RotateCcw, RefreshCw, Clock,
} from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Softphone } from "./softphone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  voicemail_transcription: string | null;
  started_at: string | null;
  participants: { first_name: string; last_name: string } | null;
  profiles: { full_name: string } | null;
};

type ExpandedRow = { id: string; type: "recording" | "voicemail" | "transcript" } | null;

export function DialerDashboard() {
  const actionToken = useDashboardActionToken();
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState<ExpandedRow>(null);
  const [callbackNumber, setCallbackNumber] = useState<string | null>(null);

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

  const stats = useMemo(() => ({
    total: calls.length,
    inbound: calls.filter((c) => c.direction === "inbound").length,
    outbound: calls.filter((c) => c.direction === "outbound").length,
    missed: calls.filter((c) => c.status === "no-answer" || c.status === "busy").length,
    talkTime: calls.reduce((sum, c) => sum + (c.duration_seconds ?? 0), 0),
    voicemails: calls.filter((c) => c.voicemail_url).length,
    recordings: calls.filter((c) => c.recording_url).length,
  }), [calls]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case "inbound":    return calls.filter((c) => c.direction === "inbound");
      case "outbound":   return calls.filter((c) => c.direction === "outbound");
      case "missed":     return calls.filter((c) => c.status === "no-answer" || c.status === "busy");
      case "voicemails": return calls.filter((c) => c.voicemail_url);
      case "recordings": return calls.filter((c) => c.recording_url);
      default:           return calls;
    }
  }, [calls, activeTab]);

  function toggleRow(id: string, type: "recording" | "voicemail" | "transcript") {
    setExpanded((prev) =>
      prev?.id === id && prev?.type === type ? null : { id, type }
    );
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
            <Button
              variant="outline" size="sm"
              onClick={() => fetchCalls(true)}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
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
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      Loading call log…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
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
                            <TableCell colSpan={7} className="bg-muted/40 px-6 py-4">
                              {expanded?.type === "recording" && call.recording_url && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recording</p>
                                  <audio controls preload="none" className="w-full h-10">
                                    <source src={call.recording_url} type="audio/mpeg" />
                                  </audio>
                                  {call.transcription_text && (
                                    <p className="text-sm italic text-muted-foreground border-l-2 border-border pl-3 mt-2">
                                      &ldquo;{call.transcription_text}&rdquo;
                                    </p>
                                  )}
                                </div>
                              )}
                              {expanded?.type === "voicemail" && call.voicemail_url && (
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Voicemail</p>
                                  <audio controls preload="none" className="w-full h-10">
                                    <source src={call.voicemail_url} type="audio/mpeg" />
                                  </audio>
                                  {call.voicemail_transcription && (
                                    <p className="text-sm italic text-muted-foreground border-l-2 border-border pl-3 mt-2">
                                      &ldquo;{call.voicemail_transcription}&rdquo;
                                    </p>
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
