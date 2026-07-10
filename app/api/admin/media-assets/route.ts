import { NextResponse } from "next/server";
import { saveMediaAsset } from "@/lib/content/media";
import { createDashboardNotification } from "@/lib/notifications/notify";
import { ROLES } from "@/lib/rbac/roles";
import { requireAdminManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireAdminManager(request, body.actionToken);
    // "Share with & notify Super Admins" is a Super Admin-only field; strip it
    // from anyone else's payload so it can't be set by a regular admin.
    if (actor.role !== ROLES.SUPER_ADMIN && body.metadata && "shared_with" in body.metadata) {
      delete body.metadata.shared_with;
    }
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

    // Notify the newly-added Super Admins that a resource was shared with them.
    const recipients: string[] = Array.isArray(body.notifyRecipientIds) ? body.notifyRecipientIds : [];
    if (body.assetType === "document" && actor.role === ROLES.SUPER_ADMIN && recipients.length) {
      const sharedBy = actor.email || "A Super Admin";
      await createDashboardNotification({
        type: "resource_shared",
        title: `Resource shared: ${asset.title}`,
        message: `${sharedBy} shared a ${String(body.metadata?.resource_type || "resource").replace(/_/g, " ")} with you in Media Studio.`,
        metadata: {
          media_asset_id: asset.id,
          slug: asset.slug,
          file_url: asset.file_url,
          resource_type: body.metadata?.resource_type ?? null,
          recipient_ids: recipients,
          shared_by: actor.id,
        },
      });
    }

    return NextResponse.json({ ok: true, asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Media asset save failed.";
    const status = message.includes("Authentication required") ? 401 : message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
