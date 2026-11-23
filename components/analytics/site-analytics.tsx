"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// First-party, cookieless pageview tracker (mounted once in app/layout.tsx).
//   • session context (entry page, referrer, UTMs) lives in sessionStorage
//   • first touch lives in localStorage, and is sent with the sign-up form so the
//     account records the channel that first brought the person in
// Skips private/internal routes, Global Privacy Control / Do Not Track, and staff
// browsers (flagged by <AnalyticsStaffFlag/> in the dashboard).

/** Private/internal routes no tracker runs on (shared with components/analytics/metricool.tsx). */
export const SKIP = /^\/(dashboard|api|auth|oauth|portal|accept-invite|reset-password|website-preview|site-preview|steward-preview|steward-homepage-|animation)(\/|$)/;
const SESSION_KEY = "mjg_an_session";
const FIRST_KEY = "mjg_an_first";
export const STAFF_KEY = "mjg_an_exclude";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type Touch = {
  path: string;
  referrer: string | null;
  at: string;
} & Partial<Record<(typeof UTM)[number], string>>;

function read<T>(store: Storage | undefined, key: string): T | null {
  try {
    const raw = store?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function write(store: Storage | undefined, key: string, value: unknown) {
  try {
    store?.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage blocked */
  }
}

function optedOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.globalPrivacyControl || nav.doNotTrack === "1") return true;
  try {
    return localStorage.getItem(STAFF_KEY) === "1";
  } catch {
    return false;
  }
}

function newId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function currentTouch(): Touch {
  const params = new URLSearchParams(window.location.search);
  const touch: Touch = {
    path: window.location.pathname,
    referrer: document.referrer || null,
    at: new Date().toISOString(),
  };
  for (const key of UTM) {
    const v = params.get(key);
    if (v) touch[key] = v.slice(0, 160);
  }
  // Business-card links carry ?ref=card; ChatGPT appends utm_source=chatgpt.com itself.
  if (!touch.utm_source && params.get("ref")) touch.utm_source = params.get("ref")!.slice(0, 120);
  return touch;
}

/** Attribution context for the sign-up form (see components/auth/register-form.tsx). */
export function readAttribution(): { first: Touch | null; session: Touch | null } {
  if (typeof window === "undefined") return { first: null, session: null };
  return {
    first: read<Touch>(window.localStorage, FIRST_KEY),
    session: read<{ touch: Touch }>(window.sessionStorage, SESSION_KEY)?.touch ?? null,
  };
}

export function SiteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || SKIP.test(pathname) || optedOut()) return;

    let session = read<{ sid: string; touch: Touch }>(window.sessionStorage, SESSION_KEY);
    const entry = !session;
    if (!session) {
      session = { sid: newId(), touch: currentTouch() };
      write(window.sessionStorage, SESSION_KEY, session);
    }
    if (!read<Touch>(window.localStorage, FIRST_KEY)) write(window.localStorage, FIRST_KEY, session.touch);

    const body = JSON.stringify({ event: "pageview", path: pathname, sid: session.sid, entry, touch: session.touch });
    try {
      if (!navigator.sendBeacon?.("/api/analytics/collect", body)) {
        void fetch("/api/analytics/collect", { method: "POST", body, keepalive: true }).catch(() => {});
      }
    } catch {
      /* never break the page */
    }
  }, [pathname]);

  return null;
}

/** Marks this browser as staff so its visits aren't counted. Mounted in the dashboard layout. */
export function AnalyticsStaffFlag() {
  useEffect(() => {
    try {
      localStorage.setItem(STAFF_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
