import { SectionHeader } from "@/components/dashboard/section-header";
import { DialerDashboard } from "@/components/dialer/dialer-dashboard";

export default function DialerPage() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Dialer" description="Softphone, call logs, recordings, and voicemails." />
      <DialerDashboard />
    </div>
  );
}
