import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getExperienceById, getFacilitators } from "@/lib/experiences/repository";
import { ExperienceActions } from "@/components/experiences/experience-actions";
import { ExperienceSchedule } from "@/components/experiences/experience-schedule";
import { FREQUENCY_LABELS, OFFSET_UNIT_LABELS } from "@/lib/experiences/types";

function cadenceLabel(exp: any) {
  if (exp.frequency === "custom" && exp.custom_interval_value && exp.custom_interval_unit) {
    return `Every ${exp.custom_interval_value} ${OFFSET_UNIT_LABELS[exp.custom_interval_unit as keyof typeof OFFSET_UNIT_LABELS].toLowerCase()}`;
  }
  return FREQUENCY_LABELS[exp.frequency as keyof typeof FREQUENCY_LABELS] ?? exp.frequency;
}

export const dynamic = "force-dynamic";

export default async function ExperienceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=/dashboard/experiences/${id}`);
  if (!can(profile.role, PERMISSIONS.MANAGE_EXPERIENCES)) redirect("/access-restricted");

  const [data, facilitators] = await Promise.all([getExperienceById(id), getFacilitators()]);
  if (!data) notFound();
  const { experience, attendees, sendEvents } = data as any;
  const facilitatorOptions = facilitators.map((f: any) => ({ id: f.id, name: f.full_name || `${f.first_name ?? ""} ${f.last_name ?? ""}`.trim() || f.email }));

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
      <div className="flex items-center justify-between">
        <Link href="/dashboard/experiences" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All experiences
        </Link>
        <ExperienceActions
          experience={{ id: experience.id, name: experience.name, start_date: experience.start_date, start_time: experience.start_time, status: experience.status, facilitator_id: experience.facilitator_id, preview: experience.experience_previews ?? null }}
          facilitators={facilitatorOptions}
        />
      </div>

      <SectionHeader
        eyebrow={experience.experience_types?.name ?? "Experience"}
        title={experience.name}
        description={`${cadenceLabel(experience)} · ${experience.duration_weeks} steps · starts ${new Date(`${experience.start_date}T00:00:00Z`).toLocaleDateString([], { timeZone: "UTC", dateStyle: "medium" })} ${(experience.start_time ?? "").slice(0, 5)}`}
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
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
          <p className="text-sm text-muted-foreground">Reschedule any email that hasn&apos;t gone out, or send one now. Changing the experience start date/time (edit, above) re-times every pending email at once.</p>
        </CardHeader>
        <CardContent className="p-0">
          <ExperienceSchedule
            experienceId={experience.id}
            rows={sendEvents.map((e: any) => ({
              id: e.id,
              step_number: e.step_number,
              email: attendeeById.get(e.attendee_id)?.email ?? null,
              label: e.label ?? null,
              scheduled_at: e.scheduled_at,
              status: e.status,
              sent_at: e.sent_at,
              error_message: e.error_message ?? null,
            }))}
          />
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
