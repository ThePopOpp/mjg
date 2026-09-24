import { NextRequest, NextResponse } from "next/server";
import { actionTokenOf, fail, requireWebsiteActor } from "@/lib/website/http";
import { MJG_BRAND_VOICE } from "@/lib/website/brand";
import { logWebsiteAudit } from "@/lib/website/data";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

// Inline AI actions (spec §34). These rewrite ONE field of text in place and
// return it to the editor — they never write to the database, so the owner is
// always the one who decides whether the suggestion is kept.
const MODES: Record<string, string> = {
  rewrite: "Rewrite this so it reads better, keeping the meaning and roughly the same length.",
  shorten: "Make this noticeably shorter while keeping the point intact.",
  expand: "Expand this with one or two more sentences of substance. Do not pad.",
  clearer: "Make this clearer and easier to understand. Prefer short sentences and plain words.",
  conversational: "Make this warmer and more conversational, as if speaking to one person.",
  cta: "Rewrite this as a stronger call to action: specific, active, and inviting rather than pushy.",
  seo: "Rewrite this to read well and naturally include the page's topic, for search engines and people alike.",
  grammar: "Fix grammar, spelling and punctuation only. Change nothing else.",
  brand: "Rewrite this in the MJG brand voice described above.",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireWebsiteActor(request, actionTokenOf(body));

    const instruction = MODES[String(body.mode)];
    if (!instruction) throw new Error("Unknown writing action.");
    const source = String(body.text ?? "").slice(0, 8000);
    if (!source.trim()) throw new Error("There is no text to work with yet.");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Steward is not configured on this environment (OPENAI_API_KEY is missing).");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              `${MJG_BRAND_VOICE}\n\nYou are editing one field on a marketing page. Return ONLY the rewritten text: ` +
              "no preamble, no quotes around it, no explanation. Keep any Markdown formatting (**bold**, *italic*, " +
              "[links](/page), - bullets) that the original used. Never invent facts, numbers, names or testimonials.",
          },
          {
            role: "user",
            content:
              `Page: ${String(body.pageTitle ?? "Untitled")}\nSection: ${String(body.blockLabel ?? "")}\n` +
              `Field: ${String(body.fieldLabel ?? "")}\n\nInstruction: ${instruction}\n\nText:\n${source}`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Steward could not complete that rewrite (${res.status}).`);

    const data = await res.json();
    const result = String(data?.choices?.[0]?.message?.content ?? "").trim();
    if (!result) throw new Error("Steward returned nothing for that rewrite.");

    await logWebsiteAudit({
      actorId: actor.id,
      actorType: "steward",
      action: "assist.inline_rewrite",
      resourceType: "page",
      resourceId: body.pageId ?? null,
      summary: `Suggested a "${String(body.mode)}" rewrite for ${String(body.fieldLabel ?? "a field")}. Nothing was saved.`,
    });

    return NextResponse.json({ text: result });
  } catch (error) {
    return fail(error, "Could not rewrite that text.");
  }
}
