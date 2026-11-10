import { NextResponse } from "next/server";
import { requireUserManager } from "@/lib/user-management/auth";
import { EXPORT_FORMATS, exportTemplates, loadTemplatesForExport, type ExportFormat } from "@/lib/email/template-export";

export const runtime = "nodejs";

// Download the selected templates as one PDF, Word, plain-text or JSON file.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    await requireUserManager(request, body.actionToken);
    const format = body.format as ExportFormat;
    if (!EXPORT_FORMATS.includes(format)) return NextResponse.json({ error: "Choose PDF, Word, TXT or JSON." }, { status: 400 });
    const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === "string").slice(0, 200) : [];
    if (!ids.length) return NextResponse.json({ error: "Select at least one template." }, { status: 400 });

    const templates = await loadTemplatesForExport(ids);
    if (!templates.length) return NextResponse.json({ error: "None of the selected templates were found." }, { status: 404 });
    const file = await exportTemplates(templates, format);
    return new NextResponse(new Uint8Array(file.body), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `attachment; filename="${file.filename.replace(/[^\w.-]/g, "-")}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Export failed.";
    const status = message.includes("permission") || message.includes("required") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
