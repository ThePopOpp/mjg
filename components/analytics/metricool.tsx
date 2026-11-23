"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SKIP } from "@/components/analytics/site-analytics";

// Metricool's website tracker (Mike's Metricool account), switched on/off and keyed
// in Social Media → Settings → Integrations. The setting comes from a public
// endpoint rather than the server render, so statically built pages pick up a
// change without a rebuild. Public pages only; honours Global Privacy Control /
// Do Not Track. Staff browsers are NOT excluded (unlike our own tracker), so
// Metricool's verification works when Mike visits the site himself.

const SRC = "https://tracker.metricool.com/resources/be.js";

type BeTracker = { t: (opts: { hash: string }) => void };
declare global {
  interface Window {
    beTracker?: BeTracker;
  }
}

function optedOut() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return Boolean(nav.globalPrivacyControl) || nav.doNotTrack === "1";
}

let configPromise: Promise<string | null> | null = null;
function loadHash(): Promise<string | null> {
  configPromise ??= fetch("/api/public/site-integrations")
    .then((r) => (r.ok ? r.json() : null))
    .then((j: { metricool?: { hash?: string } | null } | null) => j?.metricool?.hash ?? null)
    .catch(() => null);
  return configPromise;
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error("metricool tracker failed to load"));
    document.head.appendChild(el);
  });
  return scriptPromise;
}

export function MetricoolTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || SKIP.test(pathname) || optedOut() || last.current === pathname) return;
    last.current = pathname;
    let cancelled = false;
    (async () => {
      const hash = await loadHash();
      if (!hash || cancelled) return;
      await loadScript();
      if (!cancelled) window.beTracker?.t({ hash });
    })().catch(() => {
      /* never break the page over a third-party tracker */
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
