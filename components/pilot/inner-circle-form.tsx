"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldLabel } from "./field";

export function InnerCircleForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/pilot/inner-circle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          willing: formData.get("willing") === "on",
          futureFeedbackPermission: formData.get("futureFeedbackPermission") === "on",
          storyInterviewPermission: formData.get("storyInterviewPermission") === "on",
          publicUseAcknowledgement: formData.get("publicUseAcknowledgement") === "on",
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Submission failed.");
      router.push("/surveys/thank-you?type=inner-circle");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <FieldLabel>Name</FieldLabel>
              <Input name="name" required />
            </div>
            <div className="space-y-2">
              <FieldLabel>Email</FieldLabel>
              <Input name="email" type="email" required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <FieldLabel>Phone, optional</FieldLabel>
              <Input name="phone" />
            </div>
          </div>
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="willing" type="checkbox" required /> I am willing to join the Stewardship Blueprint Inner Circle.</label>
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="futureFeedbackPermission" type="checkbox" required /> Michael may contact me for feedback on future resources.</label>
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="storyInterviewPermission" type="checkbox" /> Michael may contact me about a possible story, quote, or interview.</label>
          <label className="flex gap-3 rounded-md border bg-card/70 p-3 text-sm"><input name="publicUseAcknowledgement" type="checkbox" required /> I understand that nothing will be used publicly without separate permission.</label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Yes, I’m Open to Helping"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
