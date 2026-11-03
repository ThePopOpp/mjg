import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/server";
import { VIEW_ROLE_COOKIE } from "@/lib/auth/view-role";
import { normalizeAppRole } from "@/lib/rbac/roles";

// Switches the dashboard "View as" role. The role must be one of the signed-in
// profile's own view roles (loaded from the database, not the cookie), so this
// can only move between roles the profile was granted.
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || profile.id === "local-preview") {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { role?: unknown } | null;
  const role = normalizeAppRole(typeof body?.role === "string" ? body.role : null);
  if (!role || !profile.viewRoles.includes(role)) {
    return NextResponse.json({ error: "You can't view as that role." }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true, role });
  if (role === profile.primaryRole) {
    res.cookies.delete(VIEW_ROLE_COOKIE);
  } else {
    res.cookies.set(VIEW_ROLE_COOKIE, role, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
  }
  return res;
}
