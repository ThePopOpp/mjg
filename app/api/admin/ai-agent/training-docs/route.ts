import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { convertToMarkdown, autoSummary } from "@/lib/ai-agent/training-docs/convert";
import {
  listTrainingDocs, getTrainingDoc, createTrainingDoc, updateTrainingDoc, deleteTrainingDoc,
} from "@/lib/ai-agent/training-docs/data";
import { logUserActivity } from "@/lib/user-management/repository";

// Training Docs — upload reference material for Steward. Files are converted to
// markdown on ingest (see lib/ai-agent/training-docs/convert.ts) and the original
// is kept in storage so it stays downloadable.
// Super-admin only, matching the AI Agent surface.

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB — these get parsed in-process
const BUCKET = "mjg-media";

function errStatus(m: string) {
  return /authentication/i.test(m) ? 401 : /permission|required|super/i.test(m) ? 403 : 500;
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    // ?id= returns the body too, for the preview drawer.
    if (id) return NextResponse.json({ doc: await getTrainingDoc(id) });
    return NextResponse.json({ docs: await listTrainingDocs() });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load training docs.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireSuperAdmin(request);
    const form = await request.formData();
    const file = form.get("file");

    // Pasted text — no file, no storage round trip.
    if (!(file instanceof File)) {
      const text = String(form.get("text") ?? "").trim();
      const title = String(form.get("title") ?? "").trim();
      if (!text) return NextResponse.json({ error: "Attach a file or paste some text." }, { status: 400 });
      if (!title) return NextResponse.json({ error: "Give it a title." }, { status: 400 });
      const doc = await createTrainingDoc({
        title, contentMd: text, sourceKind: "paste", status: "ready",
        summary: String(form.get("summary") ?? "").trim() || autoSummary(text, title),
        tags: parseTags(form.get("tags")),
        actorId: actor.id, actorEmail: actor.email ?? null,
      });
      await logUserActivity({ actorUserId: actor.id, action: "agent_training_doc_added", entityType: "agent_training_doc", entityId: doc.id, metadata: { source: "paste", title } }).catch(() => {});
      return NextResponse.json({ doc });
    }

    if (file.size > MAX_BYTES) return NextResponse.json({ error: "File exceeds 25 MB." }, { status: 413 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    const conversion = await convertToMarkdown(buffer, file.name, mime);

    // Keep the original regardless of conversion outcome: a doc Steward can't read
    // is still a doc the team may want to download. A storage failure isn't fatal —
    // the markdown is what the agent actually needs.
    let fileUrl: string | null = null;
    try {
      const sb = createSupabaseAdminClient();
      const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
      const path = `agent-training/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, buffer, { contentType: mime, upsert: false });
      if (!error) fileUrl = sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    } catch { /* keep going — conversion already succeeded or failed on its own merits */ }

    const title = String(form.get("title") ?? "").trim() || file.name.replace(/\.[^.]+$/, "");
    const doc = await createTrainingDoc({
      title,
      summary: String(form.get("summary") ?? "").trim() || autoSummary(conversion.markdown, title),
      contentMd: conversion.markdown,
      sourceKind: "upload",
      fileName: file.name,
      fileUrl,
      mimeType: mime,
      sizeBytes: file.size,
      status: conversion.status,
      conversionError: conversion.error ?? null,
      tags: parseTags(form.get("tags")),
      actorId: actor.id,
      actorEmail: actor.email ?? null,
    });

    await logUserActivity({
      actorUserId: actor.id, action: "agent_training_doc_added", entityType: "agent_training_doc", entityId: doc.id,
      metadata: { source: "upload", file: file.name, mime, status: conversion.status },
    }).catch(() => {});

    return NextResponse.json({ doc });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body?.actionToken);
    const { id, actionToken, ...patch } = body ?? {};
    void actionToken;
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    const doc = await updateTrainingDoc(String(id), patch);
    await logUserActivity({ actorUserId: actor.id, action: "agent_training_doc_updated", entityType: "agent_training_doc", entityId: String(id), metadata: { fields: Object.keys(patch) } }).catch(() => {});
    return NextResponse.json({ doc });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Update failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function DELETE(request: Request) {
  try {
    const actor = await requireSuperAdmin(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    await deleteTrainingDoc(id);
    await logUserActivity({ actorUserId: actor.id, action: "agent_training_doc_deleted", entityType: "agent_training_doc", entityId: id }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Delete failed.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

function parseTags(value: FormDataEntryValue | null): string[] {
  return String(value ?? "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 12);
}
