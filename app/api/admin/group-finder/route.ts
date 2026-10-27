import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { setFinderSettings } from "@/lib/facilitator-groups/repository";
import { groupError } from "@/lib/facilitator-groups/http";

// The Find a Group launch switch: { mode: "hidden" | "preview" | "open", opensLabel }.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    return NextResponse.json({ settings: await setFinderSettings(actor.id, body.mode, body.opensLabel ?? null) });
  } catch (error) {
    return groupError(error, "Unable to save the setting.");
  }
}
