"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PARTICIPANT_STATUSES } from "@/lib/participants/constants";

type Participant = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  wave: string | null;
  source: string | null;
  relationship_category: string | null;
  participant_type: string;
  check_in_status: string;
  journey_status: string;
  survey_status: string;
  inner_circle_status: string;
  story_permission_granted: boolean;
  follow_up_permission_granted: boolean;
  notes: string | null;
};

export function ParticipantEditor({ participant }: { participant: Participant }) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const [form, setForm] = useState({
    firstName: participant.first_name ?? "",
    lastName: participant.last_name ?? "",
    email: participant.email ?? "",
    phone: participant.phone ?? "",
    wave: participant.wave ?? "",
    source: participant.source ?? "",
    relationshipCategory: participant.relationship_category ?? "",
    participantType: participant.participant_type ?? "general_participant",
    checkInStatus: participant.check_in_status ?? "not_started",
    journeyStatus: participant.journey_status ?? "not_started",
    surveyStatus: participant.survey_status ?? "not_sent",
    innerCircleStatus: participant.inner_circle_status ?? "not_invited",
    storyPermissionGranted: participant.story_permission_granted ?? false,
    followUpPermissionGranted: participant.follow_up_permission_granted ?? false,
    notes: participant.notes ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch(`/api/participants/${participant.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ ...form, actionToken }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Participant could not be saved.");
      setLoading(false);
      return;
    }

    setMessage("Participant updated in Supabase.");
    setLoading(false);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="First name" value={form.firstName} onChange={(value) => updateField("firstName", value)} required />
        <TextField label="Last name" value={form.lastName} onChange={(value) => updateField("lastName", value)} required />
        <TextField label="Email" value={form.email} onChange={(value) => updateField("email", value)} required type="email" />
        <TextField label="Phone" value={form.phone} onChange={(value) => updateField("phone", value)} type="tel" />
        <TextField label="Wave" value={form.wave} onChange={(value) => updateField("wave", value)} />
        <TextField label="Source" value={form.source} onChange={(value) => updateField("source", value)} />
        <TextField label="Relationship category" value={form.relationshipCategory} onChange={(value) => updateField("relationshipCategory", value)} />
        <label className="space-y-2 text-sm font-medium">
          <span>Participant type</span>
          <Select value={form.participantType} onValueChange={(value) => updateField("participantType", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general_participant">General participant</SelectItem>
              <SelectItem value="pastor_elder_church_leader">Pastor/Elder/Church Leader</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <SelectField label="Check-In status" options={PARTICIPANT_STATUSES.checkIn} value={form.checkInStatus} onChange={(value) => updateField("checkInStatus", value)} />
        <SelectField label="Journey status" options={PARTICIPANT_STATUSES.journey} value={form.journeyStatus} onChange={(value) => updateField("journeyStatus", value)} />
        <SelectField label="Survey status" options={PARTICIPANT_STATUSES.survey} value={form.surveyStatus} onChange={(value) => updateField("surveyStatus", value)} />
        <SelectField label="Inner Circle status" options={PARTICIPANT_STATUSES.innerCircle} value={form.innerCircleStatus} onChange={(value) => updateField("innerCircleStatus", value)} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input checked={form.storyPermissionGranted} onChange={(event) => updateField("storyPermissionGranted", event.target.checked)} type="checkbox" />
          Story/interview permission granted
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input checked={form.followUpPermissionGranted} onChange={(event) => updateField("followUpPermissionGranted", event.target.checked)} type="checkbox" />
          Follow-up permission granted
        </label>
      </div>
      <label className="space-y-2 text-sm font-medium">
        <span>Internal notes</span>
        <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" onChange={(event) => updateField("notes", event.target.value)} value={form.notes} />
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <Button disabled={loading} type="submit">
        <Save className="h-4 w-4" />
        {loading ? "Saving..." : "Save participant"}
      </Button>
    </form>
  );
}

function TextField({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Input onChange={(event) => onChange(event.target.value)} required={required} type={type} value={value} />
    </label>
  );
}

function SelectField({ label, options, value, onChange }: { label: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
        </SelectContent>
      </Select>
    </label>
  );
}
