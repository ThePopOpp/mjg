import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/server";
import { getParticipantCheckIns } from "@/lib/pilot/portal-data";
import { getCheckInSubmissionsByEmail } from "@/lib/check-in/submissions";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default async function PortalHomePage() {
  const profile = await getCurrentProfile();
  const email = profile?.email ?? "";
  const [legacy, submissions] = email
    ? await Promise.all([getParticipantCheckIns(email), getCheckInSubmissionsByEmail(email)])
    : [[], []];
  // Merge the current Created for More assessment with any legacy pilot check-ins,
  // newest first, into one progress list.
  const history = [
    ...submissions.map((s) => ({ id: s.id, created_at: s.created_at, total_score: s.total_score ?? 0, stage: s.stage ?? "—", lowest: s.lowest_layer ?? "—" })),
    ...legacy.map((r) => ({ id: r.id, created_at: r.created_at, total_score: r.total_score, stage: r.score_range_category ?? "—", lowest: r.lowest_area_label ?? "—" })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const firstName = profile?.firstName?.trim();

  const checkInHref =
    "/check-in?" +
    new URLSearchParams({
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      email,
      source: "direct_email",
    }).toString();

  const latest = history[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-gold,#b9975a)]">Created for More</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight">
          Welcome{firstName ? `, ${firstName}` : ""}.
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          This is your space for the Stewardship Blueprint Check-In. Movement is seen over time, not in a single score — take the Check-In, then revisit it to see where you are headed.
        </p>
      </div>

      {/* Take / retake CTA */}
      <Card>
        <CardHeader>
          <CardTitle>{latest ? "Revisit your Check-In" : "Take the Check-In"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm text-muted-foreground">
            {latest
              ? "A single check-in shows you where you are. Revisiting it shows you where you are headed — a good rhythm is every 30 days, or before and after a 6-week group."
              : "Set aside 15 quiet minutes. Rate 28 statements across the seven Blueprint layers and receive your Blueprint Alignment Score, snapshot, and a recommended next step."}
          </p>
          <Button asChild className="shrink-0">
            <Link href={checkInHref}>{latest ? "Take it again" : "Start the Check-In"}</Link>
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold">Your progress</h2>
        {history.length ? (
          <div className="mt-3 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left">
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Date</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Score</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Stage</th>
                  <th className="px-4 py-2.5 font-medium text-muted-foreground">Lowest layer</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2.5 text-muted-foreground">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums">{r.total_score} <span className="font-normal text-muted-foreground">/ 140</span></td>
                    <td className="px-4 py-2.5">{r.stage}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{r.lowest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            No check-ins yet. Your results will appear here once you complete your first Check-In.
          </p>
        )}
      </div>
    </div>
  );
}
