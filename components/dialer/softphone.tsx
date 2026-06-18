"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneOff, PhoneIncoming, Mic, MicOff, Volume2, VolumeX, RotateCcw } from "lucide-react";

type CallState = "idle" | "connecting" | "ringing" | "in-progress" | "ended" | "failed";

interface IncomingCall {
  from: string;
  connection: any;
}

export function Softphone() {
  const token = useDashboardActionToken();
  const [dialNumber, setDialNumber] = useState("");
  const [callState, setCallState] = useState<CallState>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [deviceReady, setDeviceReady] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const deviceRef = useRef<any>(null);
  const connectionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initDevice = useCallback(async () => {
    if (deviceRef.current) return;
    try {
      const res = await fetch("/api/admin/voice/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionToken: token }),
      });
      const data = await res.json();
      if (!data.token) throw new Error(data.error ?? "Failed to get voice token.");

      const { Device } = await import("@twilio/voice-sdk");
      const device = new Device(data.token, {
        logLevel: 1,
        codecPreferences: ["opus", "pcmu"] as any,
        edge: ["ashburn", "sydney"],
      });

      device.on("registered", () => setDeviceReady(true));
      device.on("error", (err: Error) => setDeviceError(err.message));
      device.on("incoming", (conn: any) => {
        const from = conn.parameters?.From ?? "Unknown";
        setIncomingCall({ from, connection: conn });
        conn.on("disconnect", () => { setIncomingCall(null); endCall(); });
        conn.on("cancel", () => setIncomingCall(null));
      });

      device.register();
      deviceRef.current = device;
    } catch (err) {
      setDeviceError(err instanceof Error ? err.message : "Failed to initialize dialer.");
    }
  }, [token]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      deviceRef.current?.destroy();
    };
  }, []);

  function startTimer() {
    setCallDuration(0);
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function endCall() {
    connectionRef.current?.disconnect();
    connectionRef.current = null;
    setCallState("ended");
    stopTimer();
    setTimeout(() => setCallState("idle"), 2000);
  }

  async function makeCall() {
    if (!deviceRef.current || !dialNumber.trim()) return;
    setCallState("connecting");
    try {
      const conn = await deviceRef.current.connect({
        params: { To: dialNumber.trim() },
      });
      connectionRef.current = conn;
      conn.on("accept", () => { setCallState("in-progress"); startTimer(); });
      conn.on("disconnect", endCall);
      conn.on("reject", () => { setCallState("idle"); });
      setCallState("ringing");
    } catch {
      setCallState("failed");
      setTimeout(() => setCallState("idle"), 2000);
    }
  }

  function acceptIncoming() {
    if (!incomingCall) return;
    incomingCall.connection.accept();
    connectionRef.current = incomingCall.connection;
    setIncomingCall(null);
    setCallState("in-progress");
    startTimer();
  }

  function rejectIncoming() {
    incomingCall?.connection.reject();
    setIncomingCall(null);
  }

  function toggleMute() {
    connectionRef.current?.mute(!isMuted);
    setIsMuted((m) => !m);
  }

  function formatDuration(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function appendDigit(d: string) {
    setDialNumber((prev) => prev + d);
    connectionRef.current?.sendDigits(d);
  }

  const dialPad = ["1","2","3","4","5","6","7","8","9","*","0","#"];

  return (
    <div className="mx-auto w-full max-w-sm space-y-4">
      {/* Initialize button */}
      {!deviceReady && !deviceError && (
        <Button onClick={initDevice} variant="outline" className="w-full gap-2">
          <Phone className="h-4 w-4" />
          Initialize Dialer
        </Button>
      )}

      {deviceError && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {deviceError}
          <button onClick={() => { setDeviceError(null); deviceRef.current = null; initDevice(); }} className="ml-2 underline">Retry</button>
        </div>
      )}

      {deviceReady && (
        <div className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-1.5 text-xs text-green-700">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Dialer ready · +1 (480) 439-3335
        </div>
      )}

      {/* Incoming call banner */}
      {incomingCall && (
        <div className="rounded-lg border-2 border-primary bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <PhoneIncoming className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <p className="text-sm font-semibold">Incoming call</p>
              <p className="text-xs text-muted-foreground">{incomingCall.from}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={acceptIncoming} className="flex-1 gap-2 bg-green-600 hover:bg-green-700">
              <Phone className="h-4 w-4" /> Accept
            </Button>
            <Button onClick={rejectIncoming} variant="destructive" className="flex-1 gap-2">
              <PhoneOff className="h-4 w-4" /> Decline
            </Button>
          </div>
        </div>
      )}

      {/* Dial pad */}
      {callState === "idle" && !incomingCall && (
        <div className="space-y-3">
          <Input
            value={dialNumber}
            onChange={(e) => setDialNumber(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="text-center text-lg font-mono tracking-widest"
          />
          <div className="grid grid-cols-3 gap-2">
            {dialPad.map((d) => (
              <button
                key={d}
                onClick={() => appendDigit(d)}
                className="flex h-12 items-center justify-center rounded-lg border text-lg font-medium hover:bg-accent transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
          <Button
            onClick={makeCall}
            disabled={!deviceReady || !dialNumber.trim()}
            className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Phone className="h-5 w-5" /> Call
          </Button>
        </div>
      )}

      {/* Active call controls */}
      {(callState === "connecting" || callState === "ringing" || callState === "in-progress") && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <p className="text-lg font-semibold">{dialNumber || "Unknown"}</p>
            {callState === "in-progress" ? (
              <p className="font-mono text-2xl text-primary">{formatDuration(callDuration)}</p>
            ) : (
              <Badge variant="secondary">{callState === "connecting" ? "Connecting…" : "Ringing…"}</Badge>
            )}
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${isMuted ? "bg-destructive text-destructive-foreground" : "hover:bg-accent"}`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <button
              onClick={endCall}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 transition-colors"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsSpeakerOff((v) => !v)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${isSpeakerOff ? "bg-destructive text-destructive-foreground" : "hover:bg-accent"}`}
            >
              {isSpeakerOff ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          {callState === "in-progress" && (
            <div className="grid grid-cols-3 gap-2">
              {dialPad.map((d) => (
                <button
                  key={d}
                  onClick={() => appendDigit(d)}
                  className="flex h-10 items-center justify-center rounded-lg border text-sm font-medium hover:bg-accent transition-colors"
                >
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {callState === "ended" && (
        <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
          <RotateCcw className="h-4 w-4" /> Call ended
        </div>
      )}
    </div>
  );
}
