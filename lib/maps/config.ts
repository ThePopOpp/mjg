// Which map provider the site uses. OpenStreetMap needs no key, so it's the default;
// switching to Mapbox or Google is env-only:
//   NEXT_PUBLIC_MAP_PROVIDER = osm | mapbox | google
//   NEXT_PUBLIC_MAPBOX_TOKEN  (public pk.* token — tiles in the browser + geocoding)
//   GOOGLE_MAPS_API_KEY       (server geocoding; the browser map would need its own adapter)
// The browser map (components/maps/groups-map.tsx) renders Leaflet raster tiles for osm and
// mapbox. Google's tiles can't be used through Leaflet, so "google" geocodes with Google but
// still draws OSM tiles until a Google map adapter is added.

export type MapProvider = "osm" | "mapbox" | "google";

export function mapProvider(): MapProvider {
  const p = (process.env.NEXT_PUBLIC_MAP_PROVIDER ?? "").trim().toLowerCase();
  if (p === "mapbox" && process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return "mapbox";
  if (p === "google" && process.env.GOOGLE_MAPS_API_KEY) return "google";
  return "osm";
}

export type TileConfig = { url: string; attribution: string; maxZoom: number; tileSize?: number; zoomOffset?: number };

/** Leaflet tile layer for the configured provider (safe to pass to the client). */
export function tileConfig(): TileConfig {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (mapProvider() === "mapbox" && token) {
    return {
      url: `https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/{z}/{x}/{y}?access_token=${token}`,
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
    };
  }
  return {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  };
}
