// The Overview layout a person has saved: views → rows → cards. Stored in
// user_preferences.dashboard_preferences.overview. Pure functions only, so the
// API, the page and the tests share them.

import type { AppRole } from "@/lib/rbac/roles";
import { WIDGET_BY_ID, allowed } from "./catalog";

export const LAYOUT_VERSION = 1;

export type OverviewCard = {
  uid: string;
  widget: string;
  /** Column span out of 12 in grid rows (ignored in rails). */
  span: number;
  hidden?: boolean;
  settings?: Record<string, unknown>;
};

export type OverviewRow = {
  id: string;
  /** rail = one sliding row; grid = 12-column wrap. */
  kind: "rail" | "grid";
  title?: string;
  hidden?: boolean;
  collapsed?: boolean;
  /** Rails: how many cards are visible at desktop width (e.g. 3.5). */
  visible?: number;
  cards: OverviewCard[];
};

export type OverviewView = { id: string; name: string; rows: OverviewRow[] };

export type OverviewLayout = {
  version: number;
  mode: "standard" | "blank";
  activeView: string;
  views: OverviewView[];
  /** The Get Started wizard has been completed or skipped. */
  wizardDone: boolean;
  density: "comfy" | "compact";
  /** Date range for the stat cards. */
  statRange: "today" | "7d" | "30d";
  /** Weather location, rounded to 2 decimals. */
  location?: { lat: number; lon: number; label: string } | null;
};

const MAX_VIEWS = 8;
const MAX_ROWS = 30;
const MAX_CARDS = 40;

let counter = 0;
export function uid(prefix = "c") {
  counter = (counter + 1) % 1e6;
  return `${prefix}${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function clampSpan(widget: string, span: unknown): number {
  const def = WIDGET_BY_ID.get(widget);
  const min = def?.minSpan ?? 2;
  const n = typeof span === "number" && Number.isFinite(span) ? Math.round(span) : def?.span ?? 4;
  return Math.min(12, Math.max(min, n));
}

export function card(widget: string, span?: number, settings?: Record<string, unknown>): OverviewCard {
  return { uid: uid(), widget, span: clampSpan(widget, span ?? WIDGET_BY_ID.get(widget)?.span), ...(settings ? { settings } : {}) };
}

const grid = (id: string, title: string | undefined, widgets: (string | [string, number])[]): OverviewRow => ({
  id,
  kind: "grid",
  ...(title ? { title } : {}),
  cards: widgets.map((w) => (Array.isArray(w) ? card(w[0], w[1]) : card(w))),
});

const rail = (id: string, title: string, widgets: string[], visible: number): OverviewRow => ({
  id,
  kind: "rail",
  title,
  visible,
  cards: widgets.map((w) => card(w)),
});

/** The Standard dashboard: Jeremy's default rows, then today's overview sections. */
export function standardRows(): OverviewRow[] {
  return [
    grid("r-start", undefined, ["start.checklist"]),
    grid("r-toolbar", undefined, ["toolbar.search", "toolbar.features", "toolbar.clock", "toolbar.weather"]),
    grid("r-alerts", "Notifications", ["alert.agent", "alert.next-todo", "alert.jobs"]),
    rail(
      "r-stats",
      "At a Glance",
      [
        "stat.calls",
        "stat.outbound",
        "stat.inbound",
        "stat.missed",
        "stat.sms",
        "stat.bookings",
        "stat.calendar",
        "stat.notifications",
        "stat.messages",
        "stat.alerts",
        "stat.emails",
        "stat.files",
      ],
      6,
    ),
    grid("r-tasks", undefined, ["tasks.my"]),
    grid("r-new", undefined, ["community.whats-new"]),
    grid("r-invites", undefined, ["community.invitations"]),
    grid("r-dms", undefined, ["comms.dms"]),
    grid("r-community", undefined, ["community.metrics", "community.recent-checkins"]),
    grid("r-waves", undefined, ["community.waves", "community.pipeline"]),
  ];
}

export function standardLayout(): OverviewLayout {
  return {
    version: LAYOUT_VERSION,
    mode: "standard",
    activeView: "main",
    views: [{ id: "main", name: "Overview", rows: standardRows() }],
    wizardDone: true,
    density: "comfy",
    statRange: "7d",
    location: null,
  };
}

export function blankLayout(): OverviewLayout {
  return {
    version: LAYOUT_VERSION,
    mode: "blank",
    activeView: "main",
    views: [{ id: "main", name: "My Dashboard", rows: [] }],
    wizardDone: false,
    density: "comfy",
    statRange: "7d",
    location: null,
  };
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : undefined);

function cleanSettings(v: unknown): Record<string, unknown> | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  // Settings are small (a range, a list of zones, a few links). Cap the size so a
  // layout can't be used to stash large blobs in preferences.
  const json = JSON.stringify(v);
  return json.length <= 4000 ? (JSON.parse(json) as Record<string, unknown>) : undefined;
}

/**
 * Make any stored or submitted value a valid layout for this role: unknown or
 * forbidden cards are dropped, duplicates of single cards removed, sizes clamped.
 * Never throws; falls back to Standard.
 */
export function sanitizeLayout(raw: unknown, role: AppRole): OverviewLayout {
  if (!raw || typeof raw !== "object") return pruneEmptyStandard(standardLayout(), role);
  const r = raw as Partial<OverviewLayout>;
  const viewsIn = Array.isArray(r.views) ? r.views.slice(0, MAX_VIEWS) : [];
  const views: OverviewView[] = viewsIn
    .filter((v): v is OverviewView => !!v && typeof v === "object")
    .map((v, vi) => {
      const seenSingle = new Set<string>();
      const seenUid = new Set<string>();
      const rows: OverviewRow[] = (Array.isArray(v.rows) ? v.rows.slice(0, MAX_ROWS) : [])
        .filter((row) => !!row && typeof row === "object")
        .map((row, ri) => {
          const cards = (Array.isArray(row.cards) ? row.cards.slice(0, MAX_CARDS) : [])
            .filter((c) => {
              if (!c || typeof c !== "object" || typeof c.widget !== "string") return false;
              const def = WIDGET_BY_ID.get(c.widget);
              if (!def || !allowed(role, def.access)) return false;
              if (def.single !== false) {
                if (seenSingle.has(c.widget)) return false;
                seenSingle.add(c.widget);
              }
              return true;
            })
            .map((c): OverviewCard => {
              let id = str(c.uid, 40) || uid();
              if (seenUid.has(id)) id = uid();
              seenUid.add(id);
              const settings = cleanSettings(c.settings);
              return { uid: id, widget: c.widget, span: clampSpan(c.widget, c.span), ...(c.hidden ? { hidden: true } : {}), ...(settings ? { settings } : {}) };
            });
          const visible = typeof row.visible === "number" && row.visible >= 1 && row.visible <= 8 ? Math.round(row.visible * 2) / 2 : undefined;
          return {
            id: str(row.id, 40) || `r${vi}-${ri}`,
            kind: row.kind === "rail" ? "rail" : "grid",
            ...(str(row.title, 60) ? { title: str(row.title, 60) } : {}),
            ...(row.hidden ? { hidden: true } : {}),
            ...(row.collapsed ? { collapsed: true } : {}),
            ...(visible ? { visible } : {}),
            cards,
          } satisfies OverviewRow;
        });
      return { id: str(v.id, 40) || `v${vi}`, name: str(v.name, 40) || "Overview", rows };
    });

  if (!views.length) return pruneEmptyStandard(standardLayout(), role);
  const loc = r.location;
  const location =
    loc && typeof loc === "object" && Number.isFinite(loc.lat) && Number.isFinite(loc.lon) && Math.abs(loc.lat) <= 90 && Math.abs(loc.lon) <= 180
      ? { lat: Math.round(loc.lat * 100) / 100, lon: Math.round(loc.lon * 100) / 100, label: str(loc.label, 60) ?? "" }
      : null;
  return {
    version: LAYOUT_VERSION,
    mode: r.mode === "blank" ? "blank" : "standard",
    activeView: views.some((v) => v.id === r.activeView) ? (r.activeView as string) : views[0].id,
    views,
    wizardDone: r.wizardDone !== false,
    density: r.density === "compact" ? "compact" : "comfy",
    statRange: r.statRange === "today" || r.statRange === "30d" ? r.statRange : "7d",
    location,
  };
}

/** Standard for a role: drop forbidden cards, then rows left empty. */
function pruneEmptyStandard(layout: OverviewLayout, role: AppRole): OverviewLayout {
  const clean = sanitizeLayout({ ...layout }, role);
  return { ...clean, views: clean.views.map((v) => ({ ...v, rows: v.rows.filter((r) => r.cards.length) })) };
}

export function defaultLayoutFor(role: AppRole): OverviewLayout {
  return pruneEmptyStandard(standardLayout(), role);
}
