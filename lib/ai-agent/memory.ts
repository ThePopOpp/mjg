import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AgentMemory = { key: string; value: string; updated_at: string };

// Save (or update) a durable memory fact, keyed by `key`.
export async function saveAgentMemory(input: { key: string; value: string; createdBy?: string; expiresAt?: string | null }) {
  const key = input.key.trim().toLowerCase().replace(/\s+/g, "_").slice(0, 80);
  if (!key || !input.value.trim()) throw new Error("Both key and value are required.");
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("agent_memory")
    .upsert(
      {
        key,
        value: input.value.trim().slice(0, 2000),
        created_by: input.createdBy ?? null,
        expires_at: input.expiresAt ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    )
    .select("key, value, updated_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAgentMemory(key: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("agent_memory")
    .delete()
    .eq("key", key.trim().toLowerCase().replace(/\s+/g, "_"));
  if (error) throw error;
  return { key };
}

// Recall the most recently updated, non-expired memories.
export async function getAgentMemories(limit = 40): Promise<AgentMemory[]> {
  const supabase = createSupabaseAdminClient();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("agent_memory")
    .select("key, value, updated_at")
    .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

// Render recalled memories as a system-prompt block.
export function renderMemoryForPrompt(memories: AgentMemory[]): string {
  if (!memories.length) return "";
  const lines = memories.map((m) => `- ${m.key}: ${m.value}`).join("\n");
  return `\n\nKNOWN MEMORY (durable facts you saved earlier — treat as background context, verify before acting on anything time-sensitive):\n${lines}`;
}
