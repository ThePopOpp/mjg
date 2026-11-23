import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { getMetricoolConfig, metricoolHashFrom, saveMetricoolConfig } from "@/lib/site-integrations";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 400; }

export async function GET(request: Request) {
  try {
    await requireUserManager(request);
    return NextResponse.json({ metricool: await getMetricoolConfig() });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load integrations.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireUserManager(request, body.actionToken);
    const raw = typeof body.hash === "string" ? body.hash : "";
    const hash = raw.trim() ? metricoolHashFrom(raw) : null;
    if (raw.trim() && !hash) throw new Error("Paste the Metricool tracking code or just its hash.");
    const metricool = await saveMetricoolConfig({ enabled: Boolean(body.enabled), hash }, actor.id);
    return NextResponse.json({ ok: true, metricool });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to save.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
