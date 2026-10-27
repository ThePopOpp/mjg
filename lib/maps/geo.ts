// Pure geo helpers (no I/O) — safe on server and client, and unit-tested.

const EARTH_KM = 6371;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in miles. */
export function distanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h)) * 0.621371;
}

// Radius (meters) of the "somewhere in here" circle drawn for approximate locations. The real
// spot is always inside it: the public point is offset by at most FUZZ_MAX_M.
export const APPROX_RADIUS_M = 1200;
const FUZZ_MIN_M = 250;
const FUZZ_MAX_M = 700;

function hash32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/**
 * The public stand-in for a private location: moved 250–700 m in a direction derived from
 * `seed` (the group id), so it's stable across saves but can't be reversed to the address,
 * then rounded to ~100 m.
 */
export function fuzzPoint(lat: number, lng: number, seed: string): { lat: number; lng: number } {
  const h = hash32(seed);
  const angle = ((h % 3600) / 3600) * 2 * Math.PI;
  const dist = FUZZ_MIN_M + ((h >>> 12) % 1000) / 1000 * (FUZZ_MAX_M - FUZZ_MIN_M);
  const dLat = (dist * Math.cos(angle)) / 111_320;
  const dLng = (dist * Math.sin(angle)) / (111_320 * Math.cos(rad(lat)));
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return { lat: round(lat + dLat), lng: round(lng + dLng) };
}
