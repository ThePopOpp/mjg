import { headers } from "next/headers";
import { SectionHeader } from "@/components/dashboard/section-header";
import { ClaudeConnectorAdmin, type ConnectorOverview } from "@/components/claude-connector/connector-admin";
import { getMcpOverview } from "@/lib/mcp/admin";
import { AGENT_SCOPE_DOMAINS } from "@/lib/mcp/scopes";
import { TOOLS } from "@/lib/tools";

export const dynamic = "force-dynamic";
export const metadata = { title: "Claude & Agents — MJG Dashboard" };

// The Claude connector (MCP): lets Super Admins operate MJG from Claude, and
// later lets agents do so with scoped tokens. See lib/mcp.
export default async function ClaudeConnectorPage() {
  // Embedded rows (profile, token) are single objects at runtime; untyped supabase-js calls them arrays.
  const overview = await getMcpOverview();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "michaeljgauthier.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = process.env.MCP_PUBLIC_ORIGIN?.replace(/\/$/, "") || `${proto}://${host}`;
  const counts = { total: TOOLS.length + 1, high: TOOLS.filter((t) => t.risk === "high").length };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Claude & Agents"
        description="Operate MJG from Claude. Super Admins connect with their own MJG sign-in; agents use tokens limited to the areas you choose. Every action is logged."
      />
      <ClaudeConnectorAdmin initial={overview as unknown as ConnectorOverview} connectorUrl={`${origin}/mcp`} scopeDomains={[...AGENT_SCOPE_DOMAINS]} toolCounts={counts} />
    </div>
  );
}
