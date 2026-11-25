"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Fetches one Overview card source. Cards that share a source and params (the stat
// tiles all read "stats") share one request: in-flight requests are reused and a
// result is reused for a few seconds, so twelve tiles cost one round trip.

type Entry = { at: number; promise: Promise<unknown> };
const cache = new Map<string, Entry>();
const REUSE_MS = 5_000;

function load(key: string, force = false): Promise<unknown> {
  const hit = cache.get(key);
  if (!force && hit && Date.now() - hit.at < REUSE_MS) return hit.promise;
  const promise = fetch(key, { cache: "no-store" }).then(async (res) => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((body as { error?: string }).error || "This card couldn't load.");
    return body;
  });
  cache.set(key, { at: Date.now(), promise });
  promise.catch(() => cache.delete(key));
  return promise;
}

/** Drop cached results for a source so the next read refetches (after a write). */
export function invalidateWidget(source: string) {
  for (const key of cache.keys()) if (key.startsWith(`/api/dashboard/widgets/${source}`)) cache.delete(key);
}

export function useWidgetData<T>(source: string | undefined, params?: Record<string, string | number | undefined | null>, refreshMs?: number) {
  const qs = params
    ? Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  const key = source ? `/api/dashboard/widgets/${source}${qs ? `?${qs}` : ""}` : null;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!key);
  const alive = useRef(true);

  const run = useCallback(
    (force = false) => {
      if (!key) return;
      load(key, force)
        .then((d) => {
          if (!alive.current) return;
          setData(d as T);
          setError(null);
        })
        .catch((e: Error) => alive.current && setError(e.message))
        .finally(() => alive.current && setLoading(false));
    },
    [key],
  );

  useEffect(() => {
    alive.current = true;
    setLoading(!!key);
    run();
    if (!refreshMs) return () => void (alive.current = false);
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") run();
    }, refreshMs);
    return () => {
      alive.current = false;
      window.clearInterval(t);
    };
  }, [key, refreshMs, run]);

  return { data, error, loading, reload: () => run(true) };
}
