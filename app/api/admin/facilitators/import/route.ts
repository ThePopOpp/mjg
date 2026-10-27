import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { commitFacilitatorImport, previewFacilitatorImport } from "@/lib/facilitator-groups/import";
import { groupError } from "@/lib/facilitator-groups/http";

// { csv, mode: "preview" | "commit", sendAt? } — preview writes nothing.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const actor = await requireSuperAdmin(request, body.actionToken);
    const csv = String(body.csv ?? "");
    if (!csv.trim()) throw new Error("Choose a CSV file first.");
    if (csv.length > 2_000_000) throw new Error("That file is too large (2 MB max).");
    if (body.mode === "commit") {
      const sendAt = typeof body.sendAt === "string" && body.sendAt ? new Date(body.sendAt).toISOString() : null;
      return NextResponse.json({ result: await commitFacilitatorImport(csv, actor.id, { sendAt }) });
    }
    return NextResponse.json(await previewFacilitatorImport(csv));
  } catch (error) {
    return groupError(error, "Unable to import facilitators.");
  }
}
