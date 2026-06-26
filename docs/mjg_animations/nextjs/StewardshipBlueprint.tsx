// @ts-nocheck — self-contained visual animation; remove this line to add full types.
/*
 * StewardshipBlueprint — MJG brand animation (self-contained React component)
 * ---------------------------------------------------------------------------
 * Drop-in for Next.js. A Next-ready copy with `'use client'`, `import React`,
 * and `export default` lives at  nextjs/StewardshipBlueprint.tsx.
 *
 * Client component. Renders a responsive 16:9 card; reads your shadcn theme
 * tokens (--background / --foreground / --muted-foreground / --border) and an
 * optional --gold accent. Usage:  <StewardshipBlueprint theme="dark" />
 *
 * Props:
 *   theme      'dark' (default) | 'light'
 *   autoPlay   boolean — start playing (default true)
 *   loop       boolean — loop the 20s timeline (default true)
 *   controls   boolean — show the scrub/play bar (default false)
 *   fonts      boolean — auto-inject Playfair Display + Manrope (default true)
 *   duration   number  — seconds (default 20)
 *   className / style — forwarded to the 16:9 card wrapper
 *
 * Theming: the dark palette resolves shadcn CSS variables when present
 *   --background, --foreground, --muted-foreground, --border, plus --gold.
 */

'use client';

import * as React from 'react';

const { useState, useRef, useEffect } = React;

// ── easing + tween helpers ───────────────────────────────────────────────────
const E = {
  outCubic:   (t) => (--t) * t * t + 1,
  inCubic:    (t) => t * t * t,
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  outBack:    (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  inOutSine:  (t) => -(Math.cos(Math.PI * t) - 1) / 2,
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function animate({ from = 0, to = 1, start = 0, end = 1, ease = E.inOutCubic }) {
  return (t) => { if (t <= start) return from; if (t >= end) return to; return from + (to - from) * ease((t - start) / (end - start)); };
}
// 0→1 envelope: ramp up [a,b], hold, ramp down [c,d]
function band(t, a, b, c, d) {
  if (t < a) return 0;
  if (t < b) return E.outCubic((t - a) / (b - a));
  if (t < c) return 1;
  if (t < d) return 1 - E.inCubic((t - c) / (d - c));
  return 0;
}
const ein = (t, a, b) => E.outCubic(clamp((t - a) / (b - a), 0, 1));
const llen = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS = "'Manrope', ui-sans-serif, system-ui, sans-serif";

// ── palettes ─────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: 'var(--background, #09090b)',
    fg: 'var(--foreground, #fafafa)',
    muted: 'var(--muted-foreground, #a1a1aa)',
    border: 'var(--border, #27272a)',
    divider: 'rgba(250,250,250,0.20)',
    gold: 'var(--gold, #CBA75E)',
    goldSoft: 'var(--gold, #BE9A53)',
    grid: 'rgba(255,255,255,0.05)',
    glow: 'radial-gradient(60% 55% at 50% 42%, rgba(203,167,94,0.12), transparent 70%)',
    vignette: 'inset 0 0 260px rgba(0,0,0,0.55)',
  },
  light: {
    bg: '#F7F4ED',
    fg: '#211C16',
    muted: '#8A8071',
    border: 'rgba(33,28,22,0.12)',
    divider: 'rgba(33,28,22,0.22)',
    gold: '#BF9B57',
    goldSoft: '#9B7B3C',
    grid: 'rgba(33,28,22,0.055)',
    glow: 'radial-gradient(60% 55% at 50% 42%, rgba(191,155,87,0.06), transparent 70%)',
    vignette: 'inset 0 0 220px rgba(33,28,22,0.05)',
  },
};

// ── shared primitives ────────────────────────────────────────────────────────
function GLine({ x1, y1, x2, y2, t, start, dur, color, w = 2, ease = E.inOutCubic, opacity = 1, cap = 'round' }) {
  const len = llen(x1, y1, x2, y2);
  const p = animate({ start, end: start + dur, ease })(t);
  if (p <= 0) return null;
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w}
    strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap={cap} opacity={opacity} />;
}
function Node({ cx, cy, t, at, c, r = 9 }) {
  const p = ein(t, at, at + 0.4);
  if (p <= 0) return null;
  return <circle cx={cx} cy={cy} r={r} fill={c.bg} stroke={c.gold} strokeWidth={3}
    opacity={p} transform={`scale(${0.4 + 0.6 * E.outBack(p)})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />;
}
function Caption({ t, text, a, b, cc, d, c }) {
  const op = band(t, a, b, cc, d);
  if (op <= 0) return null;
  const rise = (1 - ein(t, a, b)) * 12;
  return (
    <div style={{
      position: 'absolute', left: 0, top: 966, width: '100%', textAlign: 'center',
      transform: `translateY(${rise}px)`, fontFamily: SANS, fontSize: 29, fontWeight: 500,
      color: c.muted, opacity: op, letterSpacing: '0.005em', lineHeight: 1.4,
    }}>{text}</div>
  );
}
function Lockup({ t, start, c, cx = 960, cy = 380, size = 80, exitA = 9990, exitB = 9990 }) {
  const op = band(t, start, start + 0.6, exitA, exitB);
  if (op <= 0) return null;
  const s = 0.9 + 0.1 * E.outCubic(clamp((t - start) / 0.7, 0, 1));
  const sweep = clamp((t - (start + 0.45)) / 1.0, 0, 1);
  const cw = size * 9.2, ch = size * 2.1;
  return (
    <div style={{
      position: 'absolute', left: cx, top: cy, width: cw, height: ch,
      transform: `translate(-50%,-50%) scale(${s})`, opacity: op,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size * 0.34, overflow: 'hidden',
    }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: size, color: c.fg, letterSpacing: '-0.04em', lineHeight: 1 }}>MJG</div>
      <div style={{ width: 2, height: size * 0.82, background: c.divider }} />
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: size * 0.52, color: c.fg, whiteSpace: 'nowrap' }}>Michael&nbsp;J.&nbsp;Gauthier</div>
      {sweep > 0 && sweep < 1 && (
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: cw * 0.28, left: `${-30 + sweep * 130}%`,
          background: 'linear-gradient(105deg, transparent, rgba(255,248,233,0.0) 30%, rgba(255,248,233,0.85) 50%, rgba(255,248,233,0.0) 70%, transparent)',
          transform: 'skewX(-14deg)', mixBlendMode: 'overlay', pointerEvents: 'none',
        }} />
      )}
    </div>
  );
}

// ── scenes (plain functions of time + theme) ─────────────────────────────────
function Grid(t, c) {
  const op = animate({ start: 0.1, end: 1.8, ease: E.outCubic })(t) * animate({ from: 1, to: 0.55, start: 16.8, end: 18.4 })(t);
  const vx = [], hy = [];
  for (let x = 80; x < 1920; x += 80) vx.push(x);
  for (let y = 80; y < 1080; y += 80) hy.push(y);
  return (
    <svg key="grid" width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {vx.map((x, i) => <line key={'v' + i} x1={x} y1={0} x2={x} y2={1080} stroke={c.grid} strokeWidth={1} opacity={op} />)}
      {hy.map((y, i) => <line key={'h' + i} x1={0} y1={y} x2={1920} y2={y} stroke={c.grid} strokeWidth={1} opacity={op} />)}
    </svg>
  );
}

function Scene1(t, c) {
  if (t > 4.3) return null;
  const headOp = band(t, 0.7, 1.5, 3.2, 4.0);
  const headRise = (1 - ein(t, 0.7, 1.5)) * 26;
  const ulLen = 360, ulP = animate({ start: 1.4, end: 2.3 })(t), ulOp = band(t, 1.4, 1.7, 3.2, 4.0);
  const inset = 116, fx2 = 1920 - inset, fy2 = 1080 - inset, perim = 2 * ((fx2 - inset) + (fy2 - inset));
  const fp = animate({ start: 0.3, end: 2.2 })(t), frameOp = band(t, 0.3, 0.9, 3.3, 4.1) * 0.9;
  return (
    <React.Fragment key="s1">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={inset} y={inset} width={fx2 - inset} height={fy2 - inset} fill="none" stroke={c.gold} strokeWidth={1.5}
          strokeDasharray={perim} strokeDashoffset={perim * (1 - fp)} opacity={frameOp} />
        {[[inset, inset, 1, 1], [fx2, inset, -1, 1], [inset, fy2, 1, -1], [fx2, fy2, -1, -1]].map(([x, y, sx, sy], i) => (
          <g key={i} opacity={band(t, 1.7, 2.1, 3.3, 4.1)}>
            <line x1={x} y1={y} x2={x + sx * 26} y2={y} stroke={c.goldSoft} strokeWidth={1.5} />
            <line x1={x} y1={y} x2={x} y2={y + sy * 26} stroke={c.goldSoft} strokeWidth={1.5} />
          </g>
        ))}
        <line x1={960 - ulLen / 2} y1={636} x2={960 + ulLen / 2} y2={636} stroke={c.gold} strokeWidth={2.5}
          strokeDasharray={ulLen} strokeDashoffset={ulLen * (1 - ulP)} opacity={ulOp} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: 0, top: 352, width: '100%', textAlign: 'center', transform: `translateY(${headRise}px)`, opacity: headOp, fontFamily: SERIF, color: c.fg, lineHeight: 1.16 }}>
        <div style={{ fontSize: 104, fontWeight: 600 }}>You Were Created</div>
        <div style={{ fontSize: 104, fontWeight: 600 }}>for <span style={{ fontStyle: 'italic', color: c.gold }}>More</span></div>
      </div>
      <Caption t={t} c={c} text="What if your life was meant to be designed with purpose?" a={0.9} b={1.6} cc={3.2} d={3.9} />
    </React.Fragment>
  );
}

function Scene2(t, c) {
  if (t < 3.3 || t > 6.4) return null;
  const h1 = band(t, 4.0, 4.7, 5.6, 6.2), h1r = (1 - ein(t, 4.0, 4.7)) * 24, gOp = band(t, 3.8, 4.3, 5.6, 6.2) * 0.5;
  return (
    <React.Fragment key="s2">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <GLine x1={150} y1={606} x2={470} y2={606} t={t} start={3.9} dur={1.2} color={c.gold} w={1.5} opacity={gOp} />
        <GLine x1={1770} y1={606} x2={1450} y2={606} t={t} start={3.9} dur={1.2} color={c.gold} w={1.5} opacity={gOp} />
      </svg>
      <Lockup t={t} c={c} start={3.5} cx={960} cy={328} size={68} exitA={5.7} exitB={6.3} />
      <div style={{ position: 'absolute', left: 0, top: 452, width: '100%', textAlign: 'center', transform: `translateY(${h1r}px)`, opacity: h1, fontFamily: SERIF, color: c.fg, lineHeight: 1.08 }}>
        <div style={{ fontSize: 90, fontWeight: 600, letterSpacing: '-0.01em' }}>The Stewardship</div>
        <div style={{ fontSize: 124, fontWeight: 600, fontStyle: 'italic', color: c.gold, marginTop: 14 }}>Blueprint</div>
      </div>
      <Caption t={t} c={c} text="The Stewardship Blueprint connects what you believe with how you live." a={4.0} b={4.6} cc={5.6} d={6.1} />
    </React.Fragment>
  );
}

function Scene3(t, c) {
  if (t < 6.0 || t > 12.5) return null;
  const baseY = 812, top = 432, w = 158, h = baseY - top;
  const cols = [
    { cx: 600, start: 6.3, num: 'I', word: 'Faith' },
    { cx: 960, start: 7.6, num: 'II', word: 'Family' },
    { cx: 1320, start: 8.9, num: 'III', word: 'Finance' },
  ];
  const gLen = 980, gx = 960 - gLen / 2, groundP = animate({ start: 6.0, end: 6.9 })(t), groundOp = band(t, 6.0, 6.4, 11.7, 12.3);
  return (
    <React.Fragment key="s3">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={gx} y1={baseY} x2={gx + gLen} y2={baseY} stroke={c.gold} strokeWidth={2.5} strokeDasharray={gLen} strokeDashoffset={gLen * (1 - groundP)} opacity={groundOp} strokeLinecap="round" />
        {cols.map((col, i) => {
          const dur = 1.05, colLen = w + 2 * h;
          const p = animate({ start: col.start, end: col.start + dur })(t);
          const op = band(t, col.start, col.start + 0.25, 11.7, 12.3);
          const fillOp = animate({ from: 0, to: 0.10, start: col.start + dur * 0.55, end: col.start + dur + 0.4 })(t) * band(t, col.start, col.start + 0.5, 11.7, 12.3);
          const d = `M ${col.cx - w / 2} ${baseY} L ${col.cx - w / 2} ${top} L ${col.cx + w / 2} ${top} L ${col.cx + w / 2} ${baseY}`;
          const capP = ein(t, col.start + dur - 0.15, col.start + dur + 0.3);
          return (
            <g key={i}>
              <rect x={col.cx - w / 2} y={top} width={w} height={h} fill={c.gold} opacity={fillOp} />
              <path d={d} fill="none" stroke={c.gold} strokeWidth={2.5} strokeDasharray={colLen} strokeDashoffset={colLen * (1 - p)} opacity={op} strokeLinecap="round" strokeLinejoin="round" />
              <line x1={col.cx - w / 2 - 16} y1={top} x2={col.cx + w / 2 + 16} y2={top} stroke={c.gold} strokeWidth={3} opacity={op * capP} strokeLinecap="round" />
              <line x1={col.cx - w / 2 - 22} y1={baseY} x2={col.cx + w / 2 + 22} y2={baseY} stroke={c.gold} strokeWidth={3} opacity={op * capP} strokeLinecap="round" />
            </g>
          );
        })}
      </svg>
      {cols.map((col, i) => {
        const dur = 1.05;
        const lblOp = band(t, col.start + dur - 0.1, col.start + dur + 0.4, 11.7, 12.3);
        const numOp = band(t, col.start + 0.2, col.start + 0.7, 11.7, 12.3);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: col.cx, top: 372, transform: 'translateX(-50%)', fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: c.goldSoft, opacity: numOp, letterSpacing: '0.04em' }}>{col.num}</div>
            <div style={{ position: 'absolute', left: col.cx, top: 838, transform: `translateX(-50%) translateY(${(1 - ein(t, col.start + dur - 0.1, col.start + dur + 0.4)) * 12}px)`, fontFamily: SERIF, fontWeight: 600, fontSize: 58, color: c.fg, opacity: lblOp, whiteSpace: 'nowrap' }}>{col.word}</div>
          </React.Fragment>
        );
      })}
      <Caption t={t} c={c} text="Faith is the foundation." a={6.4} b={7.0} cc={7.6} d={7.9} />
      <Caption t={t} c={c} text="Family is the calling." a={7.9} b={8.4} cc={8.9} d={9.2} />
      <Caption t={t} c={c} text="Finance is a tool for stewardship." a={9.3} b={9.9} cc={11.4} d={11.9} />
    </React.Fragment>
  );
}

function Scene4(t, c) {
  if (t < 12.0 || t > 17.3) return null;
  const z = animate({ from: 1, to: 1.07, start: 12.0, end: 17.2, ease: E.inOutSine })(t);
  const sceneOp = band(t, 12.2, 12.9, 16.6, 17.2);
  const pillars = [{ cx: 360 }, { cx: 470 }, { cx: 580 }];
  const baseY = 720;
  const milestones = [
    { x: 920, y: 700, label: 'Purpose', at: 13.4 },
    { x: 1240, y: 580, label: 'Future', at: 14.2 },
    { x: 1560, y: 452, label: 'Legacy', at: 15.0 },
  ];
  const pts = [{ x: 580, y: baseY }, ...milestones.map(m => ({ x: m.x, y: m.y }))];
  let pathLen = 0; for (let i = 0; i < pts.length - 1; i++) pathLen += llen(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
  const pathP = animate({ start: 12.6, end: 15.4 })(t);
  const pd = `M ${pts.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const baseLineLen = 220, baseP = animate({ start: 12.4, end: 13.0 })(t);
  return (
    <div key="s4" style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '58% 56%', opacity: sceneOp }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {pillars.map((p, i) => <rect key={i} x={p.cx - 26} y={baseY - 150} width={52} height={150} fill="none" stroke={c.gold} strokeWidth={2} opacity={band(t, 12.2, 12.6, 16.6, 17.2) * 0.85} />)}
        <line x1={360} y1={baseY} x2={580} y2={baseY} stroke={c.gold} strokeWidth={2.5} strokeDasharray={baseLineLen} strokeDashoffset={baseLineLen * (1 - baseP)} strokeLinecap="round" />
        <path d={pd} fill="none" stroke={c.gold} strokeWidth={3} strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - pathP)} strokeLinecap="round" strokeLinejoin="round" />
        <line x1={1560} y1={452} x2={1740} y2={380} stroke={c.gold} strokeWidth={2} strokeDasharray="2 10" opacity={band(t, 15.2, 15.6, 16.6, 17.2) * 0.7} strokeLinecap="round" />
        {milestones.map((m, i) => <Node key={i} cx={m.x} cy={m.y} t={t} at={m.at} c={c} r={10} />)}
      </svg>
      {milestones.map((m, i) => {
        const op = band(t, m.at + 0.1, m.at + 0.5, 16.6, 17.2);
        return <div key={i} style={{ position: 'absolute', left: m.x, top: m.y - 64, transform: `translateX(-50%) translateY(${(1 - ein(t, m.at + 0.1, m.at + 0.5)) * 10}px)`, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 50, color: c.fg, opacity: op, whiteSpace: 'nowrap' }}>{m.label}</div>;
      })}
      <div style={{ position: 'absolute', left: 470, top: baseY + 34, transform: 'translateX(-50%)', fontFamily: SANS, fontSize: 24, fontWeight: 700, letterSpacing: '0.2em', color: c.goldSoft, whiteSpace: 'nowrap', opacity: band(t, 12.8, 13.3, 16.6, 17.2) }}>FAITH&nbsp;·&nbsp;FAMILY&nbsp;·&nbsp;FINANCE</div>
      <Caption t={t} c={c} text="When these areas align, your resources can support what matters most." a={13.0} b={13.7} cc={16.4} d={16.9} />
    </div>
  );
}

function Scene5(t, c) {
  if (t < 17.0) return null;
  const lineP = animate({ start: 18.0, end: 18.8 })(t), accLen = 240, accOp = band(t, 18.0, 18.3, 9990, 9990);
  const h1 = band(t, 18.0, 18.7, 9990, 9990), h1r = (1 - ein(t, 18.0, 18.7)) * 22, lblOp = band(t, 18.6, 19.2, 9990, 9990);
  return (
    <React.Fragment key="s5">
      <Lockup t={t} c={c} start={17.3} cx={960} cy={392} size={86} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={960 - accLen / 2} y1={500} x2={960 + accLen / 2} y2={500} stroke={c.gold} strokeWidth={2.5} strokeDasharray={accLen} strokeDashoffset={accLen * (1 - lineP)} opacity={accOp} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: 0, top: 548, width: '100%', textAlign: 'center', transform: `translateY(${h1r}px)`, opacity: h1, fontFamily: SERIF, fontWeight: 600, fontSize: 78, color: c.fg, lineHeight: 1.05, whiteSpace: 'nowrap' }}>Begin Your Stewardship <span style={{ fontStyle: 'italic', color: c.gold }}>Journey</span></div>
      <div style={{ position: 'absolute', left: 0, top: 680, width: '100%', textAlign: 'center', opacity: lblOp, fontFamily: SANS, fontSize: 27, fontWeight: 700, letterSpacing: '0.34em', color: c.goldSoft }}>FAITH&nbsp;&nbsp;·&nbsp;&nbsp;FAMILY&nbsp;&nbsp;·&nbsp;&nbsp;FINANCE&nbsp;&nbsp;·&nbsp;&nbsp;FUTURE</div>
    </React.Fragment>
  );
}

// ── control bar (shadcn-flavored, optional) ──────────────────────────────────
function Controls({ time, duration, playing, onToggle, onSeek, c }) {
  const ref = useRef(null);
  const seek = (e) => { const r = ref.current.getBoundingClientRect(); onSeek(clamp((e.clientX - r.left) / r.width, 0, 1) * duration); };
  return (
    <div style={{ position: 'absolute', left: 12, right: 12, bottom: 12, display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', borderRadius: 8, background: 'color-mix(in oklab, var(--background, #09090b) 78%, transparent)', backdropFilter: 'blur(8px)', border: `1px solid ${c.border}`, fontFamily: SANS }}>
      <button onClick={onToggle} aria-label={playing ? 'Pause' : 'Play'} style={{ width: 30, height: 30, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: 'transparent', border: `1px solid ${c.border}`, color: c.fg, cursor: 'pointer', padding: 0 }}>
        {playing
          ? <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="1.5" width="3" height="9" fill="currentColor" /><rect x="7" y="1.5" width="3" height="9" fill="currentColor" /></svg>
          : <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2.5 1.5l8 4.5-8 4.5z" fill="currentColor" /></svg>}
      </button>
      <div ref={ref} onClick={seek} style={{ flex: 1, height: 20, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
        <div style={{ position: 'relative', width: '100%', height: 4, borderRadius: 2, background: c.border }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: `${(time / duration) * 100}%`, borderRadius: 2, background: c.gold }} />
        </div>
      </div>
      <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: c.muted, width: 78, textAlign: 'right' }}>{time.toFixed(1)} / {duration.toFixed(0)}s</span>
    </div>
  );
}

// ── component ────────────────────────────────────────────────────────────────
function StewardshipBlueprint(props) {
  const {
    theme = 'dark', autoPlay = true, loop = true, controls = false,
    fonts = true, duration = 20, className, style,
  } = props || {};
  const showControls = controls === true || controls === 'true';
  const useAutoplay = !(autoPlay === false || autoPlay === 'false');
  const useLoop = !(loop === false || loop === 'false');
  const c = THEMES[theme] || THEMES.dark;

  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(useAutoplay);

  useEffect(() => {
    if (!fonts || typeof document === 'undefined') return;
    const id = 'mjg-blueprint-fonts';
    if (document.getElementById(id)) return;
    const l = document.createElement('link');
    l.id = id; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600;1,700&family=Manrope:wght@500;600;700;800&display=swap';
    document.head.appendChild(l);
  }, [fonts]);

  useEffect(() => {
    if (!playing) return;
    let raf, last = null;
    const step = (ts) => {
      if (last == null) last = ts;
      const dt = (ts - last) / 1000; last = ts;
      setTime((t) => { let n = t + dt; if (n >= duration) { if (useLoop) n = n % duration; else { n = duration; setPlaying(false); } } return n; });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, useLoop, duration]);

  return (
    <div className={className} style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 12, border: `1px solid ${c.border}`, background: c.bg, containerType: 'size', ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: c.glow, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 1920, height: 1080, transformOrigin: 'top left', transform: 'scale(calc(100cqw / 1920px))' }}>
        {Grid(time, c)}
        {Scene1(time, c)}
        {Scene2(time, c)}
        {Scene3(time, c)}
        {Scene4(time, c)}
        {Scene5(time, c)}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: c.vignette }} />
      </div>
      {showControls && (
        <Controls time={time} duration={duration} playing={playing} c={c}
          onToggle={() => setPlaying(p => !p)} onSeek={(v) => setTime(v)} />
      )}
    </div>
  );
}

export default StewardshipBlueprint;
export { StewardshipBlueprint };
