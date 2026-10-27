import { mapProvider } from "./config";

// Address → coordinates, server-side only. Called when a facilitator saves a group (never
// per page view); the result is stored on the row. Returns null when nothing matches or
// the provider is unreachable — saving a group never fails because of geocoding.

export type GeoPoint = { lat: number; lng: number; label?: string };

const TIMEOUT_MS = 6000;

async function getJson(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

async function nominatim(q: string): Promise<GeoPoint | null> {
  // Usage policy: identify the app, max ~1 req/s (we geocode only on save).
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`;
  const data = await getJson(url, { "User-Agent": "MJG-FindAGroup/1.0 (https://michaeljgauthier.com)", "Accept-Language": "en" });
  const hit = Array.isArray(data) ? data[0] : null;
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon), label: hit.display_name } : null;
}

async function mapbox(q: string): Promise<GeoPoint | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;
  const data = await getJson(`https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(q)}&country=us&limit=1&access_token=${token}`);
  const f = data?.features?.[0];
  return f ? { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], label: f.properties?.full_address } : null;
}

async function google(q: string): Promise<GeoPoint | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const data = await getJson(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(q)}&components=country:US&key=${key}`);
  const r = data?.results?.[0];
  return r ? { lat: r.geometry.location.lat, lng: r.geometry.location.lng, label: r.formatted_address } : null;
}

export async function geocode(parts: Array<string | null | undefined>): Promise<GeoPoint | null> {
  const q = parts.map((p) => (p ?? "").trim()).filter(Boolean).join(", ");
  if (!q) return null;
  try {
    const provider = mapProvider();
    const hit = provider === "mapbox" ? await mapbox(q) : provider === "google" ? await google(q) : await nominatim(q);
    if (hit && Number.isFinite(hit.lat) && Number.isFinite(hit.lng)) return hit;
    return null;
  } catch {
    return null;
  }
}
