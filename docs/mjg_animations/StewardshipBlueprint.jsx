/*
 * StewardshipBlueprint — MJG brand animation (self-contained React component)
 * ---------------------------------------------------------------------------
 * Drop-in for Next.js. A Next-ready copy with `'use client'`, `import React`,
 * and `export default` lives at  nextjs/StewardshipBlueprint.tsx.
 *
 * This file targets the in-tool DC preview: it reads the global `React`
 * provided by the runtime and registers itself on `window`.
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
function ptAlong(pts, frac) {
  let total = 0; const segs = [];
  for (let i = 0; i < pts.length - 1; i++) { const l = llen(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); segs.push(l); total += l; }
  let d = clamp(frac, 0, 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) { const u = segs[i] ? d / segs[i] : 0; return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * u, y: pts[i].y + (pts[i + 1].y - pts[i].y) * u }; }
    d -= segs[i];
  }
  return pts[pts.length - 1];
}
// deterministic drifting motes
const MOTES = Array.from({ length: 28 }, (_, i) => {
  const r = (s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1) * 1920, y: r(2) * 1080, sz: 1.1 + r(3) * 2.4, sp: 8 + r(4) * 26, ph: r(5) * Math.PI * 2, drift: (r(6) - 0.5) * 60 };
});

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
    goldGlow: 'rgba(203,167,94,0.20)',
    goldBurst: 'rgba(212,175,100,0.32)',
    logo: './mjg-logo-white.svg',
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
    goldGlow: 'rgba(191,155,87,0.16)',
    goldBurst: 'rgba(191,155,87,0.24)',
    logo: './mjg-logo-black.svg',
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
  const ping = clamp((t - at) / 0.9, 0, 1);
  return (
    <g>
      {ping > 0.001 && ping < 1 && (
        <circle cx={cx} cy={cy} r={r + ping * 36} fill="none" stroke={c.gold} strokeWidth={2} opacity={(1 - ping) * 0.6} />
      )}
      <circle cx={cx} cy={cy} r={r} fill={c.bg} stroke={c.gold} strokeWidth={3}
        opacity={p} transform={`scale(${0.4 + 0.6 * E.outBack(p)})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
    </g>
  );
}
function Motes(t, c) {
  const glob = animate({ start: 0.5, end: 2.4 })(t) * animate({ from: 1, to: 0.7, start: 17, end: 19 })(t);
  return (
    <svg key="motes" width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {MOTES.map((m, i) => {
        const y = (((m.y - t * m.sp) % 1120) + 1120) % 1120 - 20;
        const x = m.x + Math.sin(t * 0.35 + m.ph) * m.drift;
        const tw = 0.22 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.25 + m.ph));
        return <circle key={i} cx={x} cy={y} r={m.sz} fill={c.gold} opacity={tw * 0.5 * glob} />;
      })}
    </svg>
  );
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
  const cw = size * 7.6, ch = size * 3.4;
  const ruleP = ein(t, start + 0.3, start + 0.9);
  return (
    <div style={{
      position: 'absolute', left: cx, top: cy, width: cw, height: ch,
      transform: `translate(-50%,-50%) scale(${s})`, opacity: op,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.24,
    }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: cw * 0.72, height: ch * 0.92, transform: 'translate(-50%,-50%)', background: `radial-gradient(closest-side, ${c.goldGlow}, transparent 72%)`, opacity: ein(t, start, start + 0.7) * (0.55 + 0.45 * Math.sin((t - start) * 1.7)), pointerEvents: 'none' }} />
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src={c.logo} alt="MJG" style={{ height: size * 1.32, width: 'auto', display: 'block' }} />
        {sweep > 0 && sweep < 1 && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: '36%', left: `${-30 + sweep * 130}%`,
            background: 'linear-gradient(105deg, transparent, rgba(255,248,233,0.0) 30%, rgba(255,248,233,0.85) 50%, rgba(255,248,233,0.0) 70%, transparent)',
            transform: 'skewX(-14deg)', mixBlendMode: 'overlay', pointerEvents: 'none',
          }} />
        )}
      </div>
      <div style={{ width: size * 2.4 * ruleP, height: 2, background: c.divider }} />
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: size * 0.5, color: c.fg, whiteSpace: 'nowrap', letterSpacing: '0.01em' }}>Michael&nbsp;J.&nbsp;Gauthier</div>
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
  const ulLen = 360, ulP = animate({ start: 1.4, end: 2.3 })(t), ulOp = band(t, 1.6, 1.9, 2.45, 2.8);
  const typed = 'You Were Created for';
  const tyP = clamp((t - 0.8) / 1.45, 0, 1);
  const shown = typed.slice(0, Math.round(tyP * typed.length));
  const caretOn = t < 2.5 && (Math.floor((t - 0.8) * 3) % 2 === 0);
  const typeOp = band(t, 0.8, 1.0, 2.45, 2.8);
  const typeRise = (1 - ein(t, 0.7, 1.1)) * 10;
  const moreOp = band(t, 2.7, 3.1, 3.5, 4.0);
  const moreS = 0.7 + 0.3 * E.outBack(clamp((t - 2.7) / 0.7, 0, 1));
  const inset = 116, fx2 = 1920 - inset, fy2 = 1080 - inset, perim = 2 * ((fx2 - inset) + (fy2 - inset));
  const fp = animate({ start: 0.3, end: 2.2 })(t), frameOp = band(t, 0.3, 0.9, 3.3, 4.1) * 0.9;
  const fw = fx2 - inset, fh = fy2 - inset, pen = fp * perim;
  let penX = inset, penY = inset;
  if (pen <= fw) { penX = inset + pen; penY = inset; }
  else if (pen <= fw + fh) { penX = fx2; penY = inset + (pen - fw); }
  else if (pen <= 2 * fw + fh) { penX = fx2 - (pen - fw - fh); penY = fy2; }
  else { penX = inset; penY = fy2 - (pen - 2 * fw - fh); }
  const penOn = fp > 0.01 && fp < 0.992;
  return (
    <React.Fragment key="s1">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={inset} y={inset} width={fx2 - inset} height={fy2 - inset} fill="none" stroke={c.gold} strokeWidth={1.5}
          strokeDasharray={perim} strokeDashoffset={perim * (1 - fp)} opacity={frameOp} />
        {penOn && (
          <g opacity={frameOp}>
            <circle cx={penX} cy={penY} r={14} fill="none" stroke={c.gold} strokeWidth={1.5} opacity={0.5} />
            <circle cx={penX} cy={penY} r={6} fill={c.gold} />
          </g>
        )}
        {[[inset, inset, 1, 1], [fx2, inset, -1, 1], [inset, fy2, 1, -1], [fx2, fy2, -1, -1]].map(([x, y, sx, sy], i) => (
          <g key={i} opacity={band(t, 1.7, 2.1, 3.3, 4.1)}>
            <line x1={x} y1={y} x2={x + sx * 26} y2={y} stroke={c.goldSoft} strokeWidth={1.5} />
            <line x1={x} y1={y} x2={x} y2={y + sy * 26} stroke={c.goldSoft} strokeWidth={1.5} />
          </g>
        ))}
        <line x1={960 - ulLen / 2} y1={636} x2={960 + ulLen / 2} y2={636} stroke={c.gold} strokeWidth={2.5}
          strokeDasharray={ulLen} strokeDashoffset={ulLen * (1 - ulP)} opacity={ulOp} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${typeRise}px)`, opacity: typeOp }}>
        <div style={{ fontFamily: SERIF, color: c.fg, fontSize: 104, fontWeight: 600, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{shown}<span style={{ opacity: caretOn ? 1 : 0, color: c.gold, fontWeight: 400 }}>|</span></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: moreOp, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: `${500 + 1000 * ein(t, 2.7, 3.5)}px`, height: `${500 + 1000 * ein(t, 2.7, 3.5)}px`, borderRadius: '50%', background: `radial-gradient(closest-side, ${c.goldBurst}, transparent 70%)`, filter: 'blur(10px)', opacity: ein(t, 2.7, 3.4) }} />
        <div style={{ position: 'relative', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 300, color: c.gold, lineHeight: 1, transform: `scale(${moreS})`, letterSpacing: '0.06em', textShadow: `0 0 36px ${c.goldBurst}` }}>MORE</div>
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
  const baseY = 812, top = 472, bot = 778, shaftLen = bot - top, sh = 56;
  const cols = [
    { cx: 600, start: 6.3, num: 'I', word: 'Faith' },
    { cx: 960, start: 7.6, num: 'II', word: 'Family' },
    { cx: 1320, start: 8.9, num: 'III', word: 'Finance' },
  ];
  const gLen = 1020, gx = 960 - gLen / 2, groundP = animate({ start: 6.0, end: 6.9 })(t), groundOp = band(t, 6.0, 6.4, 11.7, 12.3);
  const flutes = [-0.55, 0, 0.55];
  return (
    <React.Fragment key="s3">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={gx} y1={baseY} x2={gx + gLen} y2={baseY} stroke={c.gold} strokeWidth={2.5} strokeDasharray={gLen} strokeDashoffset={gLen * (1 - groundP)} opacity={groundOp} strokeLinecap="round" />
        {cols.map((col, i) => {
          const s0 = col.start;
          const op = band(t, s0, s0 + 0.25, 11.7, 12.3);
          const shaftP = animate({ start: s0, end: s0 + 0.75 })(t);
          const capS = ein(t, s0 + 0.5, s0 + 0.95);
          const baseS = ein(t, s0 + 0.45, s0 + 0.9);
          const fluteP = animate({ start: s0 + 0.7, end: s0 + 1.15 })(t);
          const rise = animate({ start: s0 + 0.2, end: s0 + 1.3 })(t);
          const fill = animate({ from: 0, to: 0.08, start: s0 + 0.6, end: s0 + 1.1 })(t) * op;
          return (
            <g key={i} opacity={op}>
              <rect x={col.cx - sh} y={top} width={sh * 2} height={shaftLen} fill={c.gold} opacity={fill} />
              {rise > 0.02 && rise < 0.99 && (
                <rect x={col.cx - sh} y={top + shaftLen * (1 - rise) - 34} width={sh * 2} height={68} fill={c.gold} opacity={0.16} />
              )}
              <line x1={col.cx - sh} y1={bot} x2={col.cx - sh} y2={top} stroke={c.gold} strokeWidth={2.5} strokeDasharray={shaftLen} strokeDashoffset={shaftLen * (1 - shaftP)} strokeLinecap="round" />
              <line x1={col.cx + sh} y1={bot} x2={col.cx + sh} y2={top} stroke={c.gold} strokeWidth={2.5} strokeDasharray={shaftLen} strokeDashoffset={shaftLen * (1 - shaftP)} strokeLinecap="round" />
              {flutes.map((f, k) => <line key={k} x1={col.cx + f * sh} y1={top + 10} x2={col.cx + f * sh} y2={bot - 10} stroke={c.gold} strokeWidth={1} opacity={0.38 * fluteP} />)}
              <g opacity={capS} style={{ transformOrigin: `${col.cx}px ${top}px`, transform: `scale(${0.6 + 0.4 * capS})` }}>
                <line x1={col.cx - 70} y1={top} x2={col.cx + 70} y2={top} stroke={c.gold} strokeWidth={2.5} strokeLinecap="round" />
                <line x1={col.cx - 86} y1={top - 14} x2={col.cx - 70} y2={top} stroke={c.gold} strokeWidth={2} strokeLinecap="round" />
                <line x1={col.cx + 86} y1={top - 14} x2={col.cx + 70} y2={top} stroke={c.gold} strokeWidth={2} strokeLinecap="round" />
                <rect x={col.cx - 90} y={top - 30} width={180} height={16} fill="none" stroke={c.gold} strokeWidth={2.5} />
              </g>
              <g opacity={baseS} style={{ transformOrigin: `${col.cx}px ${bot}px`, transform: `scale(${0.6 + 0.4 * baseS})` }}>
                <line x1={col.cx - 72} y1={bot} x2={col.cx + 72} y2={bot} stroke={c.gold} strokeWidth={2.5} strokeLinecap="round" />
                <line x1={col.cx - 90} y1={bot + 14} x2={col.cx - 72} y2={bot} stroke={c.gold} strokeWidth={2} strokeLinecap="round" />
                <line x1={col.cx + 90} y1={bot + 14} x2={col.cx + 72} y2={bot} stroke={c.gold} strokeWidth={2} strokeLinecap="round" />
                <rect x={col.cx - 96} y={bot + 14} width={192} height={18} fill="none" stroke={c.gold} strokeWidth={2.5} />
              </g>
            </g>
          );
        })}
      </svg>
      {cols.map((col, i) => {
        const s0 = col.start;
        const wordOp = band(t, s0 + 1.0, s0 + 1.4, 11.7, 12.3);
        const wordRise = (1 - ein(t, s0 + 1.0, s0 + 1.4)) * 12;
        const medP = ein(t, s0 + 0.85, s0 + 1.25);
        const medOp = band(t, s0 + 0.85, s0 + 1.2, 11.7, 12.3);
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: col.cx, top: 346, transform: `translate(-50%, calc(-50% + ${(1 - medP) * 74}px)) scale(${0.6 + 0.4 * E.outBack(medP)})`, width: 86, height: 86, borderRadius: '50%', border: `1.5px solid ${c.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: medOp, boxShadow: `0 0 26px ${c.goldGlow}`, background: c.bg }}>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 40, color: c.gold, letterSpacing: '0.02em' }}>{col.num}</span>
            </div>
            <div style={{ position: 'absolute', left: col.cx, top: 858, transform: `translateX(-50%) translateY(${wordRise}px)`, fontFamily: SERIF, fontWeight: 600, fontSize: 56, color: c.fg, opacity: wordOp, whiteSpace: 'nowrap' }}>{col.word}</div>
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
  const baseY = 800;
  const milestones = [
    { x: 880, y: 648, label: 'Purpose', at: 13.4 },
    { x: 1180, y: 484, label: 'Future', at: 14.2 },
    { x: 1480, y: 312, label: 'Legacy', at: 15.0 },
  ];
  const pts = [{ x: 600, y: baseY }, ...milestones.map(m => ({ x: m.x, y: m.y }))];
  let pathLen = 0; for (let i = 0; i < pts.length - 1; i++) pathLen += llen(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y);
  const pathP = animate({ start: 12.6, end: 15.4 })(t);
  const pd = `M ${pts.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const baseLineLen = 240, baseP = animate({ start: 12.4, end: 13.0 })(t);
  return (
    <div key="s4" style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '54% 54%', opacity: sceneOp }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {pillars.map((p, i) => <rect key={i} x={p.cx - 26} y={baseY - 150} width={52} height={150} fill="none" stroke={c.gold} strokeWidth={2} opacity={band(t, 12.2, 12.6, 16.6, 17.2) * 0.85} />)}
        <line x1={360} y1={baseY} x2={600} y2={baseY} stroke={c.gold} strokeWidth={2.5} strokeDasharray={baseLineLen} strokeDashoffset={baseLineLen * (1 - baseP)} strokeLinecap="round" />
        <path d={pd} fill="none" stroke={c.gold} strokeWidth={3} strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - pathP)} strokeLinecap="round" strokeLinejoin="round" />
        {pathP > 0.02 && pathP < 0.99 && (() => { const tip = ptAlong(pts, pathP); return <g key="tip"><circle cx={tip.x} cy={tip.y} r={13} fill="none" stroke={c.gold} strokeWidth={1.5} opacity={0.5} /><circle cx={tip.x} cy={tip.y} r={6} fill={c.gold} /></g>; })()}
        <line x1={1480} y1={312} x2={1680} y2={208} stroke={c.gold} strokeWidth={2} strokeDasharray="2 10" opacity={band(t, 15.2, 15.6, 16.6, 17.2) * 0.7} strokeLinecap="round" />
        {milestones.map((m, i) => <Node key={i} cx={m.x} cy={m.y} t={t} at={m.at} c={c} r={10} />)}
      </svg>
      {milestones.map((m, i) => {
        const op = band(t, m.at + 0.1, m.at + 0.5, 16.6, 17.2);
        const rp = ein(t, m.at + 0.05, m.at + 0.6);
        return (
          <div key={i} style={{ position: 'absolute', left: m.x + 30, top: m.y, transform: 'translateY(-50%)', overflow: 'hidden', opacity: op }}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 36, color: c.fg, whiteSpace: 'nowrap', transform: `translateX(${(1 - rp) * -20}px)`, clipPath: `inset(0 ${(1 - rp) * 100}% 0 0)` }}>{m.label}</div>
          </div>
        );
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
      <Lockup t={t} c={c} start={17.3} cx={960} cy={372} size={86} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={960 - accLen / 2} y1={520} x2={960 + accLen / 2} y2={520} stroke={c.gold} strokeWidth={2.5} strokeDasharray={accLen} strokeDashoffset={accLen * (1 - lineP)} opacity={accOp} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: 0, top: 556, width: '100%', textAlign: 'center', transform: `translateY(${h1r}px)`, opacity: h1, fontFamily: SERIF, fontWeight: 600, fontSize: 78, color: c.fg, lineHeight: 1.05, whiteSpace: 'nowrap' }}>Begin Your Stewardship <span style={{ fontStyle: 'italic', color: c.gold }}>Journey</span></div>
      <div style={{ position: 'absolute', left: 0, top: 688, width: '100%', textAlign: 'center', opacity: lblOp, fontFamily: SANS, fontSize: 27, fontWeight: 700, letterSpacing: '0.34em', color: c.goldSoft }}>FAITH&nbsp;&nbsp;·&nbsp;&nbsp;FAMILY&nbsp;&nbsp;·&nbsp;&nbsp;FINANCE&nbsp;&nbsp;·&nbsp;&nbsp;FUTURE</div>
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
  const [mode, setMode] = useState(theme === 'light' ? 'light' : 'dark');
  const c = THEMES[mode] || THEMES.dark;

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
        {Motes(time, c)}
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
      <button onClick={() => setMode(m => (m === 'dark' ? 'light' : 'dark'))} aria-label="Toggle light or dark mode" title="Toggle theme"
        style={{ position: 'absolute', top: 14, right: 14, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9, background: `color-mix(in oklab, ${c.bg} 70%, transparent)`, backdropFilter: 'blur(8px)', border: `1px solid ${c.border}`, color: c.fg, cursor: 'pointer', padding: 0, zIndex: 6 }}>
        {mode === 'dark'
          ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}
      </button>
    </div>
  );
}

if (typeof window !== 'undefined') window.StewardshipBlueprint = StewardshipBlueprint;
if (typeof module !== 'undefined' && module.exports) { module.exports = StewardshipBlueprint; module.exports.default = StewardshipBlueprint; module.exports.StewardshipBlueprint = StewardshipBlueprint; }
