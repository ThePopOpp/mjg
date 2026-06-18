"use client";

import { useState, useRef } from "react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, Plus, Send } from "lucide-react";
import { smsSegmentCount } from "@/lib/sms/templates";

interface SmsTemplate { id: string; name: string; body: string; }
interface Participant { id: string; first_name: string; last_name: string; phone: string | null; sms_opt_in: boolean; }

interface SmsComposeProps {
  templates: SmsTemplate[];
  participants: Participant[];
}

export function SmsCompose({ templates, participants }: SmsComposeProps) {
  const token = useDashboardActionToken();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Participant[]>([]);
  const [csvContacts, setCsvContacts] = useState<Array<{ phone: string; name: string }>>([]);
  const [participantSearch, setParticipantSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredParticipants = participants.filter(
    (p) =>
      p.phone &&
      p.sms_opt_in &&
      (`${p.first_name} ${p.last_name}`.toLowerCase().includes(participantSearch.toLowerCase()) ||
        p.phone.includes(participantSearch))
  );

  const segments = smsSegmentCount(body);

  function applyTemplate(id: string) {
    setSelectedTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) setBody(tpl.body);
  }

  function addRecipient(p: Participant) {
    if (!selectedRecipients.find((r) => r.id === p.id)) {
      setSelectedRecipients((prev) => [...prev, p]);
    }
  }

  function removeRecipient(id: string) {
    setSelectedRecipients((prev) => prev.filter((r) => r.id !== id));
  }

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/sms/import-csv", {
      method: "POST",
      headers: { "x-mjg-action-token": token ?? "" },
      body: formData,
    });
    const data = await res.json();
    if (data.contacts) setCsvContacts(data.contacts);
  }

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      if (mode === "single") {
        const res = await fetch("/api/admin/sms/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionToken: token, to, body }),
        });
        const data = await res.json();
        setResult({ ok: res.ok, message: res.ok ? "Message sent!" : data.error });
      } else {
        const phoneNumbers = csvContacts.map((c) => c.phone);
        const recipientIds = selectedRecipients.map((r) => r.id);
        const res = await fetch("/api/admin/sms/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actionToken: token,
            body,
            templateId: selectedTemplateId || null,
            recipientIds: recipientIds.length ? recipientIds : [],
            phoneNumbers: phoneNumbers.length ? phoneNumbers : [],
            audience: "participants",
          }),
        });
        const data = await res.json();
        setResult({ ok: res.ok, message: res.ok ? `Sent: ${data.sent}, Failed: ${data.failed}, Skipped: ${data.skipped}` : data.error });
      }
    } finally {
      setSending(false);
    }
  }

  const totalBulkRecipients = selectedRecipients.length + csvContacts.length;

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <Button
          variant={mode === "single" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("single")}
        >
          Single recipient
        </Button>
        <Button
          variant={mode === "bulk" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("bulk")}
        >
          Bulk send
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]">
        {/* Left: recipients */}
        <div className="space-y-4">
          {mode === "single" ? (
            <Card>
              <CardHeader><CardTitle>Recipient</CardTitle></CardHeader>
              <CardContent>
                <Input
                  placeholder="+1 (555) 000-0000"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  Recipients
                  {totalBulkRecipients > 0 && (
                    <Badge variant="secondary" className="ml-2">{totalBulkRecipients} selected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Participant search */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Search participants</p>
                  <Input
                    placeholder="Name or phone..."
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    className="mb-2"
                  />
                  <div className="max-h-40 overflow-y-auto space-y-1 rounded border p-2">
                    {filteredParticipants.slice(0, 30).map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addRecipient(p)}
                        className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-sm hover:bg-accent"
                      >
                        <span>{p.first_name} {p.last_name}</span>
                        <span className="text-xs text-muted-foreground">{p.phone}</span>
                      </button>
                    ))}
                    {filteredParticipants.length === 0 && (
                      <p className="text-xs text-muted-foreground p-2">No opted-in participants with phone numbers found.</p>
                    )}
                  </div>
                </div>

                {/* Selected recipients */}
                {selectedRecipients.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedRecipients.map((r) => (
                      <Badge key={r.id} variant="secondary" className="gap-1 pl-2 pr-1">
                        {r.first_name} {r.last_name}
                        <button onClick={() => removeRecipient(r.id)} className="ml-0.5 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* CSV import */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Or import from CSV</p>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed p-4 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {csvContacts.length > 0 ? `${csvContacts.length} contacts imported` : "Drop CSV or click to upload"}
                  </div>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                  {csvContacts.length > 0 && (
                    <button onClick={() => setCsvContacts([])} className="mt-1 text-xs text-muted-foreground hover:text-destructive underline">
                      Clear CSV contacts
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: message */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Message</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {templates.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Use template</p>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— No template —</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Message body</p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={1600}
                  placeholder="Type your message... Use {{first_name}}, {{last_name}}, etc. for personalization."
                  className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>{body.length} chars</span>
                  <span>{segments} segment{segments !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {result && (
                <div className={`rounded-md p-3 text-sm ${result.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
                  {result.message}
                </div>
              )}

              <Button
                onClick={handleSend}
                disabled={sending || !body.trim() || (mode === "single" ? !to.trim() : totalBulkRecipients === 0)}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending…" : mode === "single" ? "Send Message" : `Send to ${totalBulkRecipients} recipient${totalBulkRecipients !== 1 ? "s" : ""}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
