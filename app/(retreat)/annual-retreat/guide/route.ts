import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { looksAutomated } from "@/lib/analytics/bots";
import { countryFrom, deviceFromUA, visitorHash } from "@/lib/analytics/server";
import { loadGuideFile, retreatAccess } from "@/lib/annual-retreat/server";

// GET /annual-retreat/guide: the stable download address used by the
// thank-you page and every email. It serves whichever version
// annual_retreat_settings names (files are versioned in the private bucket,
// see scripts/annual-retreat-guide.mjs). No personal data in the URL.
// ?via=email marks clicks from the emails, counted here because emails can't
// run the site's tracker. Page clicks are counted by the thank-you page.

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await retreatAccess();
  if (!access.canView) return new NextResponse("Not found", { status: 404 });

  const file = await loadGuideFile();
  if (!file) return new NextResponse("The guide is temporarily unavailable. Please try again shortly.", { status: 503 });

  const via = new URL(request.url).searchParams.get("via");
  const ua = request.headers.get("user-agent") || "";
  if (via === "email" && !looksAutomated(ua) && request.headers.get("sec-gpc") !== "1" && request.headers.get("dnt") !== "1") {
    await createSupabaseAdminClient()
      .from("analytics_events")
      .insert({
        event: "retreat_email_click",
        host: (request.headers.get("host") || "").split(":")[0].toLowerCase() || null,
        path: "/annual-retreat/guide",
        channel: "email",
        source: "email",
        utm_medium: "email",
        utm_campaign: "annual_retreat_guide",
        visitor_hash: visitorHash(request),
        session_id: `srv_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`,
        device: deviceFromUA(ua),
        country: countryFrom(request),
      })
      .then(({ error }) => error && console.error("[annual-retreat] click log failed", error.message));
  }

  return new NextResponse(file.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
      "X-Guide-Version": file.version,
    },
  });
}
