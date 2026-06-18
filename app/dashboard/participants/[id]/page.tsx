import Link from "next/link";
import { SectionHeader } from "@/components/dashboard/section-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ParticipantEditor } from "@/components/participants/participant-editor";
import { ParticipantTagEditor } from "@/components/participants/participant-tag-editor";
import { ParticipantCommunicationsCard } from "@/components/participants/participant-communications-card";
import { getParticipantDetail } from "@/lib/dashboard/pilot-data";

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getParticipantDetail(id);

  if (!data.participant) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Participant not found" description={data.error ?? `No participant was found for ${id}.`} />
      </div>
    );
  }

  const participant = data.participant as any;
  const displayName = `${participant.first_name ?? ""} ${participant.last_name ?? ""}`.trim() || participant.email;
  const latestCheckIn = data.checkIns[0] as any;

  return (
    <div className="space-y-6">
      <SectionHeader title={displayName} description="Contact info, Check-In results, journey status, consent, notes, tags, and related activity." />

      <div className="grid gap-4 md:grid-cols-4">
        <Summary label="Check-In" value={<StatusBadge status={participant.check_in_status ?? "not_started"} />} />
        <Summary label="Survey" value={<StatusBadge status={participant.survey_status ?? "not_sent"} />} />
        <Summary label="Inner Circle" value={<StatusBadge status={participant.inner_circle_status ?? "not_invited"} />} />
        <Summary label="Score" value={participant.check_in_total_score ? `${participant.check_in_total_score} / 125` : "-"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Contact snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="Email" value={participant.email} />
            <DetailItem label="Phone" value={participant.phone} />
            <DetailItem label="Wave" value={participant.wave} />
            <DetailItem label="Source" value={participant.source} />
            <DetailItem label="Relationship" value={participant.relationship_category} />
            <DetailItem label="Type" value={formatValue(participant.participant_type)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Consent and follow-up</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <ConsentFlag label="7-day journey opt-in" enabled={participant.email_journey_opt_in} />
            <ConsentFlag label="Future updates" enabled={participant.future_updates_opt_in} />
            <ConsentFlag label="Anonymous feedback" enabled={participant.anonymous_feedback_permission} />
            <ConsentFlag label="Story/interview permission" enabled={participant.story_permission_granted} />
            <ConsentFlag label="Follow-up permission" enabled={participant.follow_up_permission_granted} />
          </CardContent>
        </Card>
      </div>

      <ParticipantCommunicationsCard
        participantId={participant.id}
        smsOptIn={participant.sms_opt_in ?? true}
        emailOptIn={participant.email_opt_in ?? true}
        smsOptInAt={participant.sms_opt_in_at ?? null}
        smsOptOutAt={participant.sms_opt_out_at ?? null}
        emailOptInAt={participant.email_opt_in_at ?? null}
        emailOptOutAt={participant.email_opt_out_at ?? null}
      />

      {participant.notes ? (
        <Card>
          <CardHeader>
            <CardTitle>Internal notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{participant.notes}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Edit participant</CardTitle>
        </CardHeader>
        <CardContent>
          <ParticipantEditor participant={participant} />
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check-In results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {latestCheckIn ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-md border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Total score</p>
                  <p className="mt-2 text-3xl font-semibold">{latestCheckIn.total_score} / 125</p>
                </div>
                <div className="rounded-md border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Lowest area</p>
                  <p className="mt-2 text-lg font-semibold">{latestCheckIn.lowest_area_label}</p>
                </div>
                <div className="rounded-md border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Score category</p>
                  <p className="mt-2 text-lg font-semibold">{latestCheckIn.score_range_category}</p>
                </div>
              </div>
            ) : null}

            {latestCheckIn?.section_scores ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Section breakdown</h3>
                {Object.entries(latestCheckIn.section_scores).map(([key, value]) => (
                  <SectionScore key={key} label={formatValue(key)} value={Number(value)} />
                ))}
              </div>
            ) : null}

            {latestCheckIn?.reflections ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Reflection answers</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(latestCheckIn.reflections).map(([key, value]) => (
                    <div key={key} className="rounded-md border bg-background p-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{formatValue(key)}</p>
                      <p className="mt-2 text-sm leading-6">{String(value || "-")}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Total</TableHead>
                  <TableHead>Lowest area</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.checkIns.map((checkIn: any) => (
                  <TableRow key={checkIn.id}>
                    <TableCell className="font-medium">{checkIn.total_score}</TableCell>
                    <TableCell>{checkIn.lowest_area_label}</TableCell>
                    <TableCell>{checkIn.score_range_category}</TableCell>
                    <TableCell>{new Date(checkIn.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!data.checkIns.length ? <TableRow><TableCell colSpan={4}>No Check-In result yet.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <ParticipantTagEditor
              participantId={participant.id}
              allTags={data.allTags as any[]}
              selectedTagIds={data.tags.map((tagRow: any) => tagRow.tag_id).filter(Boolean)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Survey responses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead>Story</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.surveys.map((survey: any) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">{survey.survey_type}</TableCell>
                    <TableCell>{survey.follow_up_permission ? "Yes" : "No"}</TableCell>
                    <TableCell>{survey.story_interview_permission ? "Yes" : "No"}</TableCell>
                    <TableCell>{new Date(survey.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {!data.surveys.length ? <TableRow><TableCell colSpan={4}>No survey response yet.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email journey</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Step</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.emailEvents.map((event: any) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.step_number}: {event.step_key}</TableCell>
                    <TableCell><StatusBadge status={event.status} /></TableCell>
                    <TableCell>{event.scheduled_at ? new Date(event.scheduled_at).toLocaleDateString() : "-"}</TableCell>
                  </TableRow>
                ))}
                {!data.emailEvents.length ? <TableRow><TableCell colSpan={3}>No email journey events yet.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.activity.map((activity: any) => (
              <div key={activity.id} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                <div>
                  <p className="font-medium">{formatValue(activity.action)}</p>
                  <p className="text-sm text-muted-foreground">
                    {activity.entity_type ?? "Record"} · {new Date(activity.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {!data.activity.length ? <p className="text-sm text-muted-foreground">No activity yet.</p> : null}
          </div>
        </CardContent>
      </Card>

      <Link className="text-sm font-medium text-primary hover:underline" href="/dashboard/participants">
        Back to participants
      </Link>
      {data.error ? <p className="text-sm text-destructive">{data.error}</p> : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value || "-"}</p>
    </div>
  );
}

function ConsentFlag({ label, enabled }: { label: string; enabled?: boolean | null }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-3">
      <span className="text-sm font-medium">{label}</span>
      <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "Yes" : "No"}</Badge>
    </div>
  );
}

function SectionScore({ label, value }: { label: string; value: number }) {
  const percent = Math.max(0, Math.min(100, Math.round((value / 25) * 100)));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value} / 25</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function formatValue(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "-";
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 text-sm font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
