import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const CSV_COLUMNS = [
  { key: "type",            label: "Type" },
  { key: "status",          label: "Status" },
  { key: "first_name",      label: "First Name" },
  { key: "last_name",       label: "Last Name" },
  { key: "email",           label: "Email" },
  { key: "phone",           label: "Phone" },
  { key: "company",         label: "Company" },
  { key: "website",         label: "Website" },
  { key: "church",          label: "Church" },
  { key: "source",          label: "Source" },
  { key: "list",            label: "List" },
  { key: "tags",            label: "Tags" },
  { key: "address_line_1",  label: "Address Line 1" },
  { key: "address_line_2",  label: "Address Line 2" },
  { key: "city",            label: "City" },
  { key: "state",           label: "State" },
  { key: "zip_code",        label: "Zip Code" },
  { key: "notes",           label: "Notes" },
  { key: "profile_photo_url", label: "Profile Photo URL" },
  { key: "sms_opt_in",      label: "SMS Opt In" },
  { key: "email_opt_in",    label: "Email Opt In" },
  { key: "created_at",      label: "Created At" },
];

function escapeCSV(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = Array.isArray(val) ? val.join("; ") : String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type   = searchParams.get("type") ?? "";
    const status = searchParams.get("status") ?? "";
    const actionToken = searchParams.get("actionToken") ?? "";

    await requireParticipantManager(request, actionToken);
    const supabase = createSupabaseAdminClient();

    let query = supabase.from("contacts").select("*").order("created_at", { ascending: false }).limit(5000);
    if (type)   query = query.eq("type", type);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    const rows = data ?? [];
    const header = CSV_COLUMNS.map((c) => c.label).join(",");
    const lines = rows.map((row: any) =>
      CSV_COLUMNS.map((c) => escapeCSV(row[c.key])).join(",")
    );
    const csv = [header, ...lines].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="contacts-${type || "all"}-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Export failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
