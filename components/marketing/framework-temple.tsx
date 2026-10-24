"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LAYER_KEYS, type FrameworkContent, type LayerKey } from "@/lib/marketing/content/scopes/global";
import { cn } from "@/lib/utils";
import styles from "./framework-temple.module.css";

// The Stewardship Blueprint as a building: pediment = Legacy, frieze = Energy,
// architrave = Keystone Habits, four columns = Pillars, balustrades on both
// sides = Guardrails, stylobate = Foundation, stepped crepidoma = Bedrock.
//
// It walks through the layers on its own while it is on screen; hovering or
// focusing previews a layer, clicking pins it. Autoplay pauses while the pointer
// is over it, while a layer is pinned, when it is scrolled away, and entirely
// for visitors who prefer reduced motion.

const GOLD = "#b88a4a";

export type TempleSelect = { key: LayerKey; nonce: number };

export function FrameworkTemple({
  framework,
  autoplayMs = 3200,
  select,
  onChange,
  className,
}: {
  framework: FrameworkContent;
  autoplayMs?: number;
  /** Pin a layer from outside (the tabs); a new nonce re-pins the same key. */
  select?: TempleSelect | null;
  onChange?: (key: LayerKey) => void;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<LayerKey | null>(null);
  const [pinned, setPinned] = useState<LayerKey | null>(null);
  const [auto, setAuto] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  const active: LayerKey = hover ?? pinned ?? LAYER_KEYS[auto];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced || paused || !visible || pinned || hover) return;
    const t = setInterval(() => setAuto((a) => (a + 1) % LAYER_KEYS.length), autoplayMs);
    return () => clearInterval(t);
  }, [reduced, paused, visible, pinned, hover, autoplayMs]);

  useEffect(() => {
    if (!select) return;
    setPinned(select.key);
    setAuto(LAYER_KEYS.indexOf(select.key));
  }, [select]);

  const lastEmitted = useRef<LayerKey | null>(null);
  useEffect(() => {
    if (lastEmitted.current !== active) {
      lastEmitted.current = active;
      onChange?.(active);
    }
  }, [active, onChange]);

  const toggle = useCallback((key: LayerKey) => {
    setPinned((p) => (p === key ? null : key));
    setAuto(LAYER_KEYS.indexOf(key));
  }, []);

  const L = framework.layers;
  const part = (key: LayerKey) => {
    const on = active === key;
    return {
      on,
      props: {
        type: "button" as const,
        "aria-pressed": pinned === key,
        "aria-label": `${L[key].name}: ${L[key].caption}`,
        onMouseEnter: () => setHover(key),
        onFocus: () => setHover(key),
        onBlur: () => setHover(null),
        onClick: () => toggle(key),
      },
      border: on ? GOLD : "var(--line)",
      glow: on ? "0 10px 30px rgba(184,138,74,.28)" : "0 1px 2px rgba(20,20,20,.06)",
      opacity: on ? 1 : 0.92,
      cls: cn(styles.part, pinned === key && styles.pinned),
    };
  };

  const legacy = part("legacy");
  const energy = part("energy");
  const habits = part("habits");
  const pillars = part("pillars");
  const rail = part("rail");
  const foundation = part("foundation");
  const bedrock = part("bedrock");

  const label = "text-[11px] font-bold uppercase tracking-[0.24em] whitespace-nowrap";
  const pillarNames = [framework.pillarNames.family, framework.pillarNames.fitness, framework.pillarNames.fun, framework.pillarNames.finances];

  const railButton = (side: "left" | "right") => (
    <button
      {...rail.props}
      className={cn(rail.cls, "self-start rounded")}
      style={{ height: 100, border: `1px solid ${rail.border}`, background: "var(--marble)", boxShadow: rail.glow, opacity: rail.opacity }}
    >
      <span className="absolute inset-x-1.5 top-2.5 h-[3px] rounded-sm" style={{ background: GOLD }} />
      <span className={cn(styles.railBars, "absolute bottom-3.5 left-2 right-2 top-[18px] opacity-90")} />
      <span className="absolute inset-x-1.5 bottom-2 h-[3px] rounded-sm opacity-60" style={{ background: GOLD }} />
      <span
        className={cn(styles.vertical, "absolute inset-0 m-auto flex h-max w-max items-center justify-center rounded-[3px] py-1.5 text-[9.5px] font-bold uppercase tracking-[0.22em]")}
        style={{ background: "var(--marble)", color: rail.on ? GOLD : "hsl(var(--muted-foreground))", transform: side === "left" ? "rotate(180deg)" : undefined }}
      >
        {L.rail.name}
      </span>
    </button>
  );

  return (
    <div
      ref={rootRef}
      className={cn(styles.temple, className)}
      role="group"
      aria-label="The Stewardship Blueprint framework"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        setHover(null);
      }}
    >
      {/* Pediment · Legacy */}
      {/* No pinned glow here: a box-shadow follows the button's rectangle, not the
          triangular roof, and draws a box behind it. The gold trim marks it instead. */}
      <button {...legacy.props} className={cn(styles.part, "mx-auto block h-[140px] w-[92%] border-0 bg-transparent p-0")} style={{ opacity: legacy.opacity }}>
        <span className={cn(styles.triangle, "inset-0")} style={{ background: legacy.on ? GOLD : "var(--marble-lo)", transition: "background .25s" }} />
        <span className={cn(styles.triangle, "inset-[4px_8px_0]")} style={{ background: "var(--marble)" }} />
        <span className={cn(styles.triangle, "inset-[14px_18px_8px]")} style={{ background: "var(--cella)" }} />
        <span className={styles.apex} />
        <span className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
          <span className={cn(label, "text-gold-light")}>{L.legacy.name}</span>
          <span className="max-w-[56%] text-center text-[10.5px] leading-snug text-band-text opacity-85">{L.legacy.caption}</span>
        </span>
      </button>

      {/* Cornice */}
      <div className="h-1.5 w-full rounded-t-sm border border-b-0" style={{ background: "var(--marble-hi)", boxShadow: "inset 0 -2px 0 var(--marble-lo)", borderColor: "var(--line)" }} />

      {/* Frieze · Energy */}
      <button
        {...energy.props}
        className={cn(energy.cls, "flex h-[46px] w-full items-center justify-between gap-3 px-[22px] text-left")}
        style={{
          borderStyle: "solid",
          borderWidth: "0 1px 1px",
          borderColor: energy.border,
          background: "var(--cella)",
          boxShadow: `inset 0 0 0 1px rgba(184,138,74,.25), ${energy.glow}`,
          opacity: energy.opacity,
        }}
      >
        <span
          className="absolute inset-x-0 bottom-0 h-0.5"
          style={{ background: "linear-gradient(90deg,transparent,#b88a4a 30%,#d8bd86 50%,#b88a4a 70%,transparent)", opacity: energy.on ? 1 : 0.35, transition: "opacity .25s" }}
        />
        <span className={cn(label, "text-gold-light")}>{L.energy.name}</span>
        <span className="min-w-0 truncate text-xs text-band-text">{L.energy.caption}</span>
      </button>

      {/* Architrave · Keystone Habits */}
      <button
        {...habits.props}
        className={cn(habits.cls, "flex h-[34px] w-full items-center justify-between gap-3 px-[22px] text-left")}
        style={{
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: `${GOLD} ${habits.border} ${habits.border}`,
          background: "var(--marble)",
          boxShadow: habits.glow,
          opacity: habits.opacity,
        }}
      >
        <span className="flex items-center gap-2.5 whitespace-nowrap">
          <span className="flex gap-[3px]" aria-hidden>
            {[1, 0.65, 0.35].map((o) => (
              <span key={o} className="h-[5px] w-[5px] rotate-45 rounded-[1px]" style={{ background: GOLD, opacity: o }} />
            ))}
          </span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground">{L.habits.name}</span>
        </span>
        <span className="min-w-0 truncate text-[11.5px] text-muted-foreground">{L.habits.caption}</span>
      </button>

      {/* Colonnade · Four Pillars */}
      <div className="relative z-[1] -mb-px h-[190px] px-[56px]">
        <div className="flex h-full items-stretch justify-evenly">
          {pillarNames.map((name) => (
            <button
              key={name}
              {...pillars.props}
              aria-label={`${L.pillars.name}: ${name}`}
              className={cn(styles.part, "flex w-[16%] min-w-[44px] max-w-[72px] flex-col items-center justify-end border-0 bg-transparent p-0")}
              style={{ opacity: pillars.opacity }}
            >
              <span className="h-2.5 w-full rounded-[3px_3px_1px_1px] border" style={{ background: "var(--marble-hi)", borderColor: "var(--line)", boxShadow: `0 2px 0 ${GOLD}` }} />
              <span className="h-2 w-[78%] rounded-b-md border border-t-0" style={{ background: "var(--marble)", borderColor: "var(--line)" }} />
              <span
                className={cn(styles.fluted, pinned === "pillars" && styles.pinned, "relative w-[70%] flex-1 border-x")}
                style={{ borderColor: "var(--line)", boxShadow: `inset -6px 0 10px -6px rgba(0,0,0,.25), ${pillars.glow}` }}
              >
                <span
                  className={cn(styles.vertical, "absolute left-1/2 top-1/2 whitespace-nowrap rounded-[3px] px-px py-1.5 font-display text-[15px] font-semibold tracking-[0.04em]")}
                  style={{ transform: "translate(-50%,-50%) rotate(180deg)", background: "var(--marble)", color: pillars.on ? GOLD : "hsl(var(--foreground))" }}
                >
                  {name}
                </span>
              </span>
              <span className="h-[7px] w-[84%] rounded-t-sm border border-b-0" style={{ background: "var(--marble)", borderColor: "var(--line)" }} />
              <span className="h-[9px] w-full rounded-t-sm border border-b-0" style={{ background: "var(--marble-hi)", borderColor: "var(--line)", boxShadow: `0 -2px 0 ${GOLD}` }} />
            </button>
          ))}
        </div>
      </div>

      {/* Base: guardrail · foundation + bedrock · guardrail */}
      <div className="relative grid grid-cols-[46px_minmax(0,1fr)_46px] items-start gap-x-2.5">
        {railButton("left")}
        <div className="min-w-0">
          {/* Stylobate · Foundation */}
          <button
            {...foundation.props}
            className={cn(foundation.cls, "flex h-12 w-full items-center justify-between gap-3 px-[22px] text-left")}
            style={{
              border: `1px solid ${foundation.border}`,
              background: "var(--marble-hi)",
              boxShadow: `inset 0 3px 0 var(--marble-lo), ${foundation.glow}`,
              opacity: foundation.opacity,
            }}
          >
            <span className="whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.22em] text-foreground">{L.foundation.name}</span>
            <span className="min-w-0 truncate text-[11.5px] text-muted-foreground">{L.foundation.caption}</span>
          </button>

          {/* Crepidoma · Bedrock */}
          <button {...bedrock.props} className={cn(styles.part, "block h-24 w-full border-0 bg-transparent p-0 text-left")} style={{ opacity: bedrock.opacity }}>
            <span
              className={cn("absolute inset-x-0 top-0 h-[52px]", pinned === "bedrock" && styles.pinned)}
              style={{ background: "var(--cella)", border: `1px solid ${bedrock.border}`, boxShadow: bedrock.glow }}
            />
            <span
              className="absolute -inset-x-14 top-[52px] h-[22px] opacity-90"
              style={{ background: "var(--cella)", borderStyle: "solid", borderWidth: "0 1px 1px", borderColor: bedrock.border }}
            />
            <span
              className="absolute -inset-x-[72px] top-[74px] h-[22px] rounded-b-md opacity-[0.84]"
              style={{ background: "var(--cella)", borderStyle: "solid", borderWidth: "0 1px 1px", borderColor: bedrock.border }}
            />
            <span
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, opacity: bedrock.on ? 1 : 0.35 }}
            />
            <span className="pointer-events-none absolute inset-x-[18px] top-0 flex h-[52px] items-center justify-between gap-3.5">
              <span className="flex flex-col gap-0.5 whitespace-nowrap">
                <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-light">{L.bedrock.name}</span>
                <span className="font-display text-[clamp(15px,4.5cqw,19px)] leading-[1.1] text-[#f4f1ea]">{L.bedrock.caption}</span>
              </span>
              <span className={cn(styles.bedrockNote, "min-w-0 max-w-[170px] overflow-hidden text-right text-[10.5px] leading-[1.35] text-band-text")}>
                {framework.bedrockNote}
              </span>
            </span>
          </button>
        </div>
        {railButton("right")}
      </div>
    </div>
  );
}
