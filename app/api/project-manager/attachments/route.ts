import { NextRequest, NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { addItemAttachment } from "@/lib/project-manager/data";

function errStatus(m: string) { return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500; }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = await requireParticipantManager(request, body?.actionToken);
    if (!body?.item_id || !body?.url) throw new Error("item_id and url are required.");
    const kind = ["photo", "audio", "file"].includes(body.kind) ? body.kind : "file";
    const attachment = await addItemAttachment({
      item_id: String(body.item_id), kind, url: String(body.url),
      file_name: body.file_name ?? null, mime_type: body.mime_type ?? null,
      size_bytes: Number.isFinite(Number(body.size_bytes)) ? Number(body.size_bytes) : null,
      uploaded_by: actor.id,
    });
    return NextResponse.json({ attachment });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Attachment add failed";
    return NextResponse.json({ message: m }, { status: errStatus(m) });
  }
}
