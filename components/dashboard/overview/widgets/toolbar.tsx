"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, LocateFixed, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useOverview } from "../overview-context";
import { useWidgetData } from "../use-widget-data";
import { Skeleton, type WidgetProps } from "./kit";
import { WEATHER_LABEL, WeatherIcon, weatherKind } from "./weather-icon";

const SHELL = "flex h-full min-h-[64px] items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm";

export function SearchWidget() {
  const { openSearch } = useOverview();
  const [mac, setMac] = useState(false);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform)), []);
  return (
    <div className={SHELL}>
      <label className="relative flex min-w-0 flex-1 items-center">
        <span className="sr-only">Search the dashboard</span>
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          readOnly
          placeholder="Search features, people, bookings…"
          className="h-10 cursor-pointer rounded-xl pl-9 pr-16"
          onClick={() => openSearch()}
          onKeyDown={(e) => {
            if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
              e.preventDefault();
              openSearch(e.key);
            } else if (e.key === "Enter") openSearch();
          }}
        />
        <kbd className="pointer-events-none absolute right-2.5 hidden rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">{mac ? "⌘" : "Ctrl"} K</kbd>
      </label>
    </div>
  );
}

export function FeaturesWidget() {
  const { openFeatures } = useOverview();
  return (
    <div className={SHELL}>
      <Button type="button" onClick={openFeatures} className="h-10 w-full gap-2 rounded-xl bg-[#141211] text-[#f4f1ea] hover:bg-[#2a2622] dark:bg-[#f4f1ea] dark:text-[#141211] dark:hover:bg-white">
        <LayoutGrid className="h-4 w-4" aria-hidden />
        All Features
      </Button>
    </div>
  );
}

export function ClockWidget({ card }: WidgetProps) {
  const [now, setNow] = useState<Date | null>(null);
  const h24 = card.settings?.h24 === true;
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className={SHELL}>
      {now ? (
        <div className="min-w-0">
          <p className="text-xl font-semibold tabular-nums leading-tight tracking-tight" aria-live="off">
            {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: !h24 })}
            <span className="ml-1 text-xs font-normal text-muted-foreground">{String(now.getSeconds()).padStart(2, "0")}</span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
      ) : (
        <Skeleton className="h-9 w-28" />
      )}
    </div>
  );
}

type Weather = {
  needsLocation?: boolean;
  unit: "F" | "C";
  current: { temp: number; feels: number; code: number; isDay: boolean; wind: number; humidity: number } | null;
  daily: { day: string; max: number; min: number; code: number }[];
};

function LocationPicker({ onDone }: { onDone?: () => void }) {
  const { setLayoutField } = useOverview();
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useMine = () => {
    if (!navigator.geolocation) return setError("Location isn't available in this browser.");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLayoutField("location", { lat: Math.round(pos.coords.latitude * 100) / 100, lon: Math.round(pos.coords.longitude * 100) / 100, label: "Your location" });
        setBusy(false);
        onDone?.();
      },
      () => {
        setBusy(false);
        setError("Location permission was declined. Enter a city instead.");
      },
      { maximumAge: 3_600_000, timeout: 10_000 },
    );
  };

  const findCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=${encodeURIComponent(city.trim())}`);
      const j = (await res.json()) as { results?: { latitude: number; longitude: number; name: string; admin1?: string }[] };
      const hit = j.results?.[0];
      if (!hit) setError("We couldn't find that place.");
      else {
        setLayoutField("location", { lat: Math.round(hit.latitude * 100) / 100, lon: Math.round(hit.longitude * 100) / 100, label: [hit.name, hit.admin1].filter(Boolean).join(", ") });
        onDone?.();
      }
    } catch {
      setError("We couldn't look that up. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button type="button" size="sm" variant="outline" className="w-full gap-2" onClick={useMine} disabled={busy}>
        <LocateFixed className="h-4 w-4" aria-hidden /> Use my location
      </Button>
      <form onSubmit={findCity} className="flex gap-2">
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Or a city, e.g. Scottsdale" className="h-9" aria-label="City" />
        <Button type="submit" size="sm" disabled={busy}>
          Set
        </Button>
      </form>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

export function WeatherWidget({ card, def }: WidgetProps) {
  const { layout, setCardSettings } = useOverview();
  const unit = card.settings?.unit === "c" ? "c" : "f";
  const loc = layout.location;
  const state = useWidgetData<Weather>(loc ? "weather" : undefined, loc ? { lat: loc.lat, lon: loc.lon, unit } : undefined, def.refreshMs);
  const [open, setOpen] = useState(false);
  const cur = state.data?.current;

  return (
    <div className={SHELL}>
      {!loc ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="flex w-full items-center gap-3 text-left">
              <WeatherIcon code={1} className="h-11 w-11 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Weather</span>
                <span className="block truncate text-xs text-muted-foreground">Set your location</span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <LocationPicker onDone={() => setOpen(false)} />
          </PopoverContent>
        </Popover>
      ) : cur ? (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button type="button" className="flex w-full min-w-0 items-center gap-3 text-left" aria-label={`Weather: ${cur.temp}° and ${WEATHER_LABEL[weatherKind(cur.code)]}. Open the forecast.`}>
              <WeatherIcon code={cur.code} isDay={cur.isDay} className="h-12 w-12 shrink-0" />
              <span className="min-w-0">
                <span className="block text-xl font-semibold tabular-nums leading-tight">
                  {cur.temp}°<span className="text-sm font-normal text-muted-foreground">{state.data?.unit}</span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {WEATHER_LABEL[weatherKind(cur.code)]} · {loc.label || "Your location"}
                </span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80">
            <p className="text-sm font-semibold">{loc.label || "Your location"}</p>
            <p className="text-xs text-muted-foreground">
              Feels like {cur.feels}° · Wind {cur.wind} mph · Humidity {cur.humidity}%
            </p>
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {(state.data?.daily ?? []).map((d) => (
                <li key={d.day} className="flex flex-col items-center rounded-lg bg-muted/60 p-2 text-center">
                  <span className="text-[11px] font-medium text-muted-foreground">{new Date(`${d.day}T12:00:00`).toLocaleDateString(undefined, { weekday: "short" })}</span>
                  <WeatherIcon code={d.code} className="h-8 w-8" />
                  <span className="text-xs tabular-nums">
                    {d.max}° <span className="text-muted-foreground">{d.min}°</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={() => setCardSettings(card.uid, { ...card.settings, unit: unit === "f" ? "c" : "f" })}>
                Show °{unit === "f" ? "C" : "F"}
              </Button>
              <ChangeLocation />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">Weather data by Open-Meteo.com</p>
          </PopoverContent>
        </Popover>
      ) : state.error ? (
        <p className="text-xs text-muted-foreground">{state.error}</p>
      ) : (
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-full" />
          <Skeleton className="h-8 w-20" />
        </div>
      )}
    </div>
  );
}

function ChangeLocation() {
  const [open, setOpen] = useState(false);
  return open ? (
    <div className="w-full pl-2">
      <LocationPicker onDone={() => setOpen(false)} />
    </div>
  ) : (
    <Button type="button" size="sm" variant="ghost" className="gap-1.5" onClick={() => setOpen(true)}>
      <MapPin className="h-3.5 w-3.5" aria-hidden /> Change location
    </Button>
  );
}
