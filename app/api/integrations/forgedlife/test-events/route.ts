import { NextResponse } from "next/server";
import { receiveForgedEvent } from "@/lib/forgedlife/receive";

// ForgedLife's test webhook (signed with FORGEDLIFE_TEST_WEBHOOK_SECRET). Records the event
// and replies with any shape warnings; never changes data. MJG has no staging environment,
// so this is how their QA Test Church runs are checked against production.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { status, body } = await receiveForgedEvent(request, "test");
  return NextResponse.json(body, { status });
}
