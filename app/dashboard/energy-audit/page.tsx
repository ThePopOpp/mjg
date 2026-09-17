import { SectionHeader } from "@/components/dashboard/section-header";
import { EnergyAuditAdmin } from "@/components/energy-audit/energy-audit-admin";
import { getEnergyAuditStats, listEnergyAudits } from "@/lib/energy-audit/submissions";

export const dynamic = "force-dynamic";

export default async function EnergyAuditResultsPage() {
  const [audits, stats] = await Promise.all([listEnergyAudits(), getEnergyAuditStats()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Energy Audit"
        description="Who has completed the Energy Audit, their score, and which energy they're renewing. Reflections stay private to the person who wrote them."
      />
      <EnergyAuditAdmin audits={audits} stats={stats} />
    </div>
  );
}
