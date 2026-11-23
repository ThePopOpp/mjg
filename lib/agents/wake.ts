import { createHmac } from "node:crypto";

// Wakes the agent harness (Paperclip) when work lands in the MJG task queue, so
// an agent starts now instead of on its next heartbeat. Optional: without
// PAPERCLIP_WEBHOOK_URL nothing is sent and agents simply poll agent_task_next.
//
// POST <PAPERCLIP_WEBHOOK_URL>
//   X-MJG-Event:      task.created | task.requeued
//   X-MJG-Timestamp:  unix seconds
//   X-MJG-Signature:  sha256=<hex HMAC-SHA256 of "<timestamp>.<raw body>" with PAPERCLIP_WEBHOOK_SECRET>
//   body: { event, task: { id, title, priority, due_at, agent } }
// The body never carries task instructions: the agent reads those through the
// connector with its own token (agent_task_next / agent_task_get).

export type WakeEvent = "task.created" | "task.requeued";

export function signWake(secret: string, timestamp: string, body: string) {
  return `sha256=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

export async function wakeAgents(
  event: WakeEvent,
  task: { id: string; title: string; priority?: string | null; due_at?: string | null },
  agentName: string | null,
) {
  const url = process.env.PAPERCLIP_WEBHOOK_URL?.trim();
  if (!url) return;
  const secret = process.env.PAPERCLIP_WEBHOOK_SECRET?.trim() ?? "";
  const body = JSON.stringify({
    event,
    task: { id: task.id, title: task.title, priority: task.priority ?? "normal", due_at: task.due_at ?? null, agent: agentName },
  });
  const timestamp = String(Math.floor(Date.now() / 1000));
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MJG-Event": event,
        "X-MJG-Timestamp": timestamp,
        ...(secret ? { "X-MJG-Signature": signWake(secret, timestamp, body) } : {}),
      },
      body,
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) console.warn(`[agents] wake webhook answered ${res.status}`);
  } catch (error) {
    // Never fail task creation over a missed wake-up: the agent's heartbeat still finds it.
    console.warn("[agents] wake webhook failed", error instanceof Error ? error.message : error);
  }
}
