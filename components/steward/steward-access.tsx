"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Granting Steward access by hand.
//
// Immediately: so the two people building this can look at both the Free and
// the Full Blueprint without running a card through Stripe each time. Longer
// term: comped accounts and Inner Circle, which the docset puts in the owner
// console rather than anywhere a model can reach.
//
// A grant is recorded as a grant, never as a purchase, so a revenue figure and
// an audit can always tell the two apart.

type Entitlement = { benefit: string; source: string; endsAt: string | null };

const BENEFIT_LABEL: Record<string, string> = {
  free_blueprint: "Free Blueprint",
  full_acquisition: "Full Blueprint",
  build_window: "Build window",
  premium: "Premium",
};

export function StewardAccess() {
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<Entitlement[] | null>(null);
  const [member, setMember] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [note, setNote] = React.useState<string | null>(null);

  async function look() {
    if (!email.trim()) return;
    setBusy("look");
    setError(null);
    setNote(null);
    try {
      const res = await fetch(`/api/dashboard/steward/access?email=${encodeURIComponent(email.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not look that up.");
      setMember(json.member as string);
      setActive(json.active as Entitlement[]);
    } catch (e) {
      setMember(null);
      setActive(null);
      setError(e instanceof Error ? e.message : "Could not look that up.");
    } finally {
      setBusy(null);
    }
  }

  async function change(action: "grant" | "revoke", level: "full" | "premium") {
    if (!email.trim()) return;
    setBusy(`${action}-${level}`);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/dashboard/steward/access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), action, level, reason: "Testing" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "That did not work.");
      setNote(
        action === "grant"
          ? `${level === "premium" ? "Premium" : "Full Blueprint"} granted.`
          : `${level === "premium" ? "Premium" : "Full Blueprint"} withdrawn.`,
      );
      await look();
    } catch (e) {
      setError(e instanceof Error ? e.message : "That did not work.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Access</h2>

      <Card className="mt-3">
        <CardContent className="p-5">
          <p className="text-sm font-semibold">Grant or withdraw Steward access</p>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
            For comped accounts, and for seeing both the Free and the Full Blueprint without taking a payment.
            Recorded as a grant, never as a purchase, so revenue and audit can always tell the two apart.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void look();
              }}
              placeholder="member@example.com"
              aria-label="Member email"
              className="h-9 max-w-[22rem] text-sm"
            />
            <Button variant="outline" size="sm" className="h-9" disabled={busy !== null} onClick={() => void look()}>
              {busy === "look" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Look up
            </Button>
          </div>

          {error ? (
            <p className="mt-3 text-[13px] text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {note ? <p className="mt-3 text-[13px] text-[#b88a4a]">{note}</p> : null}

          {member ? (
            <div className="mt-4 rounded-lg border bg-muted/40 p-4">
              <p className="text-[13px]">
                <span className="font-semibold">{member}</span> currently holds:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {active && active.length > 0 ? (
                  active.map((entitlement) => (
                    <Badge key={entitlement.benefit} variant="outline" className="text-[11px]">
                      {BENEFIT_LABEL[entitlement.benefit] ?? entitlement.benefit}
                      <span className="ml-1 text-muted-foreground">· {entitlement.source}</span>
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-[11px] text-muted-foreground">
                    Free Blueprint only
                  </Badge>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-[#b88a4a] text-white hover:bg-[#a67c42]"
                  disabled={busy !== null}
                  onClick={() => void change("grant", "full")}
                >
                  {busy === "grant-full" ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                  Grant Full Blueprint
                </Button>
                <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => void change("grant", "premium")}>
                  Grant Premium
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={busy !== null}
                  onClick={() => void change("revoke", "full")}
                >
                  Withdraw Full
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  disabled={busy !== null}
                  onClick={() => void change("revoke", "premium")}
                >
                  Withdraw Premium
                </Button>
              </div>

              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                Withdrawing never deletes anything a member wrote. Their Blueprint is retained in full; only what
                they can reach changes.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
