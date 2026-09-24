import { NextRequest, NextResponse } from "next/server";
import { fail, requireWebsiteActor } from "@/lib/website/http";
import { linkReport, listAuditLogs, overviewStats, searchWebsite } from "@/lib/website/data";
import { pendingChangeSets } from "@/lib/website/change-sets";

export const dynamic = "force-dynamic";

/**
 * The Overview screen, the Content Search box and the link report all read from
 * here (`view=stats|search|links|audit`) so the workspace needs one fetch per tab.
 */
export async function GET(request: NextRequest) {
  try {
    await requireWebsiteActor(request);
    const params = new URL(request.url).searchParams;

    switch (params.get("view")) {
      case "search":
        return NextResponse.json({ hits: await searchWebsite(params.get("q") ?? "") });
      case "links":
        return NextResponse.json({ links: await linkReport() });
      case "audit":
        return NextResponse.json({
          logs: await listAuditLogs(Number(params.get("limit")) || 60, params.get("resourceId") ?? undefined),
        });
      default: {
        const [stats, pending] = await Promise.all([overviewStats(), pendingChangeSets(10)]);
        return NextResponse.json({ stats, pending });
      }
    }
  } catch (error) {
    return fail(error, "Could not load the website overview.");
  }
}
