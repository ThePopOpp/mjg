import { NextResponse } from "next/server";
import { requireExperienceManager } from "@/lib/user-management/auth";
import { updateExperience, setExperienceArchived, deleteExperience } from "@/lib/experiences/repository";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireExperienceManager(request, body.actionToken);

    // Archive/unarchive when `archived` is present; otherwise a field edit.
    if (typeof body.archived === "boolean") {
      const result = await setExperienceArchived(id, body.archived);
      return NextResponse.json({ ok: true, ...result });
    }

    const updated = await updateExperience(id, {
      name: typeof body.name === "string" ? body.name : undefined,
      facilitatorId: body.facilitatorId === undefined ? undefined : body.facilitatorId || null,
      status: typeof body.status === "string" ? body.status : undefined,
      startDate: typeof body.startDate === "string" ? body.startDate : undefined,
      startTime: typeof body.startTime === "string" ? body.startTime : undefined,
    });
    return NextResponse.json({ ok: true, experience: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update experience.";
    const status = message.includes("permission") ? 403 : message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    await requireExperienceManager(request, body.actionToken);
    const result = await deleteExperience(id);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete experience.";
    const status = message.includes("permission") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
