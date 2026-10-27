import { NextResponse } from "next/server";

// One error → status mapping for the group APIs: auth failures are 401/403, missing things
// 404, rule/validation messages 400, database errors 500.
export function groupError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const status = /authentication required/i.test(message)
    ? 401
    : /permission|active profile required|not allowed/i.test(message)
      ? 403
      : /not found/i.test(message)
        ? 404
        : error instanceof Error && !/relation|column|duplicate key|violates|syntax/i.test(message)
          ? 400
          : 500;
  return NextResponse.json({ error: message || fallback }, { status });
}
