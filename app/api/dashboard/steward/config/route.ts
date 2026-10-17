import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { setStewardConfig } from "@/lib/steward/config";

// Super Admin writes to the Steward settings.
//
// requireSuperAdmin on the route, not only the page: the page guard stops a
// participant seeing the console, and this stops anyone posting to it directly.
// §E05 — important prohibitions are enforced in code and permissions, not only
// in the interface.

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let profile;
  try {
    profile = await requireSuperAdmin(request);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Not permitted." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const key = typeof body?.key === "string" ? body.key : null;
  if (!key) return NextResponse.json({ error: "key is required." }, { status: 400 });

  try {
    const row = await setStewardConfig({
      key,
      // undefined and null are different here: `value: null` is a deliberate
      // "unset", which the readers treat as "this feature may not run".
      value: body.value ?? null,
      productionEnabled: typeof body.productionEnabled === "boolean" ? body.productionEnabled : undefined,
      actorId: profile.id as string,
      note: typeof body.note === "string" ? body.note : undefined,
    });
    return NextResponse.json({ row });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not save." },
      { status: 400 },
    );
  }
}
