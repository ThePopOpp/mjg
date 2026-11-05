import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { groupError } from "@/lib/facilitator-groups/http";
import { decideRequest, getForgedOverview, ignoreRecord, importGroup, linkChurch, replayEvent, setForgedSwitch } from "@/lib/forgedlife/admin";
import { FORGED_SWITCHES } from "@/lib/forgedlife/switches";

// Super Admin actions on ForgedLife data (/dashboard/forgedlife). One POST, { action, ... }.
export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    return NextResponse.json(await getForgedOverview());
  } catch (error) {
    return groupError(error, "Unable to load ForgedLife data.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    const id = typeof body.id === "string" ? body.id : "";
    switch (body.action) {
      case "approve_request":
        return NextResponse.json(await decideRequest(actor, id, "approve"));
      case "decline_request":
        return NextResponse.json(await decideRequest(actor, id, "decline"));
      case "link_church":
        return NextResponse.json(await linkChurch(actor, id, body.create ? { create: true } : { churchId: String(body.churchId ?? "") }));
      case "ignore_church":
        await ignoreRecord(actor, "churches", id);
        return NextResponse.json({ ok: true });
      case "import_group":
        return NextResponse.json(await importGroup(actor, id));
      case "ignore_group":
        await ignoreRecord(actor, "groups", id);
        return NextResponse.json({ ok: true });
      case "replay_event":
        return NextResponse.json(await replayEvent(actor, id));
      case "set_switch": {
        const key = Object.values(FORGED_SWITCHES).find((k) => k === body.key);
        if (!key) return NextResponse.json({ error: "Unknown switch." }, { status: 400 });
        await setForgedSwitch(actor, key, Boolean(body.enabled));
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    return groupError(error, "That didn't work.");
  }
}
