import { MessageSquareText } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SectionHeader } from "@/components/dashboard/section-header";

export default function PastorElderSurveyPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Pastor/Elder Survey" description="Review pastor, elder, and church leader responses for content and ministry fit." />
      <EmptyState icon={MessageSquareText} title="Pastor/Elder responses" description="Reviewer responses and assigned follow-up will appear here." />
    </div>
  );
}
