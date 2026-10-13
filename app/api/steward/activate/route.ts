import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { ActivationError, activateOrder } from "@/lib/steward/orders";

// Explicit activation. Starts the build window and the premium term together,
// and grants the offer's benefits.
//
// Scoped to the signed-in member and to their own order: activateOrder refuses
// an order belonging to someone else, so a guessed order id achieves nothing.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    if (typeof body?.orderId !== "string") {
      return NextResponse.json({ error: "orderId is required." }, { status: 400 });
    }

    const result = await activateOrder({ orderId: body.orderId, userId: profile.id });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ActivationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    const message = error instanceof Error ? error.message : "Could not activate.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
