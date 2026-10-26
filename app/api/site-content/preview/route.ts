import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { verifyContentPreview } from "@/lib/marketing/content/preview-link";
import { requestOrigin } from "@/lib/mcp/urls";

// Opens a marketing page with unpublished drafts shown (see
// lib/marketing/content/preview-link.ts). ?exit=1 turns draft mode off again.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  // Behind the proxy request.url is the container's address; redirect to the public one.
  const origin = requestOrigin(request);
  const mode = await draftMode();

  if (url.searchParams.get("exit")) {
    mode.disable();
    const back = url.searchParams.get("path") ?? "/";
    return NextResponse.redirect(new URL(back.startsWith("/") && !back.startsWith("//") ? back : "/", origin), 307);
  }

  const path = url.searchParams.get("path") ?? "";
  const exp = Number(url.searchParams.get("exp"));
  const sig = url.searchParams.get("sig") ?? "";
  if (!verifyContentPreview(path, exp, sig)) {
    return new NextResponse("This preview link has expired or isn't valid. Ask for a new one.", { status: 403 });
  }
  mode.enable();
  return NextResponse.redirect(new URL(path, origin), 307);
}
