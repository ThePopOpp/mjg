import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { listAccounts, saveAccount } from "@/lib/social-media/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function GET(request: Request) {
  try {
    await requireUserManager(request);
    return NextResponse.json({ accounts: await listAccounts() });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load accounts.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireUserManager(request, body.actionToken);
    if (!body.platform || !body.display_name) throw new Error("Platform and display name are required.");
    const account = await saveAccount({
      id: body.id, platform: body.platform, display_name: body.display_name, profile_url: body.profile_url,
      external_id: body.external_id, status: body.status, is_active: body.is_active, credentials: body.credentials,
      actorUserId: actor.id,
    });
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to save account.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
