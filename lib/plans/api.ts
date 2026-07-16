import { NextResponse } from "next/server";
import { PlanAccessError } from "./auth";

// Shared error shaping for app/api/plans/*. Follows the house pattern in
// app/api/project-manager: Supabase/Postgres errors are plain objects, not Error
// instances, so surface their `.message` rather than a generic string.

function msgOf(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object") {
    const m = (error as { message?: unknown }).message;
    if (typeof m === "string" && m) return m;
  }
  return fallback;
}

export function planError(error: unknown, fallback: string) {
  // PlanAccessError carries its own status (400/403/404) — trust it over the
  // message-sniffing fallback below.
  if (error instanceof PlanAccessError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  const message = msgOf(error, fallback);
  const status = /authentication/i.test(message) ? 401 : /permission|required/i.test(message) ? 403 : 500;
  return NextResponse.json({ message }, { status });
}
