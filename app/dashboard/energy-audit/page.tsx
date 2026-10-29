import { SectionHeader } from "@/components/dashboard/section-header";
import { EnergyAuditAdmin } from "@/components/energy-audit/energy-audit-admin";
import { getEnergyAuditStats, listEnergyAudits } from "@/lib/energy-audit/submissions";
import { McpReadableToggle } from "@/components/assessments/mcp-readable-toggle";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

export const dynamic = "force-dynamic";

export default async function EnergyAuditResultsPage() {
  const [audits, stats, profile] = await Promise.all([listEnergyAudits(), getEnergyAuditStats(), getCurrentProfile()]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Energy Audit"
        description="Who has completed the Energy Audit, their score, and which energy they're renewing. Reflections stay private to the person who wrote them."
      />
      {profile?.role === ROLES.SUPER_ADMIN && <McpReadableToggle assessment="energy-audit" />}
      <EnergyAuditAdmin audits={audits} stats={stats} />
    </div>
  );
}
