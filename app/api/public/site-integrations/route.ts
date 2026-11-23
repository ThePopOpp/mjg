import { NextResponse } from "next/server";
import { getMetricoolConfig } from "@/lib/site-integrations";

// Public: which third-party trackers the site should load. Only non-secret values.
// Cached at the edge/browser for 5 minutes so it's one cheap request per visit.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const metricool = await getMetricoolConfig();
    return NextResponse.json(
      { metricool: metricool.enabled ? { hash: metricool.hash } : null },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    );
  } catch {
    return NextResponse.json({ metricool: null }, { headers: { "Cache-Control": "public, max-age=60" } });
  }
}
