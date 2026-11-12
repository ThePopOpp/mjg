// Steward's teaching library search.
//
// The Steward V2 source documents live in an OpenAI vector store (built by
// scripts/steward-library-build.mjs; id in steward/library/manifest.json). This
// is the same file search a ChatGPT project runs over its uploaded files, which
// is how Mike's ChatGPT Steward grounds its teaching — so the app does it the
// same way.
//
// Plain fetch, no path aliases: the response-quality harness imports this file
// directly with Node, so it must not depend on the Next.js build.
//
// What comes back is REFERENCE MATERIAL, never instructions. The caller labels
// it that way for the model, and nothing in a snippet can grant a tool, an
// entitlement or a change of rules (SRC04).

export type LibraryHit = { source: string; score: number; text: string };

/** Per-snippet cap. Enough for a section with its context, not a whole chapter. */
const MAX_CHARS = 2400;

export async function searchLibrary(
  query: string,
  opts: { apiKey: string; vectorStoreId: string; maxResults?: number },
): Promise<LibraryHit[]> {
  const q = query.trim().slice(0, 500);
  if (!q) return [];

  const res = await fetch(`https://api.openai.com/v1/vector_stores/${opts.vectorStoreId}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ query: q, max_num_results: Math.min(Math.max(opts.maxResults ?? 6, 1), 10), rewrite_query: true }),
  });
  if (!res.ok) throw new Error(`Library search failed (${res.status}).`);

  const body = (await res.json()) as {
    data?: { filename?: string; score?: number; content?: { type: string; text?: string }[] }[];
  };
  return (body.data ?? []).map((hit) => ({
    source: (hit.filename ?? "unknown").replace(/\.(md|txt|pdf|docx)$/i, ""),
    score: Math.round((hit.score ?? 0) * 1000) / 1000,
    text: (hit.content ?? [])
      .map((c) => c.text ?? "")
      .join("\n")
      .slice(0, MAX_CHARS),
  }));
}
