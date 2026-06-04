import { NextResponse } from "next/server";
import { acceptUserInvitation } from "@/lib/user-management/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await acceptUserInvitation({
      token: body.token,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      password: body.password,
    });

    return NextResponse.json({ ok: true, email: result.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invitation acceptance failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
