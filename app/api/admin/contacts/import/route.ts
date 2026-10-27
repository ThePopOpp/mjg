import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizeHeader, parseCSV } from "@/lib/csv";

// Maps CSV header variants → DB column name
const COLUMN_MAP: Record<string, string> = {
  "first name": "first_name", firstname: "first_name", first: "first_name",
  "last name": "last_name", lastname: "last_name", last: "last_name",
  "full name": "full_name", fullname: "full_name", name: "full_name",
  email: "email", "email address": "email",
  phone: "phone", "phone number": "phone", mobile: "phone", cell: "phone",
  company: "company", organization: "company", organisation: "company",
  website: "website", url: "website",
  church: "church", "church name": "church",
  source: "source",
  list: "list",
  tags: "tags", tag: "tags",
  status: "status",
  notes: "notes", note: "notes",
  "address line 1": "address_line_1", address1: "address_line_1", address: "address_line_1",
  "address line 2": "address_line_2", address2: "address_line_2",
  city: "city",
  state: "state", province: "state",
  "zip code": "zip_code", zip: "zip_code", postal: "zip_code", "postal code": "zip_code",
  "profile photo": "profile_photo_url", photo: "profile_photo_url", "photo url": "profile_photo_url", avatar: "profile_photo_url",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const actionToken = String(formData.get("actionToken") ?? "");
    const contactType = String(formData.get("type") ?? "contact");
    const file = formData.get("file") as File | null;

    const actor = await requireParticipantManager(request, actionToken);

    if (!file) return NextResponse.json({ error: "No file provided." }, { status: 400 });

    const text = await file.text();
    const { headers, rows } = parseCSV(text);

    if (!headers.length) return NextResponse.json({ error: "CSV appears empty." }, { status: 400 });

    // Build column mapping: CSV col index → DB field
    const colMap: Array<{ index: number; dbField: string; csvHeader: string }> = [];
    headers.forEach((h, i) => {
      const norm = normalizeHeader(h);
      const dbField = COLUMN_MAP[norm] ?? COLUMN_MAP[norm.replace(/\s+/g, "")] ?? null;
      if (dbField) colMap.push({ index: i, dbField, csvHeader: h });
    });

    const inserts: object[] = [];
    for (const row of rows) {
      if (row.every((c) => !c)) continue; // skip blank rows
      const record: Record<string, unknown> = {
        type: contactType,
        created_by: actor.id,
        tags: [],
      };

      for (const { index, dbField } of colMap) {
        const val = row[index]?.trim() ?? "";
        if (!val) continue;

        if (dbField === "full_name") {
          if (!record.first_name && !record.last_name) {
            const parts = val.split(" ");
            record.first_name = parts[0] ?? val;
            record.last_name = parts.slice(1).join(" ") || undefined;
          }
        } else if (dbField === "tags") {
          record.tags = val.split(/[,;|]+/).map((t: string) => t.trim()).filter(Boolean);
        } else {
          record[dbField] = val;
        }
      }

      inserts.push(record);
    }

    if (!inserts.length) return NextResponse.json({ error: "No valid rows found in CSV." }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("contacts").insert(inserts).select("id");
    if (error) throw error;

    return NextResponse.json({ imported: data?.length ?? 0, skipped: rows.length - (data?.length ?? 0), mappedColumns: colMap.map((c) => c.csvHeader) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Import failed.";
    return NextResponse.json({ error: msg }, { status: msg.includes("required") ? 403 : 500 });
  }
}
