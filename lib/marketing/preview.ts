import { timingSafeEqual } from "node:crypto";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/server";
import { ROLES } from "@/lib/rbac/roles";

/**
 * Who may open /site-preview/*: a signed-in Super Admin, or anyone holding the
 * share key (?key=…) when SITE_PREVIEW_KEY is set — so a reviewer without an
 * account can be sent a link. Everyone else gets a plain 404, which reveals
 * nothing about what is being previewed.
 */
export async function requirePreviewAccess(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  const params = await searchParams;
  const key = typeof params.key === "string" ? params.key : "";
  const expected = process.env.SITE_PREVIEW_KEY?.trim() ?? "";
  if (expected && key && key.length === expected.length && timingSafeEqual(Buffer.from(key), Buffer.from(expected))) return;

  const profile = await getCurrentProfile().catch(() => null);
  if (profile?.role === ROLES.SUPER_ADMIN) return;
  notFound();
}
