import { NextRequest, NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { getSocialReport } from "@/lib/social-media/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function GET(request: NextRequest) {
  try {
    await requireUserManager(request);
    const range = Number(request.nextUrl.searchParams.get("range")) || 30;
    return NextResponse.json({ report: await getSocialReport(range) });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load report.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
