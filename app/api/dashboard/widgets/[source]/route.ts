import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { sourceAllowed } from "@/lib/dashboard/overview/catalog";
import { LOADERS } from "@/lib/dashboard/overview/loaders";

// Data for one Overview card source. Access follows the role the dashboard is
// being viewed as ("View as" previews see only what that role would see).
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ source: string }> }) {
  const { source } = await params;
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "active") return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const loader = LOADERS[source];
  if (!loader) return NextResponse.json({ error: "Unknown card." }, { status: 404 });
  if (!sourceAllowed(profile.role, source)) return NextResponse.json({ error: "You don't have access to this card." }, { status: 403 });
  try {
    const data = await loader({ profileId: profile.id, email: profile.email, role: profile.role, params: new URL(request.url).searchParams });
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(`[overview] ${source} failed`, error);
    return NextResponse.json({ error: "This card couldn't load." }, { status: 500 });
  }
}
