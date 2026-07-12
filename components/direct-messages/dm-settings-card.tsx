"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, MessageSquare, BellRing } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function DmSettingsCard() {
  const token = useDashboardActionToken();
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const [pushSupported, setPushSupported] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/direct-messages/preferences")
      .then((r) => r.json())
      .then((d) => { if (d.prefs) { setEmail(Boolean(d.prefs.email)); setSms(Boolean(d.prefs.sms)); } })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const supported = typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && Boolean(VAPID_PUBLIC_KEY);
    setPushSupported(supported);
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushOn(Boolean(sub)))
      .catch(() => {});
  }, []);

  async function savePrefs(next: { email: boolean; sms: boolean }) {
    setEmail(next.email);
    setSms(next.sms);
    await fetch("/api/direct-messages/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionToken: token, ...next }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const togglePush = useCallback(async (on: boolean) => {
    setPushBusy(true);
    setPushError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      if (on) {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") { setPushError("Notifications are blocked in your browser settings."); return; }
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionToken: token, subscription: sub.toJSON() }),
        });
        if (!res.ok) throw new Error("Could not save the subscription.");
        setPushOn(true);
      } else {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(sub.endpoint)}`, { method: "DELETE" });
          await sub.unsubscribe();
        }
        setPushOn(false);
      }
    } catch (e) {
      setPushError(e instanceof Error ? e.message : "Something went wrong enabling push.");
    } finally {
      setPushBusy(false);
    }
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct Messages</CardTitle>
        <CardDescription>Choose how you&rsquo;re alerted about new direct messages. Email/SMS alerts are debounced so an active back-and-forth won&rsquo;t spam you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="flex items-center justify-between gap-3 rounded-md border bg-card/60 p-3">
          <span className="flex items-center gap-2.5 text-sm">
            <BellRing className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-medium">Push notifications</span> on this device {pushSupported ? "" : <span className="text-muted-foreground">(install the app or use a supported browser)</span>}</span>
          </span>
          <Switch checked={pushOn} disabled={!pushSupported || pushBusy} onCheckedChange={togglePush} />
        </label>
        {pushError ? <p className="text-xs text-destructive">{pushError}</p> : null}

        <label className="flex items-center justify-between gap-3 rounded-md border bg-card/60 p-3">
          <span className="flex items-center gap-2.5 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-medium">Email me</span> about new messages</span>
          </span>
          <Switch checked={email} disabled={!loaded} onCheckedChange={(v) => savePrefs({ email: v, sms })} />
        </label>
        <label className="flex items-center justify-between gap-3 rounded-md border bg-card/60 p-3">
          <span className="flex items-center gap-2.5 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span><span className="font-medium">Text me</span> about new messages <span className="text-muted-foreground">(requires a phone number + SMS opt-in)</span></span>
          </span>
          <Switch checked={sms} disabled={!loaded} onCheckedChange={(v) => savePrefs({ email, sms: v })} />
        </label>
        {saved ? <p className="text-xs text-muted-foreground">Saved.</p> : null}
      </CardContent>
    </Card>
  );
}
