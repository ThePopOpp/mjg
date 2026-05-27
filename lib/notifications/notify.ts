import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "check_in_completed"
  | "general_survey_completed"
  | "pastor_elder_survey_completed"
  | "inner_circle_submitted"
  | "follow_up_requested"
  | "story_permission_granted"
  | "church_interest"
  | "form_submission_error"
  | "email_journey_issue";

export async function createDashboardNotification(input: {
  type: NotificationType;
  title: string;
  message: string;
  participantId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("notifications").insert({
    type: input.type,
    title: input.title,
    message: input.message,
    participant_id: input.participantId ?? null,
    destination: "dashboard",
    status: "queued",
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("Notification insert failed", error);
  }
}
