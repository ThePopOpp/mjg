"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import type { TileConfig } from "@/lib/maps/config";

// A provider-agnostic map for group listings. Plain Leaflet (no react-leaflet), loaded only in
// the browser. Tiles come from lib/maps/config (OSM by default, Mapbox by env). Approximate
// locations render as a soft circle — never a pin on someone's house — exact ones as a pin.

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  exact: boolean;
  label: string; // marker text, e.g. "3 open"
  title: string;
  href?: string;
};

const APPROX_RADIUS_M = 1200;
const GOLD = "#b88a4a";

export function GroupsMap({
  points,
  tiles,
  center,
  selectedId,
  onSelect,
  className = "h-full w-full",
  zoom = 11,
}: {
  points: MapPoint[];
  tiles: TileConfig;
  center?: { lat: number; lng: number } | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  className?: string;
  zoom?: number;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    let resize: ResizeObserver | null = null;
    (async () => {
      const leaflet = (await import("leaflet")).default;
      if (cancelled || !el.current || map.current) return;
      L.current = leaflet;
      const m = leaflet.map(el.current, { scrollWheelZoom: false, zoomControl: true, attributionControl: true });
      leaflet.tileLayer(tiles.url, {
        attribution: tiles.attribution,
        maxZoom: tiles.maxZoom,
        ...(tiles.tileSize ? { tileSize: tiles.tileSize, zoomOffset: tiles.zoomOffset } : {}),
      }).addTo(m);
      m.setView([33.3062, -111.8413], 10); // Chandler, AZ until points arrive
      layer.current = leaflet.layerGroup().addTo(m);
      map.current = m;
      draw();
      // The map may start hidden (phone list/map toggle) — re-measure whenever it resizes.
      resize = new ResizeObserver(() => {
        if (!map.current) return;
        const wasEmpty = (m.getSize().x || 0) === 0;
        m.invalidateSize();
        if (wasEmpty) draw();
      });
      resize.observe(el.current);
    })();
    return () => {
      cancelled = true;
      resize?.disconnect();
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw(fit = true) {
    const leaflet = L.current;
    const m = map.current;
    const group = layer.current;
    if (!leaflet || !m || !group) return;
    group.clearLayers();
    const bounds: Array<[number, number]> = [];
    for (const p of points) {
      const selected = p.id === selectedId;
      if (!p.exact) {
        leaflet
          .circle([p.lat, p.lng], {
            radius: APPROX_RADIUS_M,
            color: GOLD,
            weight: selected ? 2.5 : 1.5,
            fillColor: GOLD,
            fillOpacity: selected ? 0.28 : 0.14,
          })
          .addTo(group);
      }
      const icon = leaflet.divIcon({
        className: "",
        html: `<div style="transform:translate(-50%,-100%);display:inline-flex;align-items:center;white-space:nowrap;border-radius:999px;padding:3px 9px;font:600 12px/1.3 system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.25);background:${selected ? "#191815" : "#fff"};color:${selected ? "#fff" : "#191815"};border:1.5px solid ${GOLD};">${escapeHtml(p.label)}</div>`,
        iconSize: [0, 0],
      });
      const marker = leaflet.marker([p.lat, p.lng], { icon, title: p.title, keyboard: true, zIndexOffset: selected ? 1000 : 0 }).addTo(group);
      marker.on("click", () => {
        if (onSelectRef.current) onSelectRef.current(p.id);
        else if (p.href) window.location.href = p.href;
      });
      bounds.push([p.lat, p.lng]);
    }
    if (center) bounds.push([center.lat, center.lng]);
    if (!fit) return;
    if (bounds.length > 1) m.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
    else if (bounds.length === 1) m.setView(bounds[0], zoom);
  }

  // Redraw when the data changes (but don't refit just because the selection moved).
  useEffect(() => draw(), [points, center]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const leaflet = L.current;
    const m = map.current;
    if (!leaflet || !m) return;
    draw(false);
    const p = points.find((x) => x.id === selectedId);
    if (p) m.panTo([p.lat, p.lng], { animate: true });
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={el} className={`${className} z-0 [&_.leaflet-control-attribution]:text-[10px]`} role="region" aria-label="Map of groups" />;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
