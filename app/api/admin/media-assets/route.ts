import { NextResponse } from "next/server";
import { saveMediaAsset } from "@/lib/content/media";
import { requireAdminManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);
    const asset = await saveMediaAsset({
      id: body.id,
      title: body.title,
      slug: body.slug,
      assetType: body.assetType,
      sourceType: body.sourceType,
      fileUrl: body.fileUrl,
      embedUrl: body.embedUrl,
      storageBucket: body.storageBucket,
      storagePath: body.storagePath,
      mimeType: body.mimeType,
      fileSize: body.fileSize,
      durationSeconds: body.durationSeconds,
      description: body.description,
      status: body.status,
      visibility: body.visibility,
      metadata: body.metadata,
      actorUserId: actor.id,
    });

    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Media asset save failed.";
    const status = message.includes("Authentication required") ? 401 : message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
