import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/dashboard/section-header";
import { AiAgentWorkspace } from "@/components/ai-agent/ai-agent-workspace";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

export const dynamic = "force-dynamic";

export default async function AiAgentPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/dashboard/ai-agent");

  // Training Docs shape how Steward answers everyone, so managing them is
  // super-admin only — the tab is gated rather than the page, since the chat
  // itself is open to admins (requireAdminManager on the chat route).
  const canManageTraining = profile.role === ROLES.SUPER_ADMIN;

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="AI Agent"
        title="Steward AI Operations Agent"
        description="Ask about pilot data, draft outreach, and—after your approval—send SMS and email."
      />
      <AiAgentWorkspace canManageTraining={canManageTraining} />
    </div>
  );
}
