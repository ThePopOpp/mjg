"use client";

import * as React from "react";
import { MessageSquare, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AgentChat } from "@/components/ai-agent/agent-chat";
import { TrainingDocs } from "@/components/ai-agent/training-docs";

type View = "chat" | "training";

export function AiAgentWorkspace({ canManageTraining }: { canManageTraining: boolean }) {
  const [view, setView] = React.useState<View>("chat");

  // Nothing to switch between without the training tab — render the chat as it was.
  if (!canManageTraining) return <AgentChat />;

  return (
    <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
      <TabsList>
        <TabsTrigger value="chat" className="gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Chat</TabsTrigger>
        <TabsTrigger value="training" className="gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> Training Docs</TabsTrigger>
      </TabsList>
      <TabsContent value="chat" className="mt-5"><AgentChat /></TabsContent>
      <TabsContent value="training" className="mt-5"><TrainingDocs /></TabsContent>
    </Tabs>
  );
}
