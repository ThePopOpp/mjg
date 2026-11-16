"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

// The account menu's signed-in state, shared by both site headers
// (components/public-site/site-nav.tsx and components/marketing/nav.tsx).
//
// Display only. The check runs in the browser so marketing pages stay static;
// /dashboard and every API still verify the session on the server, so a stale
// cookie can at worst show "Dashboard", which then bounces to /login.

/** What a signed-in visitor sees instead of Login / Register. */
export const SIGNED_IN_LINKS = [{ id: "dashboard", label: "Dashboard", href: "/dashboard" }] as const;

/**
 * `initial` — pass it when the server already knows (the Steward shell), so the
 * menu is right on first paint. Otherwise null until the browser session is read.
 */
export function useSignedIn(initial?: boolean): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(initial ?? null);

  useEffect(() => {
    if (initial !== undefined) return;
    let supabase: ReturnType<typeof createClient>;
    try {
      supabase = createClient();
    } catch {
      setSignedIn(false);
      return;
    }
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSignedIn(Boolean(data.session));
      })
      .catch(() => {
        if (active) setSignedIn(false);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [initial]);

  return signedIn;
}

/**
 * Sign-out MUST be a POST form, never a link: Next prefetches <Link> targets
 * with GET, and a GET sign-out once logged everyone out ~1s after login
 * (app/auth/logout/route.ts).
 */
export function LogoutButton({ className, label = "Log out" }: { className?: string; label?: string }) {
  return (
    <form action="/auth/logout" method="post" className="contents">
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
