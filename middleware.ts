import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isAuthCookie(name: string) {
  return name.startsWith("sb-") && name.includes("auth-token");
}

function clearAuthCookies(request: NextRequest, response: NextResponse) {
  for (const cookie of request.cookies.getAll()) {
    if (isAuthCookie(cookie.name)) {
      // Expire every Supabase auth cookie chunk so a stale/corrupt cookie cannot
      // keep failing on the next request.
      response.cookies.set(cookie.name, "", { maxAge: 0, path: "/" });
    }
  }
}

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

  // IMPORTANT: Do not run any code between createServerClient and getUser().
  //
  // getUser() validates the access token against the Supabase Auth server and, when
  // the token has expired, performs the refresh-token rotation HERE in middleware —
  // the one server context that can reliably persist the rotated cookies onto the
  // response (Server Components cannot write cookies). Centralizing the refresh here
  // keeps the session alive across saves, page refreshes, and Next.js link prefetches,
  // and avoids partial/duplicated cookie writes from multiple refreshers.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const hasAuthCookie = request.cookies.getAll().some((cookie) => isAuthCookie(cookie.name));

  // Self-heal: auth cookies are present but no valid session could be derived from
  // them. This is the corrupt/partial/stale-cookie case (e.g. a dropped chunk or a
  // cookie written by an older build). Clear the bad cookies so the user gets a clean
  // slate instead of being redirected to /login on every single request.
  if (!user && hasAuthCookie) {
    if (pathname.startsWith("/dashboard")) {
      const redirect = NextResponse.redirect(
        new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url)
      );
      clearAuthCookies(request, redirect);
      return redirect;
    }
    clearAuthCookies(request, supabaseResponse);
    return supabaseResponse;
  }

  // Standard gate: no session at all and trying to reach the dashboard.
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, request.url));
  }

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
