"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, MessageSquareText } from "lucide-react";
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

const FIELD = "mt-1.5 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-gold disabled:cursor-not-allowed disabled:opacity-60";
const LABEL = "block text-sm font-medium";

/**
 * The sign-up form on a group listing, plus "Message the facilitator".
 *
 * Inline rather than behind a button, so the way in is visible on the page.
 * A visitor without an account fills in their name, email and a password
 * alongside the request: we create a Participant account, sign them in, and
 * send the request in one go. Before Find a Group is Open the form is shown
 * but disabled, so people can see what joining involves.
 */
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
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [note, setNote] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [account, setAccount] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [messageDone, setMessageDone] = useState<string | null>(null);
  const [mine, setMine] = useState(reservation);
  // Set once an account exists, so a retry after a failed request doesn't try to register again.
  const [registered, setRegistered] = useState(false);

  const next = `/groups/${slug}`;
  const registerHref = `/register?next=${encodeURIComponent(next)}`;
  const loginHref = `/login?next=${encodeURIComponent(next)}`;
  const full = spotsLeft <= 0;
  const open = mode === "open";
  const firstName = facilitatorName.split(" ")[0];
  const action = full ? "Join the waitlist" : bookingMode === "auto" ? "Reserve a spot" : "Request a spot";

  if (isOwner) {
    return (
      <div className="rounded-xl border bg-muted/40 p-5 text-sm">
        This is your group. <Link href={`/dashboard/facilitator-listing?group=${groupId}`} className="font-semibold text-gold-deep underline-offset-4 hover:underline dark:text-gold-light">Manage it in your dashboard</Link>.
      </div>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (!signedIn && !registered) {
        await post("/api/auth/register", "POST", { ...account, role: "participant" });
        setRegistered(true);
        const signIn = await fetch("/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: account.email, password: account.password }),
        }).catch(() => null);
        if (!signIn?.ok) throw new Error("Your account is ready, but we couldn't sign you in. Sign in to finish your request.");
      }
      const data = await post(`/api/groups/${groupId}/reserve`, "POST", { partySize, message: note });
      setMine({ id: data.reservation.id, status: data.reservation.status, partySize });
      setDone(
        data.already
          ? `You already have a request for this group (${STATUS_LABELS[data.reservation.status as ReservationStatus] ?? data.reservation.status}).`
          : AFTER[data.reservation.status] ?? "Done.",
      );
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function sendMessage() {
    setBusy(true);
    setError(null);
    try {
      await post(`/api/groups/${groupId}/message`, "POST", { message });
      setMessageDone(`Sent. ${facilitatorName} will reply in your MJG messages — we'll email you when they do.`);
      setMessage("");
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
      setDone(null);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Couldn't cancel.");
    } finally {
      setBusy(false);
    }
  }

  const needsSignIn = Boolean(error && registered && !signedIn);

  return (
    <div className="space-y-3">
      {mine ? (
        <div className="rounded-xl border border-gold/50 bg-gold/10 p-4 text-sm">
          <p className="font-semibold text-foreground">{STATUS_LABELS[mine.status as ReservationStatus] ?? mine.status}{mine.partySize > 1 ? ` · ${mine.partySize} spots` : ""}</p>
          <p className="mt-1 text-muted-foreground">
            {done ?? (mine.status === "confirmed" ? "Your spot is saved. The meeting details are in your email and dashboard." : mine.status === "pending" ? "Waiting for the facilitator to respond." : "You'll hear from us if a spot opens.")}
          </p>
          <button type="button" onClick={cancel} disabled={busy} className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
            {mine.status === "confirmed" ? "Give up my spot" : "Withdraw request"}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="rounded-xl border p-4">
          <p className="font-display text-lg">{action}</p>
          {open ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {bookingMode === "auto" ? "Instant booking while spots last." : "The facilitator approves each request."}
            </p>
          ) : (
            <p className="mt-2 rounded-md bg-gold/10 px-3 py-2 text-xs leading-relaxed text-foreground">
              Sign-ups open {opensLabel ?? "soon"}. You&rsquo;ll be able to send this then.
            </p>
          )}

          <fieldset disabled={!open || busy} className="mt-4 space-y-3">
            {!signedIn && !registered ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className={LABEL}>
                    First name
                    <input required autoComplete="given-name" value={account.firstName} onChange={(e) => setAccount({ ...account, firstName: e.target.value })} className={FIELD} />
                  </label>
                  <label className={LABEL}>
                    Last name
                    <input required autoComplete="family-name" value={account.lastName} onChange={(e) => setAccount({ ...account, lastName: e.target.value })} className={FIELD} />
                  </label>
                </div>
                <label className={LABEL}>
                  Email
                  <input required type="email" autoComplete="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} className={FIELD} />
                </label>
                <label className={LABEL}>
                  Create a password
                  <span className="relative block">
                    <input
                      required
                      minLength={8}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={account.password}
                      onChange={(e) => setAccount({ ...account, password: e.target.value })}
                      className={`${FIELD} pr-10`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-2 top-1/2 mt-[3px] -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </span>
                  <span className="mt-1 block text-xs font-normal text-muted-foreground">At least 8 characters. This creates your free MJG account.</span>
                </label>
              </>
            ) : null}

            <label className={LABEL}>
              How many spots?
              <select value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className={FIELD}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n} disabled={!full && n > Math.max(1, spotsLeft)}>{n === 1 ? "Just me" : `${n} people`}</option>)}
              </select>
              <span className="mt-1 block text-xs font-normal text-muted-foreground">Coming with your spouse or a friend? Save a spot for them too.</span>
            </label>
            <label className={LABEL}>
              Note for {firstName} <span className="font-normal text-muted-foreground">(optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} placeholder="Anything they should know?" className="mt-1.5 w-full rounded-md border bg-background p-3 text-sm outline-none focus:border-gold disabled:cursor-not-allowed disabled:opacity-60" />
            </label>

            {error ? (
              <p className="text-sm text-destructive">
                {/already exists/i.test(error) ? (
                  <>That email already has an MJG account. <Link href={loginHref} className="font-semibold underline underline-offset-4">Sign in</Link> to request your spot.</>
                ) : (
                  <>
                    {error}
                    {needsSignIn ? <> <Link href={loginHref} className="font-semibold underline underline-offset-4">Sign in</Link></> : null}
                  </>
                )}
              </p>
            ) : null}

            <button type="submit" className={buttonClass("primary", "w-full disabled:opacity-60")}>
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : action}
            </button>
          </fieldset>

          {!signedIn && !registered ? (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Already have an account? <Link href={loginHref} className="font-semibold underline underline-offset-4">Sign&nbsp;in</Link>
            </p>
          ) : null}
        </form>
      )}

      {open ? (
        signedIn || registered ? (
          <button type="button" onClick={() => { setMessageDone(null); setError(null); setMessageOpen(true); }} className={buttonClass("outline", "w-full")}>
            <MessageSquareText className="h-4 w-4" /> Message {firstName}
          </button>
        ) : (
          <Link href={registerHref} className={buttonClass("outline", "w-full")}><MessageSquareText className="h-4 w-4" /> Message {firstName}</Link>
        )
      ) : null}

      <p className="text-center text-xs text-muted-foreground">Your email address stays private.</p>

      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Message {facilitatorName}</DialogTitle>
          </DialogHeader>
          {messageDone ? (
            <div className="space-y-4">
              <p className="text-sm">{messageDone}</p>
              <button type="button" onClick={() => setMessageOpen(false)} className={buttonClass("primary", "w-full")}>Done</button>
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Hi! I'm interested in your group — …"
                className="w-full rounded-md border bg-background p-3 text-sm outline-none focus:border-gold"
              />
              <p className="text-xs text-muted-foreground">Sent through MJG messages — neither of you sees the other&rsquo;s email address.</p>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <button type="button" onClick={sendMessage} disabled={busy || !message.trim()} className={buttonClass("primary", "w-full disabled:opacity-60")}>
                {busy ? "Sending…" : "Send message"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
