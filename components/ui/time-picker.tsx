"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Branded, theme-aware time picker (no native browser time UI).
// value / onChange use 24h "HH:MM".
function to12(value?: string) {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  return { hour12: h % 12 === 0 ? 12 : h % 12, minute: m, period: (h >= 12 ? "PM" : "AM") as "AM" | "PM" };
}
function to24(hour12: number, minute: number, period: "AM" | "PM") {
  let h = hour12 % 12;
  if (period === "PM") h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
function label(value?: string) {
  const p = to12(value);
  return p ? `${p.hour12}:${String(p.minute).padStart(2, "0")} ${p.period}` : "";
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
  className,
}: {
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const parsed = to12(value) ?? { hour12: 9, minute: 0, period: "AM" as const };

  React.useEffect(() => {
    function onDoc(e: MouseEvent) { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); }
    function onEsc(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) { document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onEsc); }
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
  }, [open]);

  function set(part: Partial<{ hour12: number; minute: number; period: "AM" | "PM" }>) {
    const next = { ...parsed, ...part };
    onChange(to24(next.hour12, next.minute, next.period));
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring",
          !value && "text-muted-foreground",
          className,
        )}
      >
        <span>{label(value) || placeholder}</span>
        <Clock className="h-4 w-4 opacity-50" />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 flex w-56 gap-1 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
          <Column
            items={Array.from({ length: 12 }, (_, i) => ({ v: i + 1, l: String(i + 1) }))}
            selected={parsed.hour12}
            onPick={(v) => set({ hour12: v })}
          />
          <Column
            items={Array.from({ length: 60 }, (_, i) => ({ v: i, l: String(i).padStart(2, "0") }))}
            selected={parsed.minute}
            onPick={(v) => set({ minute: v })}
          />
          <div className="flex w-12 shrink-0 flex-col gap-0.5">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set({ period: p })}
                className={cn("rounded px-2 py-1 text-sm transition-colors", parsed.period === p ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ items, selected, onPick }: { items: { v: number; l: string }[]; selected: number; onPick: (v: number) => void }) {
  return (
    <div className="flex max-h-48 w-full flex-col gap-0.5 overflow-y-auto">
      {items.map((it) => (
        <button
          key={it.v}
          type="button"
          onClick={() => onPick(it.v)}
          className={cn("rounded px-2 py-1 text-center text-sm transition-colors", selected === it.v ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground")}
        >
          {it.l}
        </button>
      ))}
    </div>
  );
}
