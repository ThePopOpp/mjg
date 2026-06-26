import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sign-out MUST be a POST. Next.js prefetches <Link> destinations with GET
// requests, so a GET sign-out route was being executed automatically on every
// dashboard render — logging the user out ~1s after login ("logout on refresh").
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  // 303 so the browser follows with a GET to /login after the POST.
  return NextResponse.redirect(new URL("/login?message=Signed%20out", origin), 303);
}

// A stray GET (old bookmark, prefetch) just bounces to /login — it never ends the session.
export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  return NextResponse.redirect(new URL("/login", origin));
}
