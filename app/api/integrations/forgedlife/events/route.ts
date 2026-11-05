import { NextResponse } from "next/server";
import { receiveForgedEvent } from "@/lib/forgedlife/receive";

// ForgedLife's live webhook (signed with FORGEDLIFE_WEBHOOK_SECRET). Events are always
// stored; they're applied only while the forgedlife.sync switch is on. See lib/forgedlife.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { status, body } = await receiveForgedEvent(request, "live");
  return NextResponse.json(body, { status });
}
