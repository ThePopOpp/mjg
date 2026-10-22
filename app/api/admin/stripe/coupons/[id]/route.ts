import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { deleteCoupon, updateCouponRules } from "@/lib/stripe-admin/coupons";
import type { CouponRulesInput } from "@/lib/stripe-admin/coupon-rules";

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = /authentication|authenticated/i.test(message)
    ? 401
    : /permission|required/i.test(message)
      ? 403
      : /no longer exists/i.test(message)
        ? 404
        : 400;
  return NextResponse.json({ error: message }, { status });
}

// Only the app-enforced rules can change. The discount itself is a Stripe
// coupon and is fixed once created.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    await requireSuperAdmin(request, body.actionToken);
    const { id } = await params;
    const coupon = await updateCouponRules(id, body.rules as CouponRulesInput);
    return NextResponse.json({ coupon });
  } catch (error) {
    return errorResponse(error, "Unable to update the coupon.");
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSuperAdmin(request, request.headers.get("x-mjg-action-token") ?? undefined);
    const { id } = await params;
    await deleteCoupon(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error, "Unable to delete the coupon.");
  }
}
