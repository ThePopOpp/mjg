import { NextResponse } from "next/server";
import { requireActiveProfile } from "@/lib/user-management/auth";
import { ITEM_KINDS, createItem, deleteItem, listItems, updateItem, uploadRecording, type ItemKind } from "@/lib/dashboard/overview/items";

// The signed-in person's own To-Do, Reminder, Note and Voice memo items.
export const dynamic = "force-dynamic";

function fail(error: unknown) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status: /authentication|required|profile/i.test(message) ? 401 : 400 });
}

const asKind = (v: unknown): ItemKind | null => (ITEM_KINDS.includes(v as ItemKind) ? (v as ItemKind) : null);

export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const url = new URL(request.url);
    const kinds = (url.searchParams.get("kinds") ?? "").split(",").map(asKind).filter((k): k is ItemKind => !!k);
    return NextResponse.json({ items: await listItems(me.id, kinds.length ? kinds : ITEM_KINDS) });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    // Voice memos arrive as multipart (the audio file + title + duration).
    if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const me = await requireActiveProfile(request);
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return NextResponse.json({ error: "file is required." }, { status: 400 });
      const path = await uploadRecording(me.id, file);
      const duration = Math.max(0, Math.min(3600, Math.round(Number(form.get("durationS")) || 0)));
      const item = await createItem(me.id, "recording", { title: String(form.get("title") ?? "") || `Voice memo ${new Date().toLocaleString()}` }, { path, durationS: duration });
      return NextResponse.json({ item });
    }
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    const kind = asKind(body.kind);
    if (!kind || kind === "recording") return NextResponse.json({ error: "kind must be todo, reminder or note." }, { status: 400 });
    if (kind === "reminder" && !body.dueAt) return NextResponse.json({ error: "A reminder needs a date and time." }, { status: 400 });
    return NextResponse.json({ item: await createItem(me.id, kind, body) });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const me = await requireActiveProfile(request, body.actionToken);
    if (typeof body.id !== "string") return NextResponse.json({ error: "id is required." }, { status: 400 });
    const item = await updateItem(me.id, body.id, body);
    return item ? NextResponse.json({ item }) : NextResponse.json({ error: "Not found." }, { status: 404 });
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    await deleteItem(me.id, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
