import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";

const PROMPTS: Record<string, string> = {
  summarize: "Summarize the document below in a few clear sentences.",
  action_items: "Extract the action items and tasks from the document below as a concise bullet list (one per line). If there are none, reply 'No action items found.'",
  improve: "Improve the clarity, grammar, and flow of the text below without changing its meaning. Return only the revised text.",
  shorten: "Make the text below more concise while keeping the key points. Return only the shortened text.",
  expand: "Expand the text below with additional relevant detail and clear structure. Return only the expanded text.",
};

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await requireSuperAdmin(request, body.actionToken);

    const action = String(body.action ?? "summarize");
    const text = String(body.text ?? "").slice(0, 14000);
    if (!text.trim()) return NextResponse.json({ error: "There's no text to work with yet." }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "AI isn't configured (OPENAI_API_KEY is missing)." }, { status: 503 });
    const envModel = process.env.OPENAI_MODEL?.trim();
    const model = envModel && !envModel.includes("your_") ? envModel : "gpt-4o";
    const instruction = PROMPTS[action] ?? PROMPTS.summarize;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a concise writing assistant inside the MJG Workspace document editor. Return only the requested content — no preamble." },
          { role: "user", content: `${instruction}\n\n---\n${text}` },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json({ error: `AI request failed (${res.status}). ${detail}`.slice(0, 300) }, { status: 502 });
    }
    const data = await res.json();
    const result = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI action failed.";
    const status = message.includes("permission") || message.includes("Authentication") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
