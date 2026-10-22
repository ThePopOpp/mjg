import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";
import { createCoupon, listCoupons } from "@/lib/stripe-admin/coupons";
import type { CouponCreateInput } from "@/lib/stripe-admin/coupon-rules";

// Stripe → Coupons. Super-Admin only, here and on /dashboard/stripe.

function errorResponse(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = /authentication|authenticated/i.test(message)
    ? 401
    : /permission|required/i.test(message)
      ? 403
      : /already exists/i.test(message)
        ? 409
        : 400;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    await requireSuperAdmin(request, request.headers.get("x-mjg-action-token") ?? undefined);
    return NextResponse.json({ coupons: await listCoupons() });
  } catch (error) {
    return errorResponse(error, "Unable to load coupons.");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const actor = await requireSuperAdmin(request, body.actionToken);
    const coupon = await createCoupon(body.coupon as CouponCreateInput, actor.id);
    return NextResponse.json({ coupon });
  } catch (error) {
    return errorResponse(error, "Unable to create the coupon.");
  }
}
