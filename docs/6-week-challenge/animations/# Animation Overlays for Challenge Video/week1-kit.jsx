/* Overlay kit — Video 2 of 8, Week 1 "Wake Up". */

const C = { ink: '#0C0C0C', navy: '#1A2E3B', gold: '#C9A96E', goldLite: '#DCC084', cream: '#F4F1EA', white: '#FFFFFF' };
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";
const SANS = "'Figtree', system-ui, -apple-system, 'Segoe UI', sans-serif";

const MOTION = {
  enter: (start, dur) => animate({ from: 0, to: 1, start, end: start + (dur || 0.7), ease: Easing.easeOutCubic }),
  draw: (start, dur) => animate({ from: 0, to: 1, start, end: start + (dur || 1.2), ease: Easing.easeInOutQuad }),
  pop: (start, dur) => animate({ from: 0, to: 1, start, end: start + (dur || 0.55), ease: Easing.easeOutBack }),
};
const rise = (p, px) => ({ opacity: clamp(p, 0, 1), transform: 'translateY(' + (1 - clamp(p, 0, 1)) * (px == null ? 26 : px) + 'px)' });
const caps = (size, color, ls) => ({
  fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: ls == null ? 0.22 * size : ls,
  textTransform: 'uppercase', color: color, lineHeight: 1.1,
});

const MONO_PATHS = [
  'M161.904,115.061l-46.337,-0l0,-113.486l68.324,-0l-0,76.939c-0.111,8.762 -3.771,13.31 -10.648,13.31c-6.765,-0 -10.536,-4.492 -10.87,-13.088l-30.833,-0c-0.095,22.326 12.963,33.516 30.364,36.325Z',
  'M0,1.553l0,113.574l30.168,-0l-0,-66.104l0.887,-0l25.288,65.217l18.19,0l25.288,-64.773l0.887,-0l0,65.66l30.169,-0l-0,-113.574l-38.376,-0l-26.398,64.328l-1.33,0l-26.398,-64.328l-38.375,-0Z',
  'M283.798,39.041l31.166,-0c-2.384,-22.793 -23.07,-39.041 -49.911,-39.041c-30.611,0 -55.456,21.073 -55.456,58.562c-0,35.935 22.515,58.117 55.678,58.117c29.725,0 51.02,-18.189 51.02,-49.244l0,-15.75l-50.354,-0l-0,21.961l20.629,-0c-0.277,9.871 -7.264,16.193 -21.073,16.193c-15.971,-0 -24.179,-11.757 -24.179,-31.721c-0,-19.687 8.873,-31.277 24.401,-31.277c9.649,-0 16.193,4.436 18.079,12.2Z',
];
function Monogram({ h, color, style }) {
  return (
    <svg viewBox="0 0 317 117" height={h} width={h * (317 / 117)} style={style}>
      {MONO_PATHS.map((d, i) => <path key={i} d={d} fill={color} />)}
    </svg>
  );
}

function Plate({ mode, T }) {
  if (mode === 'image') return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <image-slot id="w1-bg-plate" shape="rect" fit="cover"
                  placeholder="Drop a frame grab from the Week 1 video"></image-slot>
    </div>
  );
  if (mode === 'transparent') return null;
  if (mode === 'chroma key') return <div style={{ position: 'absolute', inset: 0, background: '#00B140' }} />;
  if (mode === 'black') return <div style={{ position: 'absolute', inset: 0, background: '#000' }} />;
  const z = 1.05 + 0.022 * Math.sin(T * 0.14);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#14100C' }}>
      <div style={{ position: 'absolute', inset: 0, transform: 'scale(' + z + ')' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 22% 18%, #4A3B2A 0%, #241C14 42%, #0E0B08 100%)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 216, width: 214, height: 250, marginLeft: -107, borderRadius: '50% 50% 46% 46%', background: 'linear-gradient(160deg, #3C2E22, #1A1410)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 430, width: 720, height: 700, marginLeft: -360, borderRadius: '46% 46% 0 0', background: 'linear-gradient(170deg, #2B2119, #100C09)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.62) 100%)' }} />
      </div>
      <div style={{ position: 'absolute', left: 44, top: 40, ...caps(19, 'rgba(244,241,234,0.34)') }}>Camera — stand-in plate</div>
    </div>
  );
}

const BareCtx = React.createContext(false);
function Beat({ from, to, fade, children }) {
  const { T } = useComposition();
  const f = fade == null ? 0.5 : fade;
  const o = Math.min(clamp((T - from) / f, 0, 1), clamp((to - T) / f, 0, 1));
  return (
    <Shot from={from - 0.1} to={to + 0.1}>
      <div style={{ position: 'absolute', inset: 0, opacity: o }}>{children}</div>
    </Shot>
  );
}
const Scrim = ({ o }) => {
  if (React.useContext(BareCtx)) return null;
  return <div style={{
    position: 'absolute', inset: 0, opacity: o,
    background: 'linear-gradient(0deg, rgba(12,12,12,0.94) 0%, rgba(12,12,12,0.82) 34%, rgba(12,12,12,0) 62%)',
  }} />;
};
const Dim = ({ o, color }) => {
  if (React.useContext(BareCtx)) return null;
  return <div style={{ position: 'absolute', inset: 0, background: color, opacity: o }} />;
};
const Kicker = ({ text, p, color }) => (
  <div style={{ ...caps(22, color || C.gold), ...rise(p, 12), display: 'flex', alignItems: 'center', gap: 16 }}>
    <span style={{ width: 34 * clamp(p, 0, 1), height: 2, background: color || C.gold, display: 'block' }} />
    <span>{text}</span>
  </div>
);
const DrawPath = ({ d, p, color, w, cap, dash }) => (
  <path d={d} pathLength="1" fill="none" stroke={color} strokeWidth={w} strokeLinecap={cap || 'round'}
        strokeDasharray={dash || '1'} strokeDashoffset={dash ? 0 : 1 - clamp(p, 0, 1)} opacity={dash ? clamp(p, 0, 1) : 1} />
);

/* ------------------------------------------------------------------- beats */
function BLowerThird({ T, t0, tw }) {
  const bar = MOTION.draw(t0 + 0.15, 0.5)(T);
  const block = MOTION.enter(t0 + 0.3, 0.7)(T);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 152, width: 1140, height: 210 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,46,59,0.93)', transform: 'scaleX(' + clamp(block, 0, 1) + ')', transformOrigin: 'left' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 210 * clamp(bar, 0, 1), background: C.gold }} />
      <div style={{ position: 'absolute', left: 58, top: 42, right: 240, overflow: 'hidden', height: 130 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 66, color: C.white, ...rise(MOTION.enter(t0 + 0.6, 0.8)(T), 70) }}>{tw.presenter}</div>
        <div style={{ ...caps(24, C.cream, 4), marginTop: 12, ...rise(MOTION.enter(t0 + 0.95, 0.8)(T), 40) }}>Creator · The Stewardship Blueprint</div>
      </div>
      <Monogram h={54} color={C.gold} style={{ position: 'absolute', right: 52, top: 78, opacity: clamp(MOTION.enter(t0 + 1.3, 0.8)(T), 0, 1) }} />
    </div>
  );
}

function BTitle({ T, t0, tw }) {
  const p = MOTION.enter(t0 + 0.2, 1)(T);
  const cw = clamp(MOTION.enter(t0 + 0.9, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.95 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Monogram h={58} color={C.gold} style={{ opacity: clamp(p, 0, 1), marginBottom: 46 }} />
        <div style={{ ...caps(34, C.goldLite, 14), ...rise(MOTION.enter(t0 + 0.4, 0.8)(T), 22) }}>{tw.weekLabel}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 150, lineHeight: 1.02, color: C.white, marginTop: 22, ...rise(MOTION.enter(t0 + 0.7, 0.9)(T), 44) }}>{tw.episodeTitle}</div>
        <div style={{ width: 220 * cw, height: 3, background: C.gold, margin: '48px 0 32px' }} />
        <div style={{ ...caps(28, C.cream, 6), ...rise(MOTION.enter(t0 + 1.5, 0.9)(T), 18), textAlign: 'center' }}>{tw.subtitle}</div>
      </div>
      {[[110, 110, 1, 1], [1810, 110, -1, 1], [110, 970, 1, -1], [1810, 970, -1, -1]].map(([x, y, sx, sy], i) => (
        <svg key={i} width={90} height={90} style={{ position: 'absolute', left: x - (sx > 0 ? 0 : 90), top: y - (sy > 0 ? 0 : 90), opacity: cw, transform: 'scale(' + sx + ',' + sy + ')' }}>
          <path d={'M0,0 L' + 76 * cw + ',0 M0,0 L0,' + 76 * cw} stroke={C.gold} strokeWidth={3} />
        </svg>
      ))}
    </div>
  );
}

/* the drift cascade: small thing → large consequence */
const DRIFTS = [
  ['One busy week', 'a busy season'],
  ['One postponed conversation', 'distance'],
  ['One year of putting health last', 'warning signals'],
];
function BDriftStack({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 180, width: 1300 }}>
        <Kicker text="It is almost never one decision" p={MOTION.enter(t0 + 0.15, 0.6)(T)} />
        <div style={{ height: 34 }} />
        {DRIFTS.map(([a, b], i) => {
          const p = clamp(MOTION.enter(t0 + 0.6 + i * 2.4, 0.7)(T), 0, 1);
          const arrow = clamp(MOTION.draw(t0 + 1.15 + i * 2.4, 0.6)(T), 0, 1);
          const to = clamp(MOTION.enter(t0 + 1.5 + i * 2.4, 0.7)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 22, ...rise(p, 22) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 50, color: 'rgba(244,241,234,0.62)', width: 700 }}>{a}</span>
              <svg width={110} height={20}><DrawPath d="M0,10 L96,10" p={arrow} color={C.gold} w={2} cap="butt" />
                <path d="M92,4 L104,10 L92,16" fill="none" stroke={C.gold} strokeWidth={2} opacity={arrow > 0.9 ? 1 : 0} /></svg>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.white, opacity: to, transform: 'translateX(' + (1 - to) * -16 + 'px)' }}>{b}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BBusyness({ T, t0 }) {
  const p = MOTION.enter(t0 + 0.2, 0.9)(T);
  const rule = clamp(MOTION.draw(t0 + 0.8, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 200, width: 1400 }}>
        <div style={{ width: 700 * rule, height: 3, background: C.gold, marginBottom: 34 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 110, lineHeight: 1.04, color: C.white, ...rise(p, 34) }}>
          Busyness can <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>disguise</em> drift.
        </div>
      </div>
    </div>
  );
}

function BMotion({ T, t0 }) {
  const a = clamp(MOTION.draw(t0 + 0.6, 2.2)(T), 0, 1);
  const b = clamp(MOTION.draw(t0 + 2.4, 1.6)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 172, width: 1520 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 82, color: C.white, ...rise(MOTION.enter(t0 + 0.15, 0.8)(T), 24) }}>
          Motion is not the same as <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>direction.</em>
        </div>
        <svg width={1520} height={230} viewBox="0 0 1520 230" style={{ marginTop: 26 }}>
          <DrawPath d="M0,170 L1180,170" p={a} color="rgba(244,241,234,0.75)" w={4} cap="butt" />
          <path d="M1160,150 L1196,170 L1160,190" fill="none" stroke="rgba(244,241,234,0.75)" strokeWidth={4} opacity={a > 0.94 ? 1 : 0} />
          <DrawPath d="M0,170 L980,32" p={b} color={C.goldLite} w={4} cap="butt" dash="10 12" />
          <path d="M950,18 L996,30 L962,58" fill="none" stroke={C.goldLite} strokeWidth={4} opacity={b > 0.94 ? 1 : 0} />
          <text x={1210} y={180} fill="rgba(244,241,234,0.75)" fontFamily={SANS} fontWeight="700" fontSize={24} letterSpacing="4" opacity={a > 0.94 ? 1 : 0}>MOTION</text>
          <text x={1014} y={40} fill={C.goldLite} fontFamily={SANS} fontWeight="700" fontSize={24} letterSpacing="4" opacity={b > 0.94 ? 1 : 0}>DIRECTION</text>
        </svg>
      </div>
    </div>
  );
}

const SCORES = ['Income', 'A title', 'The approval of certain people', 'Comparison to other men'];
function BScoreboard({ T, t0, t1 }) {
  const wrong = clamp(MOTION.enter(t0 + 7.8, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.9 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 150 }}>
        <Kicker text="Every one of us is keeping score" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 268, opacity: 1 - 0.45 * wrong }}>
        {SCORES.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 0.8 + i * 0.9, 0.7)(T), 0, 1);
          const fill = clamp(MOTION.draw(t0 + 1.1 + i * 0.9, 1.6)(T), 0, 1);
          const val = Math.round(fill * [92, 78, 86, 71][i]);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 34, marginBottom: 26, ...rise(p, 20) }}>
              <span style={{ ...caps(26, C.cream, 3), width: 560 }}>{s}</span>
              <span style={{ flex: 1, height: 22, background: 'rgba(244,241,234,0.12)', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (val) + '%', background: C.gold }} />
              </span>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 46, color: C.goldLite, width: 110, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{val}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 700, opacity: wrong, transform: 'translateY(' + (1 - wrong) * 24 + 'px)' }}>
        <div style={{ width: 1640 * wrong, height: 3, background: C.goldLite, marginBottom: 34 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 86, color: C.white }}>
          You can be winning — and know it's the <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>wrong scoreboard.</em>
        </div>
      </div>
    </div>
  );
}

function BScripture({ T, t0, tw }) {
  const z = 1 + 0.05 * clamp(MOTION.draw(t0, 6.5)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Dim o={0.95 * clamp(MOTION.enter(t0, 0.8)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'scale(' + z + ')' }}>
        <div style={{ maxWidth: 1420, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', textWrap: 'balance', fontSize: 88, lineHeight: 1.16, color: C.white }}>
          <span style={{ ...rise(MOTION.enter(t0 + 0.4, 1)(T), 18), display: 'inline-block' }}>“Teach us to number our days,</span>{' '}
          <span style={{ ...rise(MOTION.enter(t0 + 1.6, 1)(T), 18), display: 'inline-block' }}>that we may gain a heart of wisdom.”</span>
        </div>
        <div style={{ width: 160 * clamp(MOTION.enter(t0 + 2.6, 0.8)(T), 0, 1), height: 2, background: C.gold, margin: '46px 0 26px' }} />
        <div style={{ ...caps(26, C.goldLite, 8), opacity: clamp(MOTION.enter(t0 + 2.8, 0.8)(T), 0, 1) }}>{tw.scriptureRef}</div>
      </div>
    </div>
  );
}

/* --- the Stewardship Blueprint: a drawn temple ---------------------------
   Full-frame composition — the diagram covers the video, headline and
   layer index sit in the right column.
   07 pediment · 06 architrave · 05 dentil course · 04 detached rails
   03 four fluted columns · 02 stepped plinth · 01 bedrock course      */
const COLS = [240, 354, 468, 582];
const COL_W = 58;
const RAILS = [30, 802];
const RAIL_W = 48;
const ANCHOR = [128, 203, 278, 353, 428, 503, 578];

function Fluted({ x, w, top, bottom, capH, baseH, fill, flutes, p, C }) {
  const shaftTop = top + capH;
  const shaftBot = bottom - baseH;
  return (
    <g style={{ opacity: p, transform: 'scaleY(' + p + ')', transformOrigin: (x + w / 2) + 'px ' + bottom + 'px' }}>
      <rect x={x - 6} y={top} width={w + 12} height={capH} fill={C.cream} />
      <rect x={x} y={shaftTop} width={w} height={shaftBot - shaftTop} fill={fill} />
      {flutes.map((o, j) => (
        <line key={j} x1={x + o} y1={shaftTop + 8} x2={x + o} y2={shaftBot - 8}
              stroke="rgba(12,12,12,0.2)" strokeWidth={2} />
      ))}
      <rect x={x - 7} y={shaftBot} width={w + 14} height={baseH} fill={C.cream} />
    </g>
  );
}

function Temple({ s, cols, rails, dents, C }) {
  const sx = (v, ox, oy) => ({ transform: 'scaleX(' + v + ')', transformOrigin: ox + 'px ' + oy + 'px' });
  return (
    <svg width={900} height={640} viewBox="0 0 900 640" style={{ display: 'block', overflow: 'visible' }}>
      {/* 07 — pediment */}
      <g style={{ opacity: s[6], transform: 'translateY(' + (1 - s[6]) * -52 + 'px)' }}>
        <path d="M440,84 L780,194 L100,194 Z" fill={C.cream} />
        <rect x={150} y={194} width={580} height={18} fill={C.cream} />
        <rect x={144} y={194} width={592} height={3} fill="rgba(12,12,12,0.16)" />
      </g>
      {/* 06 — architrave */}
      <g style={{ opacity: s[5], ...sx(s[5], 440, 222) }}>
        <rect x={180} y={212} width={520} height={19} fill={C.goldLite}
              style={{ filter: 'drop-shadow(0 0 18px rgba(201,169,110,0.85))' }} />
      </g>
      {/* 05 — dentil course */}
      {dents.map((d, i) => (
        <rect key={i} x={190 + i * 51} y={234} width={36} height={34} fill="rgba(244,241,234,0.9)"
              style={{ opacity: d, transform: 'scaleY(' + d + ')', transformOrigin: (208 + i * 51) + 'px 268px' }} />
      ))}
      {/* 04 — guardrails: the pillar order, detached, standing on the ground line */}
      {RAILS.map((x, i) => (
        <Fluted key={i} x={x} w={RAIL_W} top={350} bottom={600} capH={18} baseH={26}
                fill="rgba(244,241,234,0.93)" flutes={[14, 24, 34]} p={rails[i]} C={C} />
      ))}
      {/* 03 — four fluted columns */}
      {COLS.map((x, i) => (
        <Fluted key={i} x={x} w={COL_W} top={268} bottom={498} capH={18} baseH={28}
                fill="rgba(244,241,234,0.93)" flutes={[16, 29, 42]} p={cols[i]} C={C} />
      ))}
      {/* 02 — stepped plinth */}
      <g style={{ opacity: s[1] }}>
        <g style={sx(s[1], 440, 510)}>
          <rect x={178} y={498} width={524} height={24} fill="rgba(244,241,234,0.44)" stroke={C.cream} strokeWidth={1.5} />
        </g>
        <g style={sx(s[1], 440, 537)}>
          <rect x={150} y={522} width={580} height={30} fill="rgba(244,241,234,0.62)" stroke={C.cream} strokeWidth={1.5} />
        </g>
      </g>
      {/* 01 — bedrock course */}
      <g style={{ opacity: s[0], ...sx(s[0], 440, 576) }}>
        <rect x={120} y={552} width={640} height={48} fill={C.gold} />
        <rect x={120} y={552} width={640} height={4} fill="rgba(255,255,255,0.22)" />
      </g>
    </svg>
  );
}

function TempleLabels({ s, labels, C }) {
  return (
    <div style={{ position: 'absolute', left: 940, top: 0, width: 680, height: 640 }}>
      {labels.map((label, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, top: ANCHOR[i] - 16, width: 680,
          display: 'flex', alignItems: 'center', gap: 22, opacity: s[i],
          transform: 'translateX(' + (1 - s[i]) * -16 + 'px)',
        }}>
          <span style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 34, color: C.gold, flexShrink: 0 }}>{'0' + (i + 1)}</span>
          <span style={{ ...caps(23, C.cream, 3), whiteSpace: 'nowrap' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const TEMPLE_LABELS = ["Bedrock — Faith & Identity","Foundation — Mission & Values","The Four Pillars","Guardrails","Habits","Energy","Legacy"];

function BBlueprint({ T, t0 }) {
  const step = (i) => clamp(MOTION.pop(t0 + 1.0 + i * 1.3, 0.75)(T), 0, 1);
  const s = [step(0), step(1), step(2), step(3), step(4), step(5), step(6)];
  const cols = COLS.map((_, i) => clamp(MOTION.pop(t0 + 3.6 + i * 0.32, 0.7)(T), 0, 1));
  const rails = RAILS.map((_, i) => clamp(MOTION.pop(t0 + 5.4 + i * 0.3, 0.7)(T), 0, 1));
  const dents = Array.from({ length: 10 }).map((_, i) => clamp(MOTION.enter(t0 + 7.0 + i * 0.09, 0.4)(T), 0, 1));
  const head = clamp(MOTION.enter(t0 + 0.5, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.97 * clamp(MOTION.enter(t0, 0.8)(T), 0, 1)} color={C.ink} />
      <div style={{
        position: 'absolute', left: 70, top: 300, width: 1620, height: 640,
        transform: 'scale(1.05)', transformOrigin: 'left top',
      }}>
        <Temple s={s} cols={cols} rails={rails} dents={dents} C={C} />
        <TempleLabels s={s} labels={TEMPLE_LABELS} C={C} />
        <div style={{
          position: 'absolute', left: 940, top: -218, width: 760,
          fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 96, lineHeight: 1.06, color: C.white,
          opacity: head, transform: 'translateY(' + (1 - head) * 26 + 'px)',
        }}>
          Every man has this <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>structure.</em>
        </div>
      </div>
    </div>
  );
}

function BStrongThin({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.8)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 1.6, 0.8)(T), 0, 1);
  const c = clamp(MOTION.enter(t0 + 3.0, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 190, width: 1500 }}>
        <div style={{ display: 'flex', gap: 60, marginBottom: 40 }}>
          <div style={{ ...rise(a, 22) }}>
            <div style={{ width: 260, height: 14, background: C.goldLite, transform: 'scaleX(' + a + ')', transformOrigin: 'left' }} />
            <div style={{ ...caps(26, C.cream, 4), marginTop: 18 }}>Some parts are strong</div>
          </div>
          <div style={{ ...rise(b, 22) }}>
            <div style={{ width: 260, height: 3, background: 'rgba(244,241,234,0.5)', marginTop: 11, transform: 'scaleX(' + b + ')', transformOrigin: 'left' }} />
            <div style={{ ...caps(26, 'rgba(244,241,234,0.7)', 4), marginTop: 18 }}>Some are thin</div>
          </div>
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 82, color: C.white, ...rise(c, 26) }}>
          A blueprint doesn't shame the builder. It shows him <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>what needs attention.</em>
        </div>
      </div>
    </div>
  );
}

const WORK = [
  ['Take the Created for More Check-In', 'All seven layers — answer from the evidence, not the aspiration.'],
  ['Sit with two questions', 'Bring what you notice to the group.'],
  ['Choose one man. Make one commitment.', 'Small, specific, and reported back.'],
];
function BTheWork({ T, t0, tw }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 170 }}>
        <Kicker text={'Your work this week · ' + tw.weekLabel} p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 290 }}>
        {WORK.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 1.5, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', gap: 44, alignItems: 'flex-start', paddingBottom: 40, marginBottom: 40, borderBottom: '1px solid rgba(244,241,234,' + 0.2 * p + ')', ...rise(p, 26) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.gold, width: 100 }}>{'0' + (i + 1)}</span>
              <span>
                <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 68, color: C.white, lineHeight: 1.06 }}>{h}</span>
                <span style={{ display: 'block', ...caps(24, 'rgba(244,241,234,0.72)', 3), marginTop: 16 }}>{sub}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BQuestions({ T, t0 }) {
  const q = ['What scoreboard have I been playing on — and who taught me to keep score that way?', 'Where am I drifting right now?'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 200, right: 200, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {q.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 0.5 + i * 3.4, 0.9)(T), 0, 1);
          return (
            <div key={i} style={{ marginBottom: i === 0 ? 70 : 0, ...rise(p, 30) }}>
              <div style={{ ...caps(22, C.gold, 8), marginBottom: 22 }}>{'Question 0' + (i + 1)}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 86, lineHeight: 1.1, color: C.white }}>{s}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BAwareness({ T, t0 }) {
  const p = MOTION.enter(t0 + 0.2, 0.9)(T);
  const p2 = MOTION.enter(t0 + 1.4, 0.9)(T);
  const rule = clamp(MOTION.draw(t0 + 0.9, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 190, width: 1500 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 92, color: 'rgba(244,241,234,0.72)', ...rise(p, 28) }}>Awareness is not failure.</div>
        <div style={{ width: 420 * rule, height: 2, background: C.gold, margin: '26px 0' }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 104, color: C.white, ...rise(p2, 28) }}>
          It is the beginning of <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>stewardship.</em>
        </div>
      </div>
    </div>
  );
}

function BPrayer({ T, t0 }) {
  const p = clamp(MOTION.enter(t0 + 0.3, 1.2)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', left: 140, bottom: 170, display: 'flex', alignItems: 'center', gap: 22, opacity: p }}>
      <span style={{ width: 90 * p, height: 1, background: 'rgba(201,169,110,0.9)' }} />
      <span style={{ ...caps(24, C.goldLite, 10) }}>A moment to pray</span>
    </div>
  );
}

function BNext({ T, t0, tw }) {
  const p = MOTION.enter(t0 + 0.3, 1)(T);
  const drift = clamp(MOTION.draw(t0, 6.5)(T), 0, 1);
  const lines = ['Do the pre-work.', 'Tell the truth.', 'Take one faithful step.'];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Dim o={0.97 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', opacity: 0.045, transform: 'translate(-50%,-50%) scale(' + (1.05 + drift * 0.2) + ')' }}>
        <Monogram h={300} color={C.cream} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Monogram h={62} color={C.gold} style={{ opacity: clamp(p, 0, 1), marginBottom: 54 }} />
        <div style={{ display: 'flex', gap: 46, alignItems: 'baseline' }}>
          {lines.map((s, i) => (
            <span key={i} style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 68, color: i === 2 ? C.white : 'rgba(244,241,234,0.8)', ...rise(MOTION.enter(t0 + 0.6 + i * 0.5, 0.8)(T), 24) }}>{s}</span>
          ))}
        </div>
        <div style={{ width: 220 * clamp(MOTION.enter(t0 + 2.4, 0.8)(T), 0, 1), height: 3, background: C.gold, margin: '52px 0 34px' }} />
        <div style={{ ...caps(30, C.goldLite, 10), ...rise(MOTION.enter(t0 + 2.7, 0.9)(T), 18) }}>{tw.nextUp}</div>
        <div style={{ ...caps(22, 'rgba(244,241,234,0.5)', 6), marginTop: 34, opacity: clamp(MOTION.enter(t0 + 3.2, 0.9)(T), 0, 1) }}>{tw.url}</div>
      </div>
    </div>
  );
}

function Slate({ T, scenes }) {
  let acc = 0, idx = 0, name = scenes[0] ? scenes[0].name : '';
  for (let i = 0; i < scenes.length; i++) { if (T >= acc) { idx = i; name = scenes[i].name; } acc += scenes[i].dur; }
  const mm = String(Math.floor(T / 60)).padStart(2, '0');
  const ss = String(Math.floor(T % 60)).padStart(2, '0');
  const ff = String(Math.floor((T % 1) * 30)).padStart(2, '0');
  return (
    <div style={{ position: 'absolute', right: 44, top: 40, display: 'flex', alignItems: 'center', gap: 18, padding: '12px 20px', background: 'rgba(12,12,12,0.72)', border: '1px solid rgba(201,169,110,0.5)' }}>
      <span style={caps(19, C.gold, 3)}>{'Overlay ' + String(idx + 1).padStart(2, '0') + ' / ' + scenes.length}</span>
      <span style={{ width: 1, height: 20, background: 'rgba(244,241,234,0.3)' }} />
      <span style={caps(19, C.cream, 3)}>{name}</span>
      <span style={{ width: 1, height: 20, background: 'rgba(244,241,234,0.3)' }} />
      <span style={{ fontFamily: SANS, fontSize: 19, color: 'rgba(244,241,234,0.7)', fontVariantNumeric: 'tabular-nums' }}>{mm + ':' + ss + ':' + ff}</span>
    </div>
  );
}

function Piece({ tw, scenes }) {
  const { T, CUES, authoredTotal } = useComposition();
  const D = {};
  scenes.forEach((s) => { D[s.name] = s.dur; });
  const beat = (n) => ({ t0: CUES[n], t1: CUES[n] + D[n] });
  const lt = beat('LowerThird'), ti = beat('TitleCard'), dr = beat('DriftStack'), bu = beat('Busyness'),
    mo = beat('Motion'), sb = beat('Scoreboard'), sc = beat('Scripture'), bp = beat('Blueprint'),
    stn = beat('StrongThin'), wk = beat('TheWork'), qs = beat('Questions'), aw = beat('Awareness'),
    pr = beat('Prayer'), nx = beat('NextUp');

  const capItems = [
    { at: lt.t0, text: 'Welcome to week one. You have chosen to do something most men never do: examine the life you are building, on purpose, with other men.' },
    { at: ti.t0, until: ti.t0 + 0.1, text: '' },
    { at: dr.t0, text: 'It is almost never one dramatic decision. It is drift.' },
    { at: bu.t0, text: 'Busyness feels like responsibility — so we assume we must be on track.' },
    { at: mo.t0, text: 'But motion is not the same as direction. A man can be productive and still be pointed at the wrong thing.' },
    { at: sb.t0, text: 'Every one of us is keeping score on something.' },
    { at: sb.t0 + 7.5, text: "It is possible to be winning and still feel unsettled, because you know it is the wrong scoreboard." },
    { at: sc.t0, until: sc.t0 + 0.1, text: '' },
    { at: bp.t0, text: 'Your life is a structure — bedrock, foundation, four pillars, guardrails, habits, energy, legacy.' },
    { at: stn.t0, text: 'Every man has this structure whether he has named it or not. Some parts are strong. Some are thin.' },
    { at: wk.t0, text: 'Here is your work this week, and it is in your guide.' },
    { at: qs.t0, until: qs.t0 + 0.1, text: '' },
    { at: aw.t0, text: 'Awareness is not failure. It is the beginning of stewardship.' },
    { at: pr.t0, until: pr.t0 + 0.1, text: '' },
    { at: nx.t0, until: nx.t0 + 0.1, text: '' },
  ];

  return (
    <BareCtx.Provider value={tw.plate !== 'footage' && !tw.keepScrims}>
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} data-screen-label={'t=' + Math.floor(T) + 's'}>
      <Plate mode={tw.plate} T={T} />
      {tw.bgOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, background: tw.bgColor, opacity: clamp(tw.bgOpacity / 100, 0, 1), pointerEvents: 'none' }} />
      )}

      <Beat from={lt.t0} to={lt.t1}><BLowerThird T={T} t0={lt.t0} tw={tw} /></Beat>
      <Beat from={ti.t0} to={ti.t1}><BTitle T={T} t0={ti.t0} tw={tw} /></Beat>
      <Beat from={dr.t0} to={dr.t1}><BDriftStack T={T} t0={dr.t0} /></Beat>
      <Beat from={bu.t0} to={bu.t1}><BBusyness T={T} t0={bu.t0} /></Beat>
      <Beat from={mo.t0} to={mo.t1}><BMotion T={T} t0={mo.t0} /></Beat>
      <Beat from={sb.t0} to={sb.t1}><BScoreboard T={T} t0={sb.t0} t1={sb.t1} /></Beat>
      <Beat from={sc.t0} to={sc.t1}><BScripture T={T} t0={sc.t0} tw={tw} /></Beat>
      <Beat from={bp.t0} to={bp.t1}><BBlueprint T={T} t0={bp.t0} /></Beat>
      <Beat from={stn.t0} to={stn.t1}><BStrongThin T={T} t0={stn.t0} /></Beat>
      <Beat from={wk.t0} to={wk.t1}><BTheWork T={T} t0={wk.t0} tw={tw} /></Beat>
      <Beat from={qs.t0} to={qs.t1}><BQuestions T={T} t0={qs.t0} /></Beat>
      <Beat from={aw.t0} to={aw.t1}><BAwareness T={T} t0={aw.t0} /></Beat>
      <Beat from={pr.t0} to={pr.t1}><BPrayer T={T} t0={pr.t0} /></Beat>
      <Beat from={nx.t0} to={nx.t1}><BNext T={T} t0={nx.t0} tw={tw} /></Beat>

      <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: (1920 * clamp(T / (authoredTotal || 1), 0, 1)) + 'px', background: C.gold, opacity: tw.slate ? 0.9 : 0 }} />
      {tw.slate && <Slate T={T} scenes={scenes} />}
      {tw.captions && (
        <Captions items={capItems} style={{
          left: 280, right: 280, bottom: 34,
          fontFamily: SANS, fontWeight: 400, fontSize: 32, lineHeight: 1.32, color: C.white,
          textShadow: '0 2px 14px rgba(0,0,0,0.9)',
        }} />
      )}
    </div>
    </BareCtx.Provider>
  );
}

function Week1Kit() {
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  /* Single-scene files set window.SOLO_SCENE. There the scene list is rebuilt
     from the "Scene length" tweak with no "nat" anchor, so playback stays 1:1:
     the animation runs at its authored speed and the remaining seconds hold
     the finished frame. */
  const solo = window.SOLO_SCENE || null;
  const secs = Math.max(6, +tw.sceneSeconds || 22);
  const sceneJson = React.useMemo(() => {
    if (!solo) return window.OM_SCENES;
    return JSON.stringify(JSON.parse(window.OM_SCENES).map((sc) => ({
      name: sc.name, desc: sc.desc, dur: sc.name === solo ? secs : 0.0001,
    })));
  }, [solo, secs]);
  const scenes = React.useMemo(() => JSON.parse(sceneJson), [sceneJson]);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CompositionStage width={1920} height={1080}
                        bg={tw.plate === 'transparent' ? 'transparent' : (tw.plate === 'chroma key' ? '#00B140' : '#000')}
                        scenes={sceneJson} playback={window.OM_PLAYBACK}>
        <Piece tw={tw} scenes={scenes} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Editing" />
        {solo && <TweakSlider label="Scene length" value={secs} min={6} max={45} step={1} unit="s" onChange={(v) => setTweak('sceneSeconds', v)} />}
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
        <TweakSelect label="Background plate" value={tw.plate} options={['footage', 'image', 'transparent', 'chroma key', 'black']} onChange={(v) => setTweak('plate', v)} />
        <TweakColor label="Background color" value={tw.bgColor} options={['#0C0C0C', '#1A2E3B', '#000000', '#F4F1EA']} onChange={(v) => setTweak('bgColor', v)} />
        <TweakSlider label="Background opacity" value={tw.bgOpacity} min={0} max={100} step={1} unit="%" onChange={(v) => setTweak('bgOpacity', v)} />
        <TweakToggle label="Keep text scrims" value={tw.keepScrims} onChange={(v) => setTweak('keepScrims', v)} />
        <TweakToggle label="Burned-in captions" value={tw.captions} onChange={(v) => setTweak('captions', v)} />
        <TweakToggle label="Editor slate + progress" value={tw.slate} onChange={(v) => setTweak('slate', v)} />
        <TweakSection label="Series text" />
        <TweakText label="Presenter" value={tw.presenter} onChange={(v) => setTweak('presenter', v)} />
        <TweakText label="Week label" value={tw.weekLabel} onChange={(v) => setTweak('weekLabel', v)} />
        <TweakText label="Episode title" value={tw.episodeTitle} onChange={(v) => setTweak('episodeTitle', v)} />
        <TweakText label="Subtitle" value={tw.subtitle} onChange={(v) => setTweak('subtitle', v)} />
        <TweakText label="Scripture ref" value={tw.scriptureRef} onChange={(v) => setTweak('scriptureRef', v)} />
        <TweakText label="Next up" value={tw.nextUp} onChange={(v) => setTweak('nextUp', v)} />
        <TweakText label="URL" value={tw.url} onChange={(v) => setTweak('url', v)} />
      </TweaksPanel>
    </div>
  );
}
window.Week1Kit = Week1Kit;
