// Which AI client is on the other end of a connection. Claude and ChatGPT both
// register themselves (dynamic client registration); the label comes from the
// name they register with or, failing that, where they ask to be sent back to.
// The migration that added client_label backfills with the same rule.

export type ClientLabel = "Claude" | "ChatGPT" | "Other";

/** Label for calls made with an agent token (no OAuth client). */
export const AGENT_LABEL = "Agent";

export function labelForClient(name: string | null | undefined, redirectUris: readonly string[] = []): ClientLabel {
  const hosts = redirectUris.join(" ");
  if (/chatgpt|openai/i.test(name ?? "") || /chatgpt\.com|openai\.com/i.test(hosts)) return "ChatGPT";
  if (/claude|anthropic/i.test(name ?? "") || /claude\.ai|claude\.com|anthropic\.com/i.test(hosts)) return "Claude";
  return "Other";
}

/**
 * Refusal text when a person's client has been switched off, or null if it may call.
 * ChatGPT is opt-in: refused until mcp_settings.chatgpt_enabled is on.
 */
export function clientGate(
  client: { client_label?: string | null; disabled_at?: string | null } | null,
  settings: { chatgptEnabled?: boolean } = {},
): string | null {
  if (client?.client_label === "ChatGPT" && !settings.chatgptEnabled) {
    return "ChatGPT isn't switched on for MJG yet. A Super Admin can turn it on in Settings → Claude & Agents → AI clients.";
  }
  if (!client?.disabled_at) return null;
  const label = client.client_label && client.client_label !== "Other" ? client.client_label : "This client";
  return `${label} is switched off for MJG in Settings → Claude & Agents.`;
}
