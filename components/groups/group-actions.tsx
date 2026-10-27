"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buttonClass } from "@/components/marketing/primitives";
import { STATUS_LABELS, type FinderMode, type ReservationStatus } from "@/lib/facilitator-groups/shared";

async function post(url: string, method: string, body: Record<string, unknown>) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

const AFTER: Record<string, string> = {
  confirmed: "You're in! We emailed you the meeting details, including the address.",
  pending: "Request sent. The facilitator will review it and you'll get an email when they respond.",
  waitlisted: "This group is full, so you're on the waitlist. We'll email you if a spot opens.",
};

/** Message the facilitator / request a spot — the two actions on a group listing. */
export function GroupActions({
  groupId, slug, facilitatorName, spotsLeft, bookingMode, mode, opensLabel, signedIn, isOwner, reservation,
}: {
  groupId: string;
  slug: string;
  facilitatorName: string;
  spotsLeft: number;
  bookingMode: "auto" | "approval";
  mode: FinderMode;
  opensLabel: string | null;
  signedIn: boolean;
  isOwner: boolean;
  reservation: { id: string; status: string; partySize: number } | null;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"message" | "request" | null>(null);
  const [message, setMessage] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [mine, setMine] = useState(reservation);

  const next = `/groups/${slug}`;
  const registerHref = `/register?next=${encodeURIComponent(next)}`;
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const full = spotsLeft <= 0;

  if (isOwner) {
    return (
      <div className="rounded-xl border bg-muted/40 p-5 text-sm">
        This is your group. <Link href={`/dashboard/facilitator-listing?group=${groupId}`} className="font-semibold text-gold-deep underline-offset-4 hover:underline dark:text-gold-light">Manage it in your dashboard</Link>.
      </div>
    );
  }

  if (mode !== "open") {
    return (
      <div className="rounded-xl border bg-muted/40 p-5">
        <p className="font-display text-lg">Sign-ups open {opensLabel ?? "soon"}</p>
        <p className="mt-1 text-sm text-muted-foreground">You&rsquo;ll be able to request a spot and message the facilitator then.{signedIn ? "" : " Create your free account now so you're ready."}</p>
        {!signedIn ? <Link href={registerHref} className={buttonClass("primary", "mt-4 w-full")}>Create your account</Link> : null}
      </div>
    );
  }

  async function send() {
    setBusy(true);
    setError(null);
    try {
      if (dialog === "message") {
        await post(`/api/groups/${groupId}/message`, "POST", { message });
        setDone(`Sent. ${facilitatorName} will reply in your MJG messages — we'll email you when they do.`);
        setMessage("");
      } else {
        const data = await post(`/api/groups/${groupId}/reserve`, "POST", { partySize, message });
        setMine({ id: data.reservation.id, status: data.reservation.status, partySize });
        setDone(data.already ? `You already have a request for this group (${STATUS_LABELS[data.reservation.status as ReservationStatus] ?? data.reservation.status}).` : AFTER[data.reservation.status] ?? "Done.");
        setMessage("");
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!mine || !confirm(mine.status === "confirmed" ? "Give up your spot in this group?" : "Withdraw your request?")) return;
    setBusy(true);
    try {
      await post(`/api/groups/${groupId}/reserve`, "DELETE", { reservationId: mine.id });
      setMine(null);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Couldn't cancel.");
    } finally {
      setBusy(false);
    }
  }

  function open(which: "message" | "request") {
    setDone(null);
    setError(null);
    setDialog(which);
  }

  return (
    <div className="space-y-3">
      {mine ? (
        <div className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm">
          <p className="font-semibold text-foreground">{STATUS_LABELS[mine.status as ReservationStatus] ?? mine.status}{mine.partySize > 1 ? ` · ${mine.partySize} spots` : ""}</p>
          <p className="mt-1 text-muted-foreground">
            {mine.status === "confirmed" ? "Your spot is saved. The meeting details are in your email and dashboard." : mine.status === "pending" ? "Waiting for the facilitator to respond." : "You'll hear from us if a spot opens."}
          </p>
          <button type="button" onClick={cancel} disabled={busy} className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
            {mine.status === "confirmed" ? "Give up my spot" : "Withdraw request"}
          </button>
        </div>
      ) : signedIn ? (
        <button type="button" onClick={() => open("request")} className={buttonClass("primary", "w-full")}>
          {full ? "Join the waitlist" : bookingMode === "auto" ? "Reserve a spot" : "Request a spot"}
        </button>
      ) : (
        <Link href={registerHref} className={buttonClass("primary", "w-full")}>{full ? "Join the waitlist" : bookingMode === "auto" ? "Reserve a spot" : "Request a spot"}</Link>
      )}

      {signedIn ? (
        <button type="button" onClick={() => open("message")} className={buttonClass("outline", "w-full")}>
          <MessageSquareText className="h-4 w-4" /> Message {facilitatorName.split(" ")[0]}
        </button>
      ) : (
        <Link href={registerHref} className={buttonClass("outline", "w-full")}><MessageSquareText className="h-4 w-4" /> Message {facilitatorName.split(" ")[0]}</Link>
      )}

      <p className="text-center text-xs text-muted-foreground">
        {!signedIn ? <span className="block">Free account required. Already have one? <Link href={loginHref} className="underline underline-offset-4">Sign&nbsp;in</Link>.</span> : null}
        <span className="block">{bookingMode === "auto" ? "Instant booking while spots last." : "The facilitator approves each request."}</span>
        <span className="block">Your email address stays private.</span>
      </p>

      <Dialog open={dialog !== null} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {dialog === "message" ? `Message ${facilitatorName}` : full ? "Join the waitlist" : bookingMode === "auto" ? "Reserve your spot" : "Request a spot"}
            </DialogTitle>
          </DialogHeader>
          {done ? (
            <div className="space-y-4">
              <p className="text-sm">{done}</p>
              <button type="button" onClick={() => setDialog(null)} className={buttonClass("primary", "w-full")}>Done</button>
            </div>
          ) : (
            <div className="space-y-4">
              {dialog === "request" ? (
                <label className="block text-sm">
                  <span className="font-medium">How many spots?</span>
                  <span className="block text-xs text-muted-foreground">Coming with a friend or your spouse? Save a spot for them too.</span>
                  <select value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="mt-1.5 h-10 w-full rounded-md border bg-background px-3">
                    {[1, 2, 3, 4].map((n) => <option key={n} value={n} disabled={!full && n > Math.max(1, spotsLeft)}>{n}</option>)}
                  </select>
                </label>
              ) : null}
              <label className="block text-sm">
                <span className="font-medium">{dialog === "message" ? "Your message" : "A note for the facilitator (optional)"}</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={dialog === "message" ? 5 : 3}
                  maxLength={dialog === "message" ? 2000 : 1000}
                  placeholder={dialog === "message" ? "Hi! I'm interested in your group — …" : "Anything they should know?"}
                  className="mt-1.5 w-full rounded-md border bg-background p-3 text-sm outline-none focus:border-gold"
                />
              </label>
              <p className="text-xs text-muted-foreground">
                {dialog === "message" ? "Sent through MJG messages — neither of you sees the other's email address." : "We'll email you as soon as there's an update."}
              </p>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <button type="button" onClick={send} disabled={busy || (dialog === "message" && !message.trim())} className={buttonClass("primary", "w-full disabled:opacity-60")}>
                {busy ? "Sending…" : dialog === "message" ? "Send message" : full ? "Join the waitlist" : bookingMode === "auto" ? "Reserve" : "Send request"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
