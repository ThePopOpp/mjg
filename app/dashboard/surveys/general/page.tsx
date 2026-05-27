import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default function GeneralSurveyPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="General Survey" description="Review participant feedback from the general Created for More survey." />
      <EmptyState icon={MessageSquareText} title="General survey responses" description="Responses, sentiment, and follow-up flags will appear here." />
    </div>
  );
}
