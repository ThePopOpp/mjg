import { NextResponse } from "next/server";
import { requireParticipantManager } from "@/lib/user-management/auth";
import { listSmsDirectory, formatPhone } from "@/lib/sms/contacts";

// Everyone who can be texted — profiles, participants and contacts with a phone number,
// de-duplicated by phone. Powers the searchable recipient picker in Compose.
export async function GET(request: Request) {
  try {
    await requireParticipantManager(request, request.headers.get("x-mjg-action-token") ?? undefined);
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("search") ?? "").trim().toLowerCase();
    const digits = q.replace(/\D/g, "");

    const directory = await listSmsDirectory();
    const filtered = q
      ? directory.filter(
          (c) =>
            [c.name, c.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)) ||
            (digits.length >= 3 && c.phoneKey.includes(digits)),
        )
      : directory;

    return NextResponse.json({
      recipients: filtered.slice(0, 50).map((c) => ({
        id: c.id,
        kind: c.kind,
        name: c.name,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        avatarUrl: c.avatarUrl,
        phone: c.phone,
        phoneDisplay: formatPhone(c.phone),
      })),
      total: directory.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load recipients.";
    const status = /required|permission|denied|authentication/i.test(message) ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
