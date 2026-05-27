"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldLabel, SelectField, Textarea } from "./field";

type SurveyField = {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: readonly string[];
};

type SurveyFormProps = {
  surveyType: "general" | "pastor_elder";
  fields: readonly SurveyField[];
};

export function SurveyForm({ surveyType, fields }: SurveyFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const answers: Record<string, unknown> = {};

    for (const field of fields) {
      if (field.type === "checkbox") {
        answers[field.name] = formData.getAll(field.name);
      } else {
        answers[field.name] = String(formData.get(field.name) ?? "");
      }
    }

    try {
      const response = await fetch("/api/pilot/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyType, answers }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Submission failed.");
      router.push(`/surveys/thank-you?type=${surveyType}`);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map((field) => (
        <Card key={field.name}>
          <CardContent className="space-y-2 p-4">
            <FieldLabel>{field.label}</FieldLabel>
            {field.type === "textarea" ? (
              <Textarea name={field.name} required={field.required} />
            ) : field.type === "select" ? (
              <SelectField name={field.name} required={field.required} defaultValue="">
                <option value="" disabled>Select one</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </SelectField>
            ) : field.type === "checkbox" ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {field.options?.map((option) => (
                  <label key={option} className="flex gap-2 rounded-md border bg-card/70 p-3 text-sm">
                    <input name={field.name} type="checkbox" value={option} />
                    {option}
                  </label>
                ))}
              </div>
            ) : (
              <Input name={field.name} type={field.type} required={field.required} />
            )}
          </CardContent>
        </Card>
      ))}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Submit feedback"}</Button>
    </form>
  );
}
