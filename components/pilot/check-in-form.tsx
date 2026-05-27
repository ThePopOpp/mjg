"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CHECK_IN_SECTIONS, PARTICIPANT_TYPES, REFLECTION_PROMPTS, WAVE_SOURCE_VALUES, type CheckInSectionKey } from "@/lib/pilot/constants";
import { scoreCheckIn, type CheckInScores } from "@/lib/scoring/check-in";
import { FieldLabel, SelectField, Textarea } from "./field";

const initialScores = Object.fromEntries(CHECK_IN_SECTIONS.map((section) => [section.key, Array(section.questions.length).fill(0)])) as CheckInScores;

export function CheckInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scores, setScores] = useState<CheckInScores>(initialScores);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const preview = useMemo(() => {
    try {
      return scoreCheckIn(scores);
    } catch {
      return null;
    }
  }, [scores]);

  function updateScore(sectionKey: CheckInSectionKey, index: number, value: number) {
    setScores((current) => ({
      ...current,
      [sectionKey]: current[sectionKey].map((score, scoreIndex) => (scoreIndex === index ? value : score)),
    }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const reflections = Object.fromEntries(REFLECTION_PROMPTS.map((prompt, index) => [`reflection_${index + 1}`, String(formData.get(`reflection_${index + 1}`) ?? "")]));

    try {
      const result = scoreCheckIn(scores);
      const response = await fetch("/api/pilot/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            waveSource: formData.get("waveSource"),
            relationshipCategory: formData.get("relationshipCategory"),
            participantType: formData.get("participantType"),
            consent: {
              emailJourneyOptIn: formData.get("emailJourneyOptIn") === "on",
              futureUpdatesOptIn: formData.get("futureUpdatesOptIn") === "on",
              anonymousFeedbackPermission: formData.get("anonymousFeedbackPermission") === "on",
              storyInterviewPermission: formData.get("storyInterviewPermission") === "on",
              followUpPermission: formData.get("storyInterviewPermission") === "on",
            },
          },
          scores,
          reflections,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Submission failed.");

      const params = new URLSearchParams({
        score: String(result.totalScore),
        lowest: result.lowestAreaLabel,
        category: result.scoreRangeCategory,
      });
      router.push(`/check-in/thank-you?${params.toString()}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>First name</FieldLabel>
            <Input name="firstName" required />
          </div>
          <div className="space-y-2">
            <FieldLabel>Last name</FieldLabel>
            <Input name="lastName" required />
          </div>
          <div className="space-y-2">
            <FieldLabel>Email</FieldLabel>
            <Input name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <FieldLabel>Phone, optional</FieldLabel>
            <Input name="phone" />
          </div>
          <div className="space-y-2">
            <FieldLabel>Wave/source</FieldLabel>
            <SelectField name="waveSource" defaultValue={searchParams.get("source") ?? searchParams.get("wave") ?? "direct_text"}>
              {WAVE_SOURCE_VALUES.map((value) => (
                <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
              ))}
            </SelectField>
          </div>
          <div className="space-y-2">
            <FieldLabel>Relationship category</FieldLabel>
            <Input name="relationshipCategory" placeholder="Friend, family, pastor, colleague..." />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <FieldLabel>Participant type</FieldLabel>
            <SelectField name="participantType" defaultValue={searchParams.get("type") === "pastor_elder" ? PARTICIPANT_TYPES.PASTOR_ELDER : PARTICIPANT_TYPES.GENERAL}>
              <option value={PARTICIPANT_TYPES.GENERAL}>General participant</option>
              <option value={PARTICIPANT_TYPES.PASTOR_ELDER}>Pastor/Elder/Church Leader</option>
            </SelectField>
          </div>
        </CardContent>
      </Card>

      {CHECK_IN_SECTIONS.map((section) => (
        <Card key={section.key}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {section.questions.map((question, index) => (
              <div key={question} className="space-y-2">
                <FieldLabel>{question}</FieldLabel>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value} className="flex h-10 cursor-pointer items-center justify-center rounded-md border bg-card/70 text-sm font-semibold transition-colors has-[:checked]:border-[color:var(--brand-gold)] has-[:checked]:bg-[color:var(--brand-gold-2)] has-[:checked]:text-[color:var(--brand-ink)]">
                      <input className="sr-only" type="radio" name={`${section.key}_${index}`} required checked={scores[section.key][index] === value} onChange={() => updateScore(section.key, index, value)} />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {REFLECTION_PROMPTS.map((prompt, index) => (
            <div key={prompt} className="space-y-2">
              <FieldLabel>{prompt}</FieldLabel>
              <Textarea name={`reflection_${index + 1}`} required />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="emailJourneyOptIn" type="checkbox" required /> I agree to receive the 7-day Created for More email journey.</label>
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="futureUpdatesOptIn" type="checkbox" /> Michael may send me future MJG / Stewardship Blueprint updates.</label>
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="anonymousFeedbackPermission" type="checkbox" /> Michael may use my anonymous feedback to improve the book and future resources.</label>
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="storyInterviewPermission" type="checkbox" /> Michael may contact me about a possible quote, story, or interview.</label>
          {preview ? <p className="text-sm text-muted-foreground">Current score preview: {preview.totalScore} · {preview.scoreRangeCategory}</p> : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Complete the Check-In"}</Button>
        </CardContent>
      </Card>
    </form>
  );
}
