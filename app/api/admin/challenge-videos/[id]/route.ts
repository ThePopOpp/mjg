import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { updateChallengeVideo, deleteChallengeVideo, type ChallengeVideoInput } from "@/lib/six-week-challenge/repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await requireAdminManager(request, body.actionToken);
    const video = await updateChallengeVideo(id, body as ChallengeVideoInput);
    return NextResponse.json({ video });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update video.";
    const status = /duplicate|unique/i.test(message) ? 409 : /authentication|required|denied/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: /duplicate|unique/i.test(message) ? "That slug is already in use." : message }, { status });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireAdminManager(request, body.actionToken ?? request.headers.get("x-mjg-action-token") ?? undefined);
    await deleteChallengeVideo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete video.";
    return NextResponse.json({ error: message }, { status: /authentication|required|denied/i.test(message) ? 401 : 400 });
  }
}
