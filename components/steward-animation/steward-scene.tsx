"use client";

import * as React from "react";
import { CLICKS, CAM, CURSOR, MODE_AT, MODES, MSGS, RECORDING, S_MARK, SANS, SERIF, STAGE, THEMES, THINKING, THREADS, TYPING, AUTHORED_TOTAL, type SceneLayout } from "./steward-script";
import { MOTION, clamp, env, resolveKeys, typed } from "./motion";
import { Orb, Particles, type Layer, type SceneParams } from "./steward-three";

// The Steward demo, as one component that is a pure function of `t`.
//
// This is the approved steward-scene.jsx ported to TSX. The structure, the
// numbers and the layout are deliberately unchanged — this renders the film the
// owner signed off on, not an interpretation of it. Two things did change, both
// forced by the move out of the authoring harness:
//
//   1. `t` arrives as a prop instead of from useComposition(). That is the whole
//      point of the port: the harness owned a clock, and here the caller owns
//      it. Autoplay passes a looping wall clock; the scroll version passes
//      scroll position. Neither has to know anything about the other.
//   2. three.js is imported rather than read off `window.THREE`, and instances
//      are disposed. The harness leaked them because it was a page you closed.
//
// `layout` switches between the desktop composition (1920x1080, sidebar, full
// nav) and the phone one (1080x1920, no sidebar, pan-only camera). Both are
// authored — this is the mobile source file, which carries both.

export type StewardSceneProps = {
  /** Authored time, 0 → AUTHORED_TOTAL. Values outside are clamped by the beats themselves. */
  t: number;
  layout?: SceneLayout;
  theme?: "dark" | "light";
  particles?: boolean;
  tilt?: boolean;
  /**
   * Render the demo's own navigation bar.
   *
   * Off by default, because in this app the scene is always inside the real
   * site chrome and two navigation bars sixty pixels apart read as a bug rather
   * than as a product shot. The authored composition has one — it was built to
   * stand alone in a video — so the switch stays rather than the markup being
   * deleted.
   */
  chrome?: boolean;
  /**
   * Time for the particle field only. The scroll version keeps the field
   * drifting while the interface is held still, so a paused scrub reads as
   * "waiting" rather than "broken". Defaults to `t`.
   */
  particleTime?: number;
};

// ── A three.js layer bound to authored time ──────────────────────────────────

function ThreeCanvas({
  kind,
  w,
  h,
  t,
  params,
  style,
}: {
  kind: "Particles" | "Orb";
  w: number;
  h: number;
  t: number;
  params: SceneParams;
  style?: React.CSSProperties;
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const inst = React.useRef<Layer | null>(null);

  // Constructed once, rendered on every commit — the parent re-renders each
  // frame with a new `t`, so this is the frame loop.
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    if (!inst.current) {
      try {
        inst.current = kind === "Orb" ? new Orb(ref.current, w, h) : new Particles(ref.current, w, h);
      } catch {
        // WebGL unavailable or context-limited. The composition is still
        // complete without its ambient layer, so fail quiet.
        return;
      }
    }
    inst.current.render(t, params);
  });

  React.useEffect(
    () => () => {
      inst.current?.dispose();
      inst.current = null;
    },
    [],
  );

  return (
    <canvas
      ref={ref}
      width={w}
      height={h}
      style={{ display: "block", width: w, height: h, ...style }}
    />
  );
}

// ── Icons (lucide paths, inlined so the scene has no icon dependency) ────────

const I = ({ d, size = 16, sw = 2, style }: { d: readonly string[]; size?: number; sw?: number; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d.map((p, i) => <path key={i} d={p} />)}
  </svg>
);

const P = {
  plus: ["M12 5v14", "M5 12h14"],
  msg: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"],
  book: ["M12 7v14", "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"],
  more: ["M12 12h.01", "M19 12h.01", "M5 12h.01"],
  check: ["M20 6 9 17l-5-5"],
  mic: ["M12 19v3", "M19 10v2a7 7 0 0 1-14 0v-2", "M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"],
  up: ["m5 12 7-7 7 7", "M12 19V5"],
  x: ["M18 6 6 18", "m6 6 12 12"],
  copy: ["M8 8h12v12H8z", "M16 8V4H4v12h4"],
  refresh: ["M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", "M21 3v5h-5", "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", "M8 16H3v5"],
  moon: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
  sun: ["M12 2v2", "M12 20v2", "m4.93 4.93 1.41 1.41", "m17.66 17.66 1.41 1.41", "M2 12h2", "M20 12h2", "m6.34 17.66-1.41 1.41", "m19.07 4.93-1.41 1.41", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  chev: ["m6 9 6 6 6-6"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  menu: ["M4 6h16", "M4 12h16", "M4 18h16"],
} as const;

// ── Stable sub-components, at module scope so React keeps their DOM ──────────

type C = (typeof THEMES)["dark"];
type Reg = (id: string) => (el: HTMLElement | null) => void;

const Avatar = ({ c, t, pulse }: { c: C; t: number; pulse?: boolean }) => (
  <span style={{ marginTop: 2, display: "flex", height: 28, width: 28, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 8, background: c.muted, border: `1px solid ${c.border}` }}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={S_MARK} alt="" style={{ height: 16, width: "auto", display: "block", transform: pulse ? `scale(${1 + Math.sin(t * 12) * 0.12})` : "none" }} />
  </span>
);

/** The voice-note waveform. 72 bars under a bell curve, each on its own phase. */
const Eq = ({ c, t, e }: { c: C; t: number; e: number }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 40, width: "100%", overflow: "hidden" }}>
    {Array.from({ length: 72 }, (_, i) => {
      const k = i / 72;
      const bell = Math.sin(k * Math.PI);
      const n = 0.5 + 0.5 * Math.sin(t * 7.3 + i * 0.62) * Math.sin(t * 3.1 + i * 1.7) + Math.sin(t * 13.7 + i * 2.3) * 0.18;
      const h = 4 + Math.max(0, n) * 30 * bell * e;
      return <span key={i} style={{ flexShrink: 0, width: 2, height: h, borderRadius: 999, background: c.gold, opacity: 0.55 + bell * 0.45 }} />;
    })}
  </div>
);

const Pill = ({ c, reg, seam, id, label, active, onlyWhen }: { c: C; reg: Reg; seam: number; id: string; label: string; active: boolean; onlyWhen: boolean }) => (
  <span ref={reg(id)} style={{ height: 28, padding: "0 12px", borderRadius: 999, display: "inline-flex", alignItems: "center", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", border: `1px solid ${active ? c.gold : c.border}`, background: active ? c.gold : "transparent", color: active ? "#fff" : c.fg, opacity: onlyWhen ? 1 - seam : 0 }}>
    {label}
  </span>
);

const IconBtn = ({ c, reg, id, d, filled, dim, size = 36 }: { c: C; reg: Reg; id?: string; d: readonly string[]; filled?: boolean; dim?: boolean; size?: number }) => (
  <span ref={id ? reg(id) : undefined} style={{ height: size, width: size, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: filled ? "none" : `1px solid ${c.border}`, background: filled ? (dim ? c.muted : c.fg) : c.card, color: filled ? (dim ? c.mutedFg : c.bg) : c.fg, transform: dim ? "scale(0.9)" : "none" }}>
    <I d={d} size={16} />
  </span>
);

// ── The composition ──────────────────────────────────────────────────────────

export function StewardScene({
  t: T,
  layout = "desktop",
  theme = "dark",
  particles = true,
  tilt = true,
  chrome = false,
  particleTime,
}: StewardSceneProps) {
  const c = THEMES[theme];
  const M = layout === "mobile";
  const { w: W, h: H } = STAGE[layout];
  const APP_W = M ? 390 : 1440;
  const APP_H = M ? 693 : 810;
  const K = W / APP_W;
  const PAD = M ? 16 : 28;

  const appRef = React.useRef<HTMLDivElement>(null);
  const els = React.useRef<Record<string, HTMLElement>>({});
  const missed = React.useRef(false);
  const [, remeasure] = React.useState(0);
  const pending = React.useRef(false);

  // The camera aims at real elements, so the first frame cannot know where
  // anything is. When a target is asked for before it has mounted, one extra
  // render is scheduled — coalesced, so a frame with ten missing targets costs
  // one re-render rather than ten.
  const bump = () => {
    if (pending.current) return;
    pending.current = true;
    requestAnimationFrame(() => {
      pending.current = false;
      remeasure((k) => k + 1);
    });
  };
  const reg: Reg = (id) => (el) => {
    if (el && els.current[id] !== el) {
      els.current[id] = el;
      if (missed.current) bump();
    }
  };

  // Measured in LAYOUT space by walking the offset chain to the app root, not
  // with getBoundingClientRect. The camera and the tilt are transforms on
  // ancestors of these elements; a client rect would include them and the
  // camera would chase its own output.
  const rect = (id: string) => {
    const a = appRef.current;
    const e = els.current[id];
    if (!a || !e) {
      missed.current = true;
      return null;
    }
    let x = 0;
    let y = 0;
    let n: HTMLElement | null = e;
    while (n && n !== a) {
      x += n.offsetLeft;
      y += n.offsetTop;
      n = n.offsetParent as HTMLElement | null;
    }
    if (n !== a) {
      missed.current = true;
      return null;
    }
    const w = e.offsetWidth * K;
    const h = e.offsetHeight * K;
    x *= K;
    y *= K;
    return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
  };

  React.useLayoutEffect(() => {
    if (missed.current && !appRef.current) bump();
    missed.current = false;
  });

  // ── State derived from T ───────────────────────────────────────────────────
  const mode = T >= MODE_AT.step ? "step" : T >= MODE_AT.think ? "think" : T >= MODE_AT.listen ? "listen" : null;
  const seam = clamp((T - (AUTHORED_TOTAL - 0.8)) / 0.6, 0, 1); // loop seam: transcript → welcome
  const welcomeOp = mode ? seam : 1;
  const recording = T >= RECORDING[0] && T < RECORDING[1];
  const thinking = THINKING.some(([a, b]) => T >= a && T < b);
  const speaking = MSGS.some((m) => m.role === "steward" && T >= m.at && T < m.end);
  const draft = TYPING.reduce((acc, ty) => (T >= ty.a && T < ty.b + 0.25 ? typed(ty.text, T, ty.a, ty.b) : acc), "");
  const focused = TYPING.some((ty) => T >= ty.a - 0.05 && T < ty.b + 0.25);
  const energy = Math.max(
    env(T, RECORDING[0], RECORDING[1]) * 1,
    ...THINKING.map(([a, b]) => env(T, a, b, 0.3) * 0.85),
    ...TYPING.map((ty) => env(T, ty.a, ty.b, 0.3) * 0.6),
    ...MSGS.filter((m): m is Extract<typeof m, { end: number }> => "end" in m).map((m) => env(T, m.at, m.end, 0.3) * 0.5),
    0.18,
  );
  const orbMode: SceneParams["mode"] = recording ? "listening" : thinking ? "thinking" : speaking ? "speaking" : "idle";
  const status = recording ? "Listening…" : thinking ? "Thinking…" : speaking ? "Responding…" : "Grounded in your Blueprint";

  // ── Camera ─────────────────────────────────────────────────────────────────
  const camPoint = (k: { target: string | null; s: number }) => {
    const r = k.target ? rect(k.target) : null;
    return r ? { x: r.cx, y: r.cy, s: k.s } : { x: W / 2, y: H / 2, s: k.s };
  };
  const ck = resolveKeys(CAM as unknown as Array<{ at: number; d?: number; target: string | null; s: number }>, T);
  const ca = camPoint(ck.cur);
  const cb = ck.next ? camPoint(ck.next) : ca;
  const cam = { x: ca.x + (cb.x - ca.x) * ck.p, y: ca.y + (cb.y - ca.y) * ck.p, s: ca.s + (cb.s - ca.s) * ck.p };
  if (M) cam.s = 1; // the phone already fills the stage width — pan only, never zoom
  const vw = W / cam.s;
  const vh = H / cam.s;
  cam.x = clamp(cam.x, vw / 2, W - vw / 2);
  cam.y = clamp(cam.y, vh / 2, H - vh / 2);
  const tiltX = tilt ? Math.sin(T * 0.35) * 1.6 : 0;
  const tiltY = tilt ? Math.cos(T * 0.27) * 2.2 : 0;

  // ── Cursor ─────────────────────────────────────────────────────────────────
  const uk = resolveKeys(CURSOR as unknown as Array<{ at: number; d?: number; target: string }>, T);
  const cp = (k: { target: string }) => {
    const r = rect(k.target);
    return r ? { x: r.cx, y: r.cy } : { x: W * 0.78, y: H * 0.83 };
  };
  const ua = cp(uk.cur);
  const ub = uk.next ? cp(uk.next) : ua;
  const cur = { x: ua.x + (ub.x - ua.x) * uk.p, y: ua.y + (ub.y - ua.y) * uk.p };
  const clickP = CLICKS.reduce((m, k) => Math.max(m, env(T, k - 0.05, k + 0.22, 0.08)), 0);
  const ring = CLICKS.reduce((m, k) => (T >= k && T < k + 0.5 ? Math.max(m, (T - k) / 0.5) : m), 0);
  const cursorOp = clamp((T - 0.1) / 0.5, 0, 1) * clamp((35.6 - T) / 0.5, 0, 1);

  const gold07 = "rgba(184,138,74,0.07)";
  const gold50 = "rgba(184,138,74,0.5)";
  const gold15 = "rgba(184,138,74,0.15)";

  return (
    <div style={{ position: "absolute", inset: 0, background: c.bg, overflow: "hidden", fontFamily: SANS, color: c.fg, perspective: 2600 }}>
      {particles ? (
        <ThreeCanvas key={W} kind="Particles" w={W} h={H} t={particleTime ?? T} params={{ energy, color: c.particle, opacity: c.particleOpacity }} style={{ position: "absolute", inset: 0 }} />
      ) : null}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, transparent 45%, ${c.bg} 100%)` }} />

      {/* camera rig */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${W / 2 - cam.x * cam.s}px, ${H / 2 - cam.y * cam.s}px) scale(${cam.s})` }}>
        <div style={{ position: "absolute", inset: 0, transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, transformStyle: "preserve-3d" }}>
          {/* the app, authored at its real pixel size and scaled to the stage */}
          <div ref={appRef} style={{ position: "absolute", left: 0, top: 0, width: APP_W, height: APP_H, transform: `scale(${K})`, transformOrigin: "0 0", background: c.bgA, display: "flex", flexDirection: "column", fontSize: 14, lineHeight: 1.45 }}>
            {/* The demo's own top nav — see `chrome`. */}
            {!chrome ? null : M ? (
              <div style={{ height: 56, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: `1px solid ${c.border}` }}>
                <span style={{ height: 36, width: 36, borderRadius: 999, border: `1px solid ${c.border}`, background: c.card, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><I d={P.menu} size={16} /></span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.logo} alt="MJG" style={{ height: 28, width: "auto", display: "block" }} />
                <span style={{ height: 36, width: 36, borderRadius: 999, border: `1px solid ${c.border}`, background: c.muted, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><I d={theme === "light" ? P.sun : P.moon} size={15} /></span>
              </div>
            ) : (
              <div style={{ height: 56, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 64px", borderBottom: `1px solid ${c.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.logo} alt="MJG" style={{ height: 30, width: "auto", display: "block" }} />
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 600, fontSize: 15 }}>Michael J. Gauthier</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 13.5, fontWeight: 600 }}>
                  <span>Home</span><span>About</span><span>Mission</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>Resources <I d={P.chev} size={12} /></span>
                  <span>Contact</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: c.mutedFg }}>Account <I d={P.chev} size={12} /></span>
                  <span style={{ height: 36, width: 36, borderRadius: 999, border: `1px solid ${c.border}`, background: c.muted, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 6 }}><I d={theme === "light" ? P.sun : P.moon} size={15} /></span>
                </div>
              </div>
            )}

            {/* body */}
            <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: M ? "minmax(0,1fr)" : "258px minmax(0,1fr)", padding: M ? 0 : "0 64px" }}>
              {/* sidebar */}
              {M ? null : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "14px 14px 14px 0", borderRight: `1px solid ${c.border}`, minHeight: 0 }}>
                  <span style={{ height: 36, borderRadius: 8, border: `1px solid ${c.border}`, background: c.card, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontWeight: 600, fontSize: 13.5 }}><I d={P.plus} size={15} /> New conversation</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {([["Steward", P.msg, true], ["My Blueprint", P.book, false], ["More", P.more, false]] as const).map(([l, d, act]) => (
                      <span key={l} style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, fontWeight: act ? 600 : 400, background: act ? gold15 : "transparent", color: act ? c.goldText : c.fg }}><I d={d} size={15} /> {l}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0 }}>
                    <span style={{ padding: "0 10px 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: c.mutedFg }}>Recent</span>
                    {THREADS.map(([title, when], i) => (
                      <span key={title} style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 8, padding: "8px 10px", fontSize: 13.5, background: i === 0 ? c.muted : "transparent" }}>
                        <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
                        <span style={{ fontSize: 11, color: c.mutedFg, flexShrink: 0 }}>{when}</span>
                      </span>
                    ))}
                  </div>
                  <div ref={reg("nextstep")} style={{ borderRadius: 12, border: `1px solid ${gold50}`, background: gold07, padding: 12, boxShadow: `0 0 0 ${env(T, 34.1, 37, 0.5) * 6}px rgba(184,138,74,0.12)` }}>
                    <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: c.goldText }}>My next faithful step</span>
                    <span style={{ display: "block", marginTop: 4, fontFamily: SERIF, fontSize: 14, lineHeight: 1.35 }}>Put the phone in the kitchen at 9pm. Tonight.</span>
                    <span style={{ marginTop: 10, height: 28, borderRadius: 6, background: c.gold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12, fontWeight: 600 }}><I d={P.check} size={13} /> I did this</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, borderRadius: 12, border: `1px solid ${c.border}`, background: c.card, padding: 12 }}>
                    <span style={{ height: 32, width: 32, borderRadius: 999, background: c.fg, color: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>JW</span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Jeremy</span>
                      <span style={{ display: "block", fontSize: 12, color: c.mutedFg }}>Free · Steward</span>
                    </span>
                  </div>
                </div>
              )}

              {/* main */}
              <div style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>
                {/* status row */}
                <div style={{ flex: "none", display: "flex", flexDirection: M ? "column" : "row", alignItems: M ? "stretch" : "center", justifyContent: "space-between", gap: M ? 10 : 16, padding: M ? "10px 16px" : "8px 28px", borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ position: "relative", height: 40, width: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={S_MARK} alt="Steward" style={{ height: 22, width: "auto", display: "block", transform: `scale(${1 + Math.sin(T * (orbMode === "thinking" ? 16 : orbMode === "speaking" ? 10 : 4)) * (0.02 + energy * 0.05)})` }} />
                      <ThreeCanvas kind="Orb" w={40} h={40} t={T} params={{ energy, mode: orbMode }} style={{ position: "absolute", inset: 0 }} />
                    </span>
                    <span>
                      <span style={{ display: "block", fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>Steward</span>
                      <span style={{ display: "block", fontSize: 12, color: c.mutedFg }}>{status}</span>
                    </span>
                  </div>
                  <div ref={reg("pills")} style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                    <Pill c={c} reg={reg} seam={seam} id="pill-listen" label="Listen First" active={mode === "listen"} onlyWhen={!!mode} />
                    <Pill c={c} reg={reg} seam={seam} id="pill-think" label="Help Me Think" active={mode === "think"} onlyWhen={!!mode} />
                    <Pill c={c} reg={reg} seam={seam} id="pill-step" label="Help Me Take a Step" active={mode === "step"} onlyWhen={!!mode} />
                    <span style={{ height: 24, padding: "0 10px", borderRadius: 999, border: `1px solid ${c.border}`, display: M ? "none" : "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", color: c.mutedFg }}>Blueprint context on</span>
                  </div>
                </div>

                {/* transcript + composer, framed together so the prompt never clips */}
                <div ref={reg("chat")} style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", padding: `${PAD}px ${PAD}px 8px` }}>
                    {/* welcome */}
                    <div style={{ position: "absolute", left: PAD, right: PAD, top: PAD, opacity: welcomeOp, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: M ? 12 : 16, padding: M ? "8px 0" : "24px 0", maxWidth: 760, margin: "0 auto", pointerEvents: "none" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: c.mutedFg }}>Steward</span>
                      <span style={{ fontSize: M ? 24 : 34, fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.02em" }}>Welcome. I&apos;m Steward, your personal guide for designing and living a life that matters.</span>
                      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: M ? 18 : 26, color: c.mutedFg }}>How would you like me to help right now?</span>
                      <div ref={reg("cards")} style={{ marginTop: 4, display: "grid", gridTemplateColumns: M ? "minmax(0,1fr)" : "repeat(3, minmax(0,1fr))", gap: 10, width: "100%" }}>
                        {MODES.map((m) => {
                          // The pointer is on its way to this card from 1.2s; the
                          // hover state is what makes the click read as a click.
                          const hov = m.key === "listen" && T > 1.2 && !mode;
                          return (
                            <div key={m.key} ref={reg(`card-${m.key}`)} style={{ borderRadius: 12, border: `1px solid ${hov ? c.gold : c.border}`, background: hov ? gold07 : c.card, padding: 14, transform: hov ? "translateY(-2px)" : "none" }}>
                              <span style={{ display: "block", fontSize: 13.5, fontWeight: 600 }}>{m.label}</span>
                              <span style={{ display: "block", marginTop: 4, fontSize: 12, lineHeight: 1.4, color: c.mutedFg }}>{m.blurb}</span>
                            </div>
                          );
                        })}
                      </div>
                      <span style={{ fontSize: 11.5, color: c.mutedFg }}>You can change this at any point.</span>
                    </div>

                    {/* messages, bottom-anchored so new ones push the rest up */}
                    <div style={{ position: "absolute", left: PAD, right: PAD, bottom: 8, top: PAD, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: M ? 18 : 24, maxWidth: 760, margin: "0 auto", opacity: mode ? 1 - seam : 0, WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 56px)", maskImage: "linear-gradient(to bottom, transparent 0, #000 56px)" }}>
                      {MSGS.map((m) => {
                        const e = MOTION.enter(T, m.at);
                        if (e === 0) return null;
                        const st: React.CSSProperties = { opacity: e, transform: `translateY(${(1 - e) * 22}px)` };

                        if (m.role === "member") {
                          return (
                            <div key={m.id} style={{ display: "flex", justifyContent: "flex-end", ...st }}>
                              <div style={{ maxWidth: M ? "88%" : "78%", borderRadius: "16px 16px 4px 16px", background: c.bubbleBg, color: c.bubbleFg, padding: "10px 16px", fontSize: 15, lineHeight: 1.6 }}>
                                {m.voice ? (
                                  <span style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.7 }}><I d={P.mic} size={12} /> Voice</span>
                                ) : null}
                                {m.text}
                              </div>
                            </div>
                          );
                        }

                        if (m.role === "proposal") {
                          // The commercial beat: propose, approve, written. The two
                          // states are stacked and cross-faded so the card does not
                          // change height when it flips.
                          const ap = MOTION.enter(T, m.approveAt, 0.4);
                          return (
                            <div key={m.id} ref={reg("proposal")} style={{ borderRadius: 16, border: `1px solid ${gold50}`, background: gold07, padding: 16, ...st }}>
                              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: c.goldText }}>Proposed for {m.label}</span>
                              <span style={{ display: "block", marginTop: 8, fontFamily: SERIF, fontSize: 17, lineHeight: 1.6 }}>&ldquo;{m.text}&rdquo;</span>
                              <div style={{ position: "relative", marginTop: 14, height: M ? 72 : 32 }}>
                                <div style={{ position: "absolute", inset: 0, display: "flex", flexWrap: "wrap", gap: 8, opacity: 1 - ap }}>
                                  <span ref={reg("approve")} style={{ height: 32, padding: "0 12px", borderRadius: 6, background: c.gold, color: "#fff", display: "inline-flex", alignItems: "center", fontSize: 13, fontWeight: 600, transform: `scale(${1 - clickP * 0.06 * (T > 33.4 ? 1 : 0)})` }}>Add this to my Blueprint</span>
                                  <span style={{ height: 32, padding: "0 12px", borderRadius: 6, border: `1px solid ${c.border}`, background: c.card, display: "inline-flex", alignItems: "center", fontSize: 13, fontWeight: 600 }}>Change the wording</span>
                                  <span style={{ height: 32, padding: "0 8px", display: "inline-flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: c.mutedFg }}>Not now</span>
                                </div>
                                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 8, opacity: ap, transform: `scale(${0.9 + MOTION.pop(ap) * 0.1})`, transformOrigin: "0 50%" }}>
                                  <span style={{ height: 24, padding: "0 10px", borderRadius: 999, background: c.gold, color: "#fff", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}><I d={P.check} size={12} sw={3} /> Added to your Blueprint</span>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: c.fg }}>See the page <I d={P.arrow} size={12} /></span>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        const txt = typed(m.text, T, m.at, m.end);
                        const done = T >= m.end;
                        return (
                          <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, ...st }}>
                            <Avatar c={c} t={T} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ display: "block", fontSize: 15, lineHeight: 1.6, minHeight: 24 }}>
                                {txt}
                                {!done ? <span style={{ display: "inline-block", marginLeft: 2, height: 14, width: 2, background: c.fg, verticalAlign: -2, opacity: Math.sin(T * 10) > 0 ? 1 : 0.2 }} /> : null}
                              </span>
                              <div style={{ marginTop: 8, display: "flex", gap: 4, color: c.mutedFg, opacity: done ? MOTION.enter(T, m.end, 0.3) : 0 }}>
                                <span style={{ height: 28, width: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><I d={P.copy} size={14} /></span>
                                <span style={{ height: 28, width: 28, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><I d={P.refresh} size={14} /></span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {thinking ? (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <Avatar c={c} t={T} pulse />
                          <span style={{ display: "flex", height: 42, alignItems: "center", gap: 6, borderRadius: 12, border: `1px solid ${c.border}`, background: c.card, padding: "0 14px" }}>
                            {[0, 1, 2].map((i) => (
                              <span key={i} style={{ height: 6, width: 6, borderRadius: 999, background: c.fg, opacity: 0.5, transform: `translateY(${-Math.max(0, Math.sin(T * 7 - i * 0.9)) * 5}px)` }} />
                            ))}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* composer */}
                  <div style={{ flex: "none", padding: M ? "8px 16px 16px" : "8px 28px 20px" }}>
                    <div style={{ maxWidth: 760, margin: "0 auto" }}>
                      <div ref={reg("composer")} style={{ borderRadius: 16, border: `1.5px solid ${recording || focused ? c.fg : c.border}`, background: c.card, transform: recording || focused ? "translateY(-2px)" : "none", boxShadow: recording || focused ? "0 10px 30px rgba(0,0,0,0.18)" : "0 1px 2px rgba(0,0,0,0.06)", overflow: "hidden" }}>
                        {recording ? (
                          <div style={{ display: "flex", minHeight: 52, alignItems: "center", gap: 14, padding: "6px 6px 6px 12px" }}>
                            <div style={{ flex: 1, minWidth: 0 }}><Eq c={c} t={T} e={env(T, RECORDING[0], RECORDING[1], 0.5)} /></div>
                            <span style={{ fontSize: 13, color: c.mutedFg, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>0:{String(Math.floor(T - RECORDING[0])).padStart(2, "0")}</span>
                            <IconBtn c={c} reg={reg} d={P.x} />
                            <IconBtn c={c} reg={reg} id="send-check" d={P.check} filled />
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "6px 6px 6px 14px" }}>
                            <span ref={reg("composer-text")} style={{ flex: 1, padding: "8px 0", minHeight: 40, fontSize: 15, lineHeight: 1.6, color: draft ? c.fg : c.mutedFg, display: "flex", alignItems: "center" }}>
                              {draft || (mode && seam < 0.5 ? "Ask Steward anything…" : "Choose an option above")}
                              {focused ? <span style={{ display: "inline-block", marginLeft: 1, height: 16, width: 1.5, background: c.fg, opacity: Math.sin(T * 10) > 0 ? 1 : 0 }} /> : null}
                            </span>
                            <IconBtn c={c} reg={reg} id="mic" d={P.mic} />
                            <IconBtn c={c} reg={reg} id="send" d={P.up} filled dim={!draft} />
                          </div>
                        )}
                      </div>
                      <span style={{ display: "block", marginTop: 10, padding: "0 4px", fontSize: 11.5, lineHeight: 1.5, color: c.mutedFg }}>
                        Steward is not a counsellor, doctor or crisis service. In the US you can call or text <strong style={{ color: c.fg }}>988</strong> for mental-health crisis support. <span style={{ textDecoration: "underline", textUnderlineOffset: 2 }}>How Steward handles what you share</span>
                      </span>
                      <div style={{ marginTop: 6, display: M ? "none" : "flex", justifyContent: "space-between", gap: 16, padding: "0 4px", fontSize: 11.5, color: c.mutedFg }}>
                        <span>Steward can make mistakes. Confirm anything that touches money or commitments.</span>
                        <span style={{ whiteSpace: "nowrap" }}>
                          <span style={{ border: `1px solid ${c.border}`, borderRadius: 3, padding: "0 4px" }}>⏎</span> send · <span style={{ border: `1px solid ${c.border}`, borderRadius: 3, padding: "0 4px" }}>⇧⏎</span> newline
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <span ref={reg("cursor-home")} style={{ position: "absolute", right: 180, bottom: 60, width: 1, height: 1 }} />
          </div>
        </div>
      </div>

      {/* The pointer lives in STAGE space, not app space, so it stays crisp
          through the camera's zoom instead of being scaled with the interface. */}
      <div style={{ position: "absolute", left: 0, top: 0, opacity: cursorOp, transform: `translate(${W / 2 + (cur.x - cam.x) * cam.s}px, ${H / 2 + (cur.y - cam.y) * cam.s}px)`, pointerEvents: "none" }}>
        {ring > 0 ? <span style={{ position: "absolute", left: -22, top: -22, width: 44, height: 44, borderRadius: 999, border: `2px solid ${c.gold}`, background: M ? "rgba(184,138,74,0.25)" : "transparent", opacity: 1 - ring, transform: `scale(${0.4 + ring * 1.1})` }} /> : null}
        <svg width="30" height="36" viewBox="0 0 24 28" style={{ display: M ? "none" : "block", transform: `scale(${1 - clickP * 0.18})`, transformOrigin: "2px 2px", filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.35))" }}>
          <path d="M3 2 L3 23 L8.5 17.8 L12.2 26 L15.8 24.4 L12.2 16.4 L19.5 16.4 Z" fill={c.fg} stroke={c.bg} strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

export default StewardScene;
