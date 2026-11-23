import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { detectBot } from "@/lib/analytics/bots";

// Crawlers never run the JS tracker, so this is the only place to see which AI
// and search bots read which pages (→ analytics_bot_hits, /dashboard/analytics).
// Fire-and-forget via waitUntil: it never delays or fails the response.
function logBotHit(request: NextRequest, event: NextFetchEvent) {
  const path = request.nextUrl.pathname;
  if (request.method !== "GET" || path.startsWith("/api/") || path.startsWith("/_next/")) return;
  const hit = detectBot(request.headers.get("user-agent"));
  if (!hit) return;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  event.waitUntil(
    fetch(`${url}/rest/v1/analytics_bot_hits`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        bot: hit.bot,
        bot_kind: hit.kind,
        host: (request.headers.get("host") || "").split(":")[0].toLowerCase() || null,
        path: path.slice(0, 500),
      }),
    }).then(() => undefined, () => undefined),
  );
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  logBotHit(request, event);

  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return supabaseResponse;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Mirror onto the inbound request (so downstream Server Components read the
        // fresh token) and onto the response (so the browser receives every chunk).
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // The ONLY job of this middleware is to keep the session token fresh.
  //
  // getSession() reads the session from the cookie locally and, when the access
  // token has expired, refreshes it and persists the rotated cookies onto the
  // response. Unlike getUser(), it does NOT make a live validation call to the
  // Supabase Auth server — so a transient 401/network blip during rapid link
  // clicks and prefetch bursts can never wipe a valid session and log the user out.
  //
  // We deliberately do NOT redirect or clear cookies here. Access control lives in
  // the dashboard layout (getCurrentProfile), which reads the (now fresh) session
  // locally and is not subject to per-request network failures.
  await supabase.auth.getSession();

  // IMPORTANT: return supabaseResponse unchanged so any refreshed Set-Cookie headers
  // reach the browser. Returning a different response object drops those cookies and
  // silently logs the user out.
  return supabaseResponse;
}

export const config = {
  matcher: [
    // `.well-known/workflow` is excluded deliberately, not for performance. The
    // eve/Workflow worker delivers orchestration and step invocations to
    // /.well-known/workflow/v1/flow over loopback, and @workflow/world-postgres
    // is explicit: "Do not gate these paths in framework middleware... a handler
    // that consumes the internal request body breaks execution." Running this
    // middleware over them would do exactly that. That route is protected at the
    // ingress instead, where blocking external traffic costs nothing because
    // loopback delivery never traverses it.
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|\\.well-known/workflow|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
