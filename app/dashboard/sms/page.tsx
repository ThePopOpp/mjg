import { SectionHeader } from "@/components/dashboard/section-header";
import { SmsTabs } from "@/components/sms/sms-tabs";
import { SmsInbox } from "@/components/sms/sms-inbox";

export default function SmsInboxPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="SMS" description="Inbound and outbound text message conversations." />
      <SmsTabs />
      <SmsInbox />
    </div>
  );
}
