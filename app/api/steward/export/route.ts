import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { canExportStewardHistory } from "@/lib/steward/export-access";
import { parseSessionStream, renderExport, type ExportConversation } from "@/lib/steward/conversation-export";
import { assessmentSnapshot } from "@/lib/steward/assessments";
import { blueprintOverview } from "@/lib/steward/agent-tools";
import { getStewardConfigOrNull } from "@/lib/steward/config";
import { assessmentLines, blueprintLines } from "@/steward/agent/lib/turn-context";
import libraryManifest from "@/steward/library/manifest.json";

// Exports the signed-in person's OWN Steward conversations as one Markdown file,
// for Mike's ChatGPT Steward to review (see lib/steward/export-access.ts for who).
//
//   GET /api/steward/export              every conversation
//   GET /api/steward/export?sessions=a,b only those (still only your own)
//
// Transcripts are read from the Steward agent's own session stream, called with
// the person's own sign-in cookie — the same request the chat page makes — so
// this route never holds a credential that could read anyone else's. The
// session ids come from steward_conversations filtered by profile, so a
// requested id that is not yours is silently not exported.

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_CONVERSATIONS = 200;
const PER_SESSION_TIMEOUT_MS = 30_000;

async function readTranscript(sessionId: string, cookie: string) {
  const base = process.env.STEWARD_AGENT_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("Steward is not configured on this server.");
  const res = await fetch(`${base}/eve/v1/sessions/${encodeURIComponent(sessionId)}/stream?includeTailIndex=1`, {
    headers: { cookie, accept: "application/x-ndjson" },
    cache: "no-store",
    signal: AbortSignal.timeout(PER_SESSION_TIMEOUT_MS),
  });
  if (res.status === 404) throw new Error("the conversation is no longer stored");
  if (!res.ok) throw new Error(`Steward returned ${res.status}`);
  return parseSessionStream(await res.text());
}

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  if (!(await canExportStewardHistory(profile.id))) {
    return NextResponse.json({ error: "Not available for this account." }, { status: 403 });
  }

  const wanted = new URL(request.url).searchParams.get("sessions")?.split(",").map((s) => s.trim()).filter(Boolean);

  const db = createSupabaseAdminClient();
  let query = db
    .from("steward_conversations")
    .select("session_id, title, started_at, last_active_at")
    .eq("profile_id", profile.id)
    .order("started_at", { ascending: true })
    .limit(MAX_CONVERSATIONS);
  if (wanted?.length) query = query.in("session_id", wanted);
  const { data: rows, error } = await query;
  if (error) return NextResponse.json({ error: "Could not list your conversations." }, { status: 500 });
  if (!rows?.length) return NextResponse.json({ error: "No conversations to export." }, { status: 404 });

  const cookie = request.headers.get("cookie") ?? "";

  // A few at a time: enough to be quick, few enough not to crowd the agent.
  const conversations: ExportConversation[] = new Array(rows.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(4, rows.length) }, async () => {
      while (next < rows.length) {
        const i = next++;
        const row = rows[i];
        const base: ExportConversation = {
          sessionId: row.session_id as string,
          title: row.title as string,
          startedAt: (row.started_at as string) ?? null,
          lastActiveAt: (row.last_active_at as string) ?? null,
          turns: [],
        };
        try {
          conversations[i] = { ...base, turns: await readTranscript(base.sessionId, cookie) };
        } catch (e) {
          conversations[i] = { ...base, unavailable: e instanceof Error ? e.message : "could not be read" };
        }
      }
    }),
  );

  const [overview, snapshot, instructionVersion] = await Promise.all([
    blueprintOverview(profile.id).catch(() => null),
    assessmentSnapshot(profile.id).catch(() => null),
    getStewardConfigOrNull("agent.instruction_version").catch(() => null),
  ]);

  const exportedAt = new Date().toISOString();
  const markdown = renderExport({
    exportedBy: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
    exportedAt,
    library: libraryManifest.label,
    instructionVersion: typeof instructionVersion === "string" ? instructionVersion : null,
    context: [...blueprintLines(overview), "", ...assessmentLines(snapshot)].join("\n"),
    conversations,
  });

  return new NextResponse(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="steward-conversations-${exportedAt.slice(0, 10)}.md"`,
      "cache-control": "no-store",
    },
  });
}
