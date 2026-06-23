import { SectionHeader } from "@/components/dashboard/section-header";
import { AgentChat } from "@/components/ai-agent/agent-chat";

export default function AiAgentPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="AI Agent"
        title="Siggey AI Operations Agent"
        description="Ask about pilot data, draft outreach, and—after your approval—send SMS and email."
      />
      <AgentChat />
    </div>
  );
}
