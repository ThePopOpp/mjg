import { NextRequest, NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { listMessages } from "@/lib/social-media/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function GET(request: NextRequest) {
  try {
    await requireUserManager(request);
    const sp = request.nextUrl.searchParams;
    return NextResponse.json({ messages: await listMessages({ kind: sp.get("kind") || undefined, status: sp.get("status") || undefined }) });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load inbox.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
