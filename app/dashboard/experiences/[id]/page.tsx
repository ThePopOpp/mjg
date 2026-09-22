import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatCarousel } from "@/components/experiences/stat-carousel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentProfile } from "@/lib/auth/server";
import { can, PERMISSIONS } from "@/lib/rbac/permissions";
import { getExperienceById, getFacilitators } from "@/lib/experiences/repository";
import { getExperienceBacklog } from "@/lib/experiences/add-attendee";
import { getCheckInSubmissionsForEmails } from "@/lib/check-in/submissions";
import { ExperienceActions } from "@/components/experiences/experience-actions";
import { ExperienceSchedule } from "@/components/experiences/experience-schedule";
import { AddAttendeeButton } from "@/components/experiences/add-attendee-button";
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

  const [data, facilitators, backlog] = await Promise.all([getExperienceById(id), getFacilitators(), getExperienceBacklog(id)]);
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

  // Next / last send for the stat row. Compared by time value, never lexicographically —
  // these arrive as ISO strings but sorting them as text is a trap worth avoiding outright.
  const pickTime = (values: (string | null)[], choose: (a: number, b: number) => number) => {
    const times = values.map((v) => (v ? new Date(v).getTime() : NaN)).filter((n) => Number.isFinite(n));
    return times.length ? new Date(times.reduce((a, b) => choose(a, b))) : null;
  };
  // Experiences are anchored to Arizona time, which has no DST.
  const azTime = (d: Date | null) =>
    d ? d.toLocaleString("en-US", { timeZone: "America/Phoenix", weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

  const nextSend = pickTime(sendEvents.filter((e: any) => e.status === "scheduled").map((e: any) => e.scheduled_at), Math.min);
  const lastSent = pickTime(sendEvents.map((e: any) => e.sent_at), Math.max);
  const nextSendLabel = azTime(nextSend);
  const nextSendDetail = nextSend ? "Arizona time" : "Nothing scheduled";
  const lastSentLabel = azTime(lastSent);
  const lastSentDetail = lastSent ? "Arizona time" : "Nothing sent yet";

  // Attendee lookup for the schedule table.
  const attendeeById = new Map<string, any>(attendees.map((a: any) => [a.id, a]));

  // Per-attendee challenge status: Completed once they submit the Created-for-More Check-In,
  // Emailed once at least one step has gone out to them, otherwise Pending.
  const attendeeEmails = attendees.map((a: any) => a.email).filter(Boolean) as string[];
  const checkIns = attendeeEmails.length ? await getCheckInSubmissionsForEmails(attendeeEmails) : [];
  const completedEmails = new Set(checkIns.map((c: any) => String(c.email ?? "").toLowerCase()));
  const emailedAttendeeIds = new Set(sendEvents.filter((e: any) => e.status === "sent").map((e: any) => e.attendee_id));
  const challengeStatus = (a: any): "Completed" | "Emailed" | "Pending" =>
    a.email && completedEmails.has(String(a.email).toLowerCase())
      ? "Completed"
      : emailedAttendeeIds.has(a.id)
        ? "Emailed"
        : "Pending";
  const CHALLENGE_TONE: Record<string, string> = {
    Completed: "bg-primary text-primary-foreground",
    Emailed: "bg-secondary text-secondary-foreground",
    Pending: "bg-muted text-muted-foreground",
  };

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

      {/* One sliding row rather than two static grids — auto-advances, pauses on hover. */}
      <StatCarousel
        items={[
          { key: "status", icon: "activity", label: "Status", value: experience.status, detail: "Experience state" },
          { key: "facilitator", icon: "user-check", label: "Facilitator", value: facilitatorName, detail: "Group leader" },
          { key: "attendees", icon: "users", label: "Attendees", value: String(attendees.length), detail: "People in this group" },
          { key: "scheduled-sends", icon: "mail", label: "Scheduled sends", value: String(sendEvents.length), detail: "Emails × recipients" },
          { key: "next", icon: "calendar", label: "Next email date & time", value: nextSendLabel, detail: nextSendDetail },
          { key: "last", icon: "history", label: "Last email date & time", value: lastSentLabel, detail: lastSentDetail },
          { key: "sent", icon: "check", label: "Sent", value: String(counts.sent ?? 0), detail: "Individual sends" },
          { key: "scheduled", icon: "clock", label: "Scheduled", value: String(counts.scheduled ?? 0), detail: "Still to go out" },
          { key: "skipped", icon: "skip", label: "Skipped", value: String(counts.skipped ?? 0), detail: "Suppressed sends" },
          { key: "failed", icon: "alert", label: "Failed", value: String(counts.failed ?? 0), detail: "Needs attention" },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Attendees</CardTitle>
          <AddAttendeeButton experienceId={experience.id} backlog={backlog} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Challenge</TableHead>
                <TableHead>Opted out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map((a: any) => {
                const cs = challengeStatus(a);
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.name || "-"}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CHALLENGE_TONE[cs]}`}>{cs}</span>
                    </TableCell>
                    <TableCell>{a.opted_out ? "Yes" : "No"}</TableCell>
                  </TableRow>
                );
              })}
              {!attendees.length ? <TableRow><TableCell colSpan={4}>No attendees.</TableCell></TableRow> : null}
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

