"use client";

import { useMemo } from "react";
import { GroupsMap, type MapPoint } from "@/components/maps/groups-map";
import type { TileConfig } from "@/lib/maps/config";

// One group's location on its listing page (keeps the point array stable across renders).
export function GroupLocationMap({ point, tiles }: { point: MapPoint; tiles: TileConfig }) {
  const points = useMemo(() => [point], [point.id, point.lat, point.lng]); // eslint-disable-line react-hooks/exhaustive-deps
  return <GroupsMap points={points} tiles={tiles} zoom={13} />;
}
