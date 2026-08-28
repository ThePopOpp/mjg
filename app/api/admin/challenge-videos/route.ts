import { NextResponse } from "next/server";
import { requireAdminManager } from "@/lib/user-management/auth";
import { createChallengeVideo, listChallengeVideosAdmin, type ChallengeVideoInput } from "@/lib/six-week-challenge/repository";

// List every challenge video (admin) — used to refresh the Studio after edits.
export async function GET(request: Request) {
  try {
    await requireAdminManager(request, request.headers.get("x-mjg-action-token") ?? undefined);
    const videos = await listChallengeVideosAdmin();
    return NextResponse.json({ videos });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load videos.";
    return NextResponse.json({ error: message }, { status: /authentication|required|denied/i.test(message) ? 401 : 500 });
  }
}

// Create a new challenge video.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await requireAdminManager(request, body.actionToken);
    const video = await createChallengeVideo(body as ChallengeVideoInput);
    return NextResponse.json({ video });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create video.";
    const status = /duplicate|unique/i.test(message) ? 409 : /authentication|required|denied/i.test(message) ? 401 : 400;
    return NextResponse.json({ error: /duplicate|unique/i.test(message) ? "That slug is already in use." : message }, { status });
  }
}
