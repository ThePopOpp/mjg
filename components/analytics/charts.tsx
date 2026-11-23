"use client";

import { useMemo, useRef, useState } from "react";

// Small, dependency-free charts for /dashboard/analytics. One measure per chart in
// brand gold (MJG has no green; see reference_brand_colors), text in ink tokens.

const GOLD = "#b88a4a";

type Point = { day: string; value: number };

function fmtDay(day: string) {
  const d = new Date(`${day}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Fills gaps so days with no traffic plot as zero instead of being skipped. */
function fillDays(points: Point[], days: number): Point[] {
  const byDay = new Map(points.map((p) => [p.day, p.value]));
  const out: Point[] = [];
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: "America/Phoenix" }) + "T12:00:00");
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    out.push({ day: d, value: byDay.get(d) ?? 0 });
  }
  return out;
}

export function TrendChart({ points, days, label }: { points: Point[]; days: number; label: string }) {
  const data = useMemo(() => fillDays(points, days), [points, days]);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const W = 720;
  const H = 200;
  const PAD = { l: 36, r: 8, t: 10, b: 22 };
  const max = Math.max(1, ...data.map((p) => p.value));
  const niceMax = max <= 5 ? 5 : Math.ceil(max / 5) * 5;
  const x = (i: number) => PAD.l + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - PAD.l - PAD.r));
  const y = (v: number) => PAD.t + (1 - v / niceMax) * (H - PAD.t - PAD.b);
  const line = data.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const ticks = [0, niceMax / 2, niceMax];
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, i)));
  }

  const h = hover !== null ? data[hover] : null;
  const total = data.reduce((s, p) => s + p.value, 0);

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="h-52 w-full touch-none"
        role="img"
        aria-label={`${label} per day: ${total} total over ${days} days`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
            <text x={PAD.l - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {data.map((p, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={p.day} x={x(i)} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} className="fill-muted-foreground text-[11px]">
              {fmtDay(p.day)}
            </text>
          ) : null,
        )}
        <path d={area} fill={GOLD} fillOpacity={0.14} />
        <path d={line} fill="none" stroke={GOLD} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {h && hover !== null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={y(0)} className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(h.value)} r={4.5} fill={GOLD} className="stroke-card" strokeWidth={2} />
          </g>
        )}
      </svg>
      {h && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-sm"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > data.length / 2 ? "-105%" : "5%"})` }}
        >
          <div className="text-muted-foreground">{fmtDay(h.day)}</div>
          <div className="font-semibold text-foreground">
            {h.value.toLocaleString()} {label.toLowerCase()}
          </div>
        </div>
      )}
    </div>
  );
}

export type BarItem = { key: string; label?: string; value: number; detail?: string };

/** Horizontal bars for ranked breakdowns; the label and number are always text. */
export function BarList({ items, empty = "No data yet.", valueLabel }: { items: BarItem[]; empty?: string; valueLabel?: string }) {
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-1.5" aria-label={valueLabel}>
      {items.map((item) => (
        <li key={item.key} className="group relative" title={`${item.label ?? item.key}: ${item.value.toLocaleString()}${valueLabel ? ` ${valueLabel}` : ""}`}>
          <div className="absolute inset-y-0 left-0 rounded-[4px] bg-[#b88a4a]/15 transition-colors group-hover:bg-[#b88a4a]/25" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} />
          <div className="relative flex items-center justify-between gap-3 px-2 py-1.5 text-sm">
            <span className="min-w-0 truncate">{item.label ?? item.key}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              {item.value.toLocaleString()}
              {item.detail ? <span className="ml-2 text-xs">{item.detail}</span> : null}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
