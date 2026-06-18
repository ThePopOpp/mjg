import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";

export async function POST(request: Request) {
  try {
    await requireParticipantManager(request);
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "CSV file is required." }, { status: 400 });

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have a header row and at least one data row." }, { status: 400 });

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_"));
    const phoneColIndex = headers.findIndex((h) => h === "phone" || h === "phone_number" || h === "mobile" || h === "cell");
    const nameColIndex = headers.findIndex((h) => h === "name" || h === "full_name" || h === "first_name" || h === "contact_name");

    if (phoneColIndex === -1) {
      return NextResponse.json({ error: 'CSV must contain a "phone" or "phone_number" column.' }, { status: 400 });
    }

    const contacts: Array<{ phone: string; name: string }> = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      const phone = cols[phoneColIndex]?.trim() ?? "";
      if (!phone) {
        errors.push(`Row ${i + 1}: missing phone number`);
        continue;
      }
      const name = nameColIndex >= 0 ? (cols[nameColIndex]?.trim() ?? "") : "";
      contacts.push({ phone, name });
    }

    return NextResponse.json({ ok: true, contacts, errors, total: contacts.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse CSV.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
