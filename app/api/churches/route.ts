import { NextResponse } from "next/server";
import { requireActiveProfile, requireSuperAdmin } from "@/lib/user-management/auth";
import { createChurch, listChurches } from "@/lib/churches/repository";
import { groupError } from "@/lib/facilitator-groups/http";
import { ROLES } from "@/lib/rbac/roles";

// Active churches for pickers (any signed-in person); Super Admins may add ?all=1 for archived too.
export async function GET(request: Request) {
  try {
    const me = await requireActiveProfile(request);
    const url = new URL(request.url);
    const includeArchived = url.searchParams.get("all") === "1" && me.role === ROLES.SUPER_ADMIN;
    return NextResponse.json({ churches: await listChurches({ includeArchived, search: url.searchParams.get("q") ?? undefined }) });
  } catch (error) {
    return groupError(error, "Unable to load churches.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    return NextResponse.json({ church: await createChurch(actor, body.church ?? {}) });
  } catch (error) {
    return groupError(error, "Unable to add the church.");
  }
}
