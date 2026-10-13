import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { listLegalDocuments } from "@/lib/legal/data";
import { listLegalContacts, LEGAL_ENTITY, MAIL_SERVER } from "@/lib/legal/addresses";

function errStatus(m: string) {
  return /authentication/i.test(m) ? 401 : /permission|required/i.test(m) ? 403 : 500;
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request);
    return NextResponse.json({
      documents: await listLegalDocuments(),
      contacts: listLegalContacts(),
      entity: LEGAL_ENTITY,
      mailServer: MAIL_SERVER,
    });
  } catch (error) {
    const m = error instanceof Error ? error.message : "Failed to load legal documents.";
    return NextResponse.json({ error: m }, { status: errStatus(m) });
  }
}
