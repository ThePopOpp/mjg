// Frontend Editor — shared request plumbing for the /api/admin/website routes.
//
// Every route in that folder is Super-Admin-only and hands back owner-readable
// error text, so the mapping lives here once instead of in eleven copies.

import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/user-management/auth";

export type WebsiteActor = { id: string; email: string | null; role: string };

/** Authenticate + authorise. `actionToken` comes from the dashboard header. */
export async function requireWebsiteActor(request: Request, actionToken?: string | null): Promise<WebsiteActor> {
  const profile = await requireSuperAdmin(request, actionToken);
  return { id: profile.id, email: profile.email ?? null, role: profile.role };
}

export function errorStatus(message: string): number {
  if (/authentication|authenticated/i.test(message)) return 401;
  if (/permission|required|cannot|protected|reserved/i.test(message)) return 403;
  if (/no longer exists|not found/i.test(message)) return 404;
  return 400;
}

/** Turn a thrown error into the JSON shape the editor UI expects. */
export function fail(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: errorStatus(message) });
}

export function actionTokenOf(body: unknown): string | null {
  const token = (body as { actionToken?: unknown } | null)?.actionToken;
  return typeof token === "string" ? token : null;
}
