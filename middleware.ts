import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
    "/((?!_next/static|_next/image|favicon.ico|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
