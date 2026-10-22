import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { CouponRejected, previewCoupon } from "@/lib/stripe-admin/coupons";

// "Apply" on the pricing page: is this code usable, and what does each plan
// cost with it? Advisory only — the checkout route re-checks every rule for the
// chosen plan and buyer before Stripe ever sees the code.

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = typeof body?.code === "string" ? body.code : "";
    const profile = await getCurrentProfile();
    const preview = await previewCoupon(code, profile?.id ?? null);
    return NextResponse.json(preview);
  } catch (error) {
    if (error instanceof CouponRejected) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not check that code." }, { status: 500 });
  }
}
