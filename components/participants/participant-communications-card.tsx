"use client";

import { useState } from "react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail } from "lucide-react";

interface ParticipantCommunicationsCardProps {
  participantId: string;
  smsOptIn: boolean;
  emailOptIn: boolean;
  smsOptInAt?: string | null;
  smsOptOutAt?: string | null;
  emailOptInAt?: string | null;
  emailOptOutAt?: string | null;
}

export function ParticipantCommunicationsCard({
  participantId,
  smsOptIn: initialSmsOptIn,
  emailOptIn: initialEmailOptIn,
  smsOptInAt,
  smsOptOutAt,
  emailOptInAt,
  emailOptOutAt,
}: ParticipantCommunicationsCardProps) {
  const token = useDashboardActionToken();
  const [smsOptIn, setSmsOptIn] = useState(initialSmsOptIn);
  const [emailOptIn, setEmailOptIn] = useState(initialEmailOptIn);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function updateOpt(channel: "sms" | "email", eventType: "opt_in" | "opt_out") {
    setSaving(`${channel}_${eventType}`);
    setMessage("");
    try {
      const res = await fetch("/api/admin/communications/opt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionToken: token,
          entityType: "participant",
          entityIds: [participantId],
          channel,
          eventType,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (channel === "sms") setSmsOptIn(eventType === "opt_in");
        else setEmailOptIn(eventType === "opt_in");
        setMessage("Updated.");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error ?? "Failed to update.");
      }
    } finally {
      setSaving(null);
    }
  }

  function formatDate(iso: string | null | undefined) {
    return iso ? new Date(iso).toLocaleDateString() : null;
  }

  return (
    <Card>
      <CardHeader><CardTitle>Communications</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* SMS row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">SMS</p>
              <p className="text-xs text-muted-foreground">
                {smsOptIn
                  ? `Opted in${formatDate(smsOptInAt) ? ` · ${formatDate(smsOptInAt)}` : ""}`
                  : `Opted out${formatDate(smsOptOutAt) ? ` · ${formatDate(smsOptOutAt)}` : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={smsOptIn ? "default" : "secondary"}>{smsOptIn ? "Opted in" : "Opted out"}</Badge>
            <Button
              size="sm"
              variant="outline"
              disabled={saving !== null}
              onClick={() => updateOpt("sms", smsOptIn ? "opt_out" : "opt_in")}
            >
              {saving?.startsWith("sms") ? "…" : smsOptIn ? "Opt out" : "Opt in"}
            </Button>
          </div>
        </div>

        {/* Email row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Email</p>
              <p className="text-xs text-muted-foreground">
                {emailOptIn
                  ? `Opted in${formatDate(emailOptInAt) ? ` · ${formatDate(emailOptInAt)}` : ""}`
                  : `Opted out${formatDate(emailOptOutAt) ? ` · ${formatDate(emailOptOutAt)}` : ""}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={emailOptIn ? "default" : "secondary"}>{emailOptIn ? "Opted in" : "Opted out"}</Badge>
            <Button
              size="sm"
              variant="outline"
              disabled={saving !== null}
              onClick={() => updateOpt("email", emailOptIn ? "opt_out" : "opt_in")}
            >
              {saving?.startsWith("email") ? "…" : emailOptIn ? "Opt out" : "Opt in"}
            </Button>
          </div>
        </div>

        {message && (
          <p className={`text-xs ${message === "Updated." ? "text-green-600" : "text-destructive"}`}>{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
