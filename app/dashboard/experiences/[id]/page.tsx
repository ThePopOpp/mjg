import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getExperienceById } from "@/lib/experiences/repository";
import { FREQUENCY_LABELS } from "@/lib/experiences/types";

export const dynamic = "force-dynamic";

function fmt(d: string | null) {
  if (!d) return "-";
  return new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/dashboard/experiences/${id}`);
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const data = await getExperienceById(id);
  if (!data) notFound();
  const { experience, attendees, sendEvents } = data as any;

  const facilitator = experience.profiles;
  const facilitatorName = facilitator
    ? facilitator.full_name || `${facilitator.first_name ?? ""} ${facilitator.last_name ?? ""}`.trim()
    : "Unassigned";

  const counts = sendEvents.reduce(
    (acc: Record<string, number>, e: any) => ({ ...acc, [e.status]: (acc[e.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  // Attendee lookup for the schedule table.
  const attendeeById = new Map<string, any>(attendees.map((a: any) => [a.id, a]));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/experiences" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All experiences
      </Link>

      <SectionHeader
        eyebrow={experience.experience_types?.name ?? "Experience"}
        title={experience.name}
        description={`${FREQUENCY_LABELS[experience.frequency as "weekly" | "biweekly"]} · ${experience.duration_weeks} weeks · starts ${new Date(`${experience.start_date}T00:00:00Z`).toLocaleDateString([], { timeZone: "UTC", dateStyle: "medium" })}`}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Status" value={experience.status} />
        <Stat label="Facilitator" value={facilitatorName} />
        <Stat label="Attendees" value={String(attendees.length)} />
        <Stat label="Scheduled sends" value={String(sendEvents.length)} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Sent" value={String(counts.sent ?? 0)} />
        <Stat label="Scheduled" value={String(counts.scheduled ?? 0)} />
        <Stat label="Skipped" value={String(counts.skipped ?? 0)} />
        <Stat label="Failed" value={String(counts.failed ?? 0)} />
      </div>

      <Card>
        <CardHeader><CardTitle>Attendees</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Opted out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.name || "-"}</TableCell>
                  <TableCell>{a.email}</TableCell>
                  <TableCell>{a.opted_out ? "Yes" : "No"}</TableCell>
                </TableRow>
              ))}
              {!attendees.length ? <TableRow><TableCell colSpan={3}>No attendees.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Schedule</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Week</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sendEvents.map((e: any) => {
                const a = attendeeById.get(e.attendee_id);
                return (
                  <TableRow key={e.id}>
                    <TableCell>Week {e.step_number}</TableCell>
                    <TableCell>{a?.email ?? "-"}</TableCell>
                    <TableCell>{fmt(e.scheduled_at)}</TableCell>
                    <TableCell className="capitalize">{e.status}{e.error_message ? ` — ${e.error_message}` : ""}</TableCell>
                    <TableCell>{fmt(e.sent_at)}</TableCell>
                  </TableRow>
                );
              })}
              {!sendEvents.length ? <TableRow><TableCell colSpan={5}>Nothing scheduled yet.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold capitalize">{value}</p>
      </CardContent>
    </Card>
  );
}
