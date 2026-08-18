/* Overlay kit — The Life You're Building Men's Challenge, Week One.
   Editorial-minimal broadcast overlays over a single-camera talking head. */

const C = {
  ink: '#0C0C0C',
  navy: '#1A2E3B',
  navy2: '#161616',
  gold: '#C9A96E',
  goldLite: '#DCC084',
  cream: '#F4F1EA',
  white: '#FFFFFF',
};
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

/* ---------------------------------------------------------------- monogram */
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

/* ------------------------------------------------------------ camera plate */
function Plate({ mode, T }) {
  if (mode === 'image') return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <image-slot id="bg-plate" shape="rect" fit="cover"
                  placeholder="Drop your background image — or a frame grab from the video"></image-slot>
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
        <div style={{ position: 'absolute', left: 0, top: 0, width: '46%', height: '100%', background: 'linear-gradient(100deg, rgba(214,178,110,0.20), rgba(0,0,0,0) 70%)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 216, width: 214, height: 250, marginLeft: -107, borderRadius: '50% 50% 46% 46%', background: 'linear-gradient(160deg, #3C2E22, #1A1410)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 430, width: 720, height: 700, marginLeft: -360, borderRadius: '46% 46% 0 0', background: 'linear-gradient(170deg, #2B2119, #100C09)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(70% 60% at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.62) 100%)' }} />
      </div>
      <div style={{ position: 'absolute', left: 44, top: 40, ...caps(19, 'rgba(244,241,234,0.34)') }}>Camera — stand-in plate</div>
    </div>
  );
}

/* ------------------------------------------------------------------- atoms */
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
const BareCtx = React.createContext(false);
const Scrim = ({ o, kind }) => {
  if (React.useContext(BareCtx)) return null;
  return (
  <div style={{
    position: 'absolute', inset: 0, opacity: o,
    background: kind === 'full'
      ? 'rgba(12,12,12,0.90)'
      : 'linear-gradient(0deg, rgba(12,12,12,0.94) 0%, rgba(12,12,12,0.82) 34%, rgba(12,12,12,0) 62%)',
  }} />
  );
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
const DrawPath = ({ d, p, color, w, cap }) => (
  <path d={d} pathLength="1" fill="none" stroke={color} strokeWidth={w} strokeLinecap={cap || 'round'}
        strokeDasharray="1" strokeDashoffset={1 - clamp(p, 0, 1)} />
);

/* ------------------------------------------------------------------- beats */
function BQuestion({ T, t0 }) {
  const l = T - t0;
  const line = (i) => MOTION.enter(l + 0.45 - i * 0.42, 0.85)(0 + l * 0);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.8)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 168, width: 1180 }}>
        <Kicker text="A question" p={MOTION.enter(t0 + 0.15, 0.6)(T)} />
        <div style={{ height: 26 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 104, lineHeight: 1.02, color: C.white }}>
          <div style={rise(MOTION.enter(t0 + 0.5, 0.9)(T), 34)}>What kind of life</div>
          <div style={rise(MOTION.enter(t0 + 0.85, 0.9)(T), 34)}>
            are you <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>actually</em> building?
          </div>
        </div>
      </div>
    </div>
  );
}

function BNotPaper({ T, t0 }) {
  const items = ['Not the one on paper.', 'Not the highlight reel.', 'The real one.'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 190, width: 760 }}>
        {items.map((s, i) => {
          const p = MOTION.enter(t0 + 0.25 + i * 0.85, 0.7)(T);
          const strike = i < 2 ? MOTION.draw(t0 + 0.85 + i * 0.85, 0.5)(T) : 0;
          const last = i === 2;
          return (
            <div key={i} style={{ position: 'relative', marginBottom: 26, ...rise(p, 22), opacity: clamp(p, 0, 1) * (i < 2 ? 1 - 0.55 * strike : 1) }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
                {last && <span style={{ width: 6, height: 62, background: C.gold, transform: 'scaleY(' + clamp(MOTION.pop(t0 + 2.1, 0.5)(T), 0, 1) + ')', transformOrigin: 'bottom' }} />}
                <span style={{ position: 'relative', display: 'inline-block', fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: last ? 92 : 66, color: last ? C.white : C.cream }}>
                  {s}
                  {i < 2 && <span style={{ position: 'absolute', left: 0, top: '54%', width: '100%', height: 3, background: C.gold, transform: 'scaleX(' + clamp(strike, 0, 1) + ')', transformOrigin: 'left' }} />}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BWitnesses({ T, t0 }) {
  const items = ['Your calendar', 'Your spending', 'Your relationships', 'Your energy'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 170 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 20) }}>
          If they could talk, what would they say?
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
          {items.map((s, i) => {
            const p = clamp(MOTION.enter(t0 + 0.9 + i * 0.34, 0.7)(T), 0, 1);
            return (
              <div key={i} style={{ flex: 1, ...rise(p, 30) }}>
                <div style={{ height: 3, background: C.gold, transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
                <div style={{ ...caps(30, C.cream, 3), marginTop: 20 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BStop({ T, t0 }) {
  const arc = MOTION.draw(t0 + 0.35, 1.5)(T);
  const dot = MOTION.pop(t0 + 1.85, 0.5)(T);
  const word = MOTION.enter(t0 + 2.4, 0.8)(T);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={MOTION.enter(t0, 0.7)(T)} color="rgba(12,12,12,0.86)" />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
        <svg width={300} height={430} viewBox="0 0 200 290">
          <DrawPath d="M38,74 A61,61 0 1 1 160,74 C160,124 100,133 100,182" p={arc} color={C.goldLite} w={9} />
          <circle cx={100} cy={240} r={13} fill={C.goldLite} opacity={clamp(dot, 0, 1)} transform={'scale(' + (0.4 + 0.6 * clamp(dot, 0, 1)) + ')'} style={{ transformOrigin: '100px 240px' }} />
        </svg>
        <div style={{ ...caps(28, C.cream, 12), ...rise(word, 14) }}>Stop. Let it land.</div>
      </div>
    </div>
  );
}

function BDrift({ T, t0 }) {
  const p = MOTION.draw(t0 + 0.5, 5.2)(T);
  const gap = MOTION.enter(t0 + 5.6, 0.9)(T);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 150 }}>
        <div style={{ ...caps(22, C.gold), ...rise(MOTION.enter(t0 + 0.15, 0.6)(T), 10) }}>Good men drift</div>
        <svg width={1640} height={300} viewBox="0 0 1640 300" style={{ marginTop: 22 }}>
          <DrawPath d="M0,90 L1600,90" p={clamp(p * 1.15, 0, 1)} color="rgba(244,241,234,0.42)" w={2} cap="butt" />
          <DrawPath d="M0,90 C520,92 900,140 1600,246" p={p} color={C.goldLite} w={5} />
          <g opacity={clamp(gap, 0, 1)}>
            <path d="M1600,90 L1600,246" stroke={C.gold} strokeWidth={2} strokeDasharray="6 8" />
            <path d="M1584,90 L1616,90 M1584,246 L1616,246" stroke={C.gold} strokeWidth={2} />
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 0, top: 82, ...caps(21, 'rgba(244,241,234,0.55)', 3), opacity: clamp(MOTION.enter(t0 + 1.2, 0.8)(T), 0, 1) }}>
          The life you meant to build
        </div>
        <div style={{ position: 'absolute', left: 980, top: 268, ...caps(21, C.goldLite, 3), opacity: clamp(MOTION.enter(t0 + 3.6, 0.8)(T), 0, 1) }}>
          The life you're living
        </div>
        <div style={{ position: 'absolute', left: 1420, top: 176, opacity: clamp(gap, 0, 1), fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 44, fontStyle: 'italic', color: C.white }}>
          the drift
        </div>
      </div>
    </div>
  );
}

function BLowerThird({ T, t0, tw }) {
  const bar = MOTION.draw(t0 + 0.15, 0.5)(T);
  const block = MOTION.enter(t0 + 0.3, 0.7)(T);
  const name = MOTION.enter(t0 + 0.6, 0.8)(T);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 152, width: 1140, height: 210 }}>
      <div style={{
        position: 'absolute', inset: 0, background: 'rgba(26,46,59,0.93)',
        transform: 'scaleX(' + clamp(block, 0, 1) + ')', transformOrigin: 'left',
      }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 210 * clamp(bar, 0, 1), background: C.gold }} />
      <div style={{ position: 'absolute', left: 58, top: 42, right: 240, overflow: 'hidden', height: 130 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 66, color: C.white, ...rise(name, 70) }}>{tw.presenter}</div>
        <div style={{ ...caps(24, C.cream, 4), marginTop: 12, ...rise(MOTION.enter(t0 + 0.95, 0.8)(T), 40) }}>
          Creator · The Stewardship Blueprint
        </div>
      </div>
      <Monogram h={54} color={C.gold} style={{ position: 'absolute', right: 52, top: 78, opacity: clamp(MOTION.enter(t0 + 1.3, 0.8)(T), 0, 1) }} />
    </div>
  );
}

function BTitle({ T, t0, tw }) {
  const p = MOTION.enter(t0 + 0.2, 1)(T);
  const corner = MOTION.enter(t0 + 0.9, 0.9)(T);
  const words = tw.challengeTitle.split(' ');
  const cw = clamp(corner, 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.95 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Monogram h={64} color={C.gold} style={{ opacity: clamp(p, 0, 1), marginBottom: 54 }} />
        <div style={{ maxWidth: 1180, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 116, lineHeight: 1.04, color: C.white, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 26px' }}>
          {words.map((w, i) => (
            <span key={i} style={{ display: 'inline-block', ...rise(MOTION.enter(t0 + 0.45 + i * 0.11, 0.8)(T), 44) }}>{w}</span>
          ))}
        </div>
        <div style={{ width: 220 * cw, height: 3, background: C.gold, margin: '54px 0 34px' }} />
        <div style={{ ...caps(30, C.cream, 7), ...rise(MOTION.enter(t0 + 1.5, 0.9)(T), 18), textAlign: 'center' }}>{tw.subtitle}</div>
      </div>
      {[[110, 110, 1, 1], [1810, 110, -1, 1], [110, 970, 1, -1], [1810, 970, -1, -1]].map(([x, y, sx, sy], i) => (
        <svg key={i} width={90} height={90} style={{ position: 'absolute', left: x - (sx > 0 ? 0 : 90), top: y - (sy > 0 ? 0 : 90), opacity: cw, transform: 'scale(' + sx + ',' + sy + ')' }}>
          <path d={'M0,' + 0 + ' L' + 76 * cw + ',0 M0,0 L0,' + 76 * cw} stroke={C.gold} strokeWidth={3} />
        </svg>
      ))}
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

function BStructure({ T, t0 }) {
  const step = (i) => clamp(MOTION.pop(t0 + 1.0 + i * 1.15, 0.75)(T), 0, 1);
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
          Your life is a <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>structure.</em>
        </div>
      </div>
    </div>
  );
}

/* --- the ten domains ----------------------------------------------------- */
const DOMAINS = ['Faith & Identity', 'Purpose', 'Family', 'Fitness', 'Fun', 'Finances', 'Guardrails', 'Habits', 'Energy', 'Legacy'];
function BDomains({ T, t0, t1, tw }) {
  const lock = clamp(MOTION.enter(t0 + 6.4, 1)(T), 0, 1);
  const fi = Math.max(0, DOMAINS.indexOf(tw.focusArea));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 150, opacity: clamp(MOTION.enter(t0 + 0.15, 0.7)(T), 0, 1) }}>
        <Kicker text="The whole structure" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 300, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>
        {DOMAINS.map((d, i) => {
          const p = clamp(MOTION.enter(t0 + 0.9 + i * 0.3, 0.55)(T), 0, 1);
          const on = i === fi;
          const dim = on ? 1 : 1 - 0.66 * lock;
          return (
            <div key={i} style={{
              height: 176, position: 'relative', padding: 22, boxSizing: 'border-box',
              border: '1px solid ' + (on && lock > 0.2 ? C.gold : 'rgba(244,241,234,' + (0.16 + 0.24 * p) + ')'),
              background: on && lock > 0.2 ? 'rgba(201,169,110,' + 0.92 * lock + ')' : 'rgba(26,46,59,' + 0.55 * p + ')',
              opacity: p * dim,
              transform: 'scale(' + (0.96 + 0.04 * p + (on ? 0.05 * lock : 0)) + ')',
            }}>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 30, color: on && lock > 0.2 ? C.ink : C.gold }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ position: 'absolute', left: 22, right: 22, bottom: 24, ...caps(25, on && lock > 0.2 ? C.ink : C.cream, 2.6) }}>{d}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 728, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.white, opacity: lock, transform: 'translateY(' + (1 - lock) * 20 + 'px)' }}>
        Choose <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>one</em> area — without losing sight of the rest.
      </div>
    </div>
  );
}

/* --- what it is not / what it is ----------------------------------------- */
function BNotThis({ T, t0 }) {
  const items = ['A lecture.', 'Pretending you have it together.', 'One more thing to do alone.'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 170, width: 900 }}>
        <Kicker text="This is not" p={MOTION.enter(t0 + 0.15, 0.6)(T)} />
        <div style={{ height: 30 }} />
        {items.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 0.5 + i * 1.0, 0.6)(T), 0, 1);
          const x = MOTION.draw(t0 + 0.95 + i * 1.0, 0.45)(T);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 24, ...rise(p, 20), opacity: p * (1 - 0.4 * clamp(x, 0, 1)) }}>
              <svg width={46} height={46} viewBox="0 0 46 46">
                <rect x="1" y="1" width="44" height="44" fill="none" stroke="rgba(244,241,234,0.4)" strokeWidth="2" />
                <DrawPath d="M11,11 L35,35" p={clamp(x * 2, 0, 1)} color={C.gold} w={4} />
                <DrawPath d="M35,11 L11,35" p={clamp(x * 2 - 1, 0, 1)} color={C.gold} w={4} />
              </svg>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.cream }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function BItIs({ T, t0 }) {
  const items = ['Tell the truth.', 'Pray for one another.', 'Hold each other accountable.', 'Actually follow through.'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 160, width: 1100 }}>
        <Kicker text="It is a group of men willing to" p={MOTION.enter(t0 + 0.15, 0.6)(T)} />
        <div style={{ height: 30 }} />
        {items.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 0.5 + i * 0.95, 0.6)(T), 0, 1);
          const ck = MOTION.draw(t0 + 0.85 + i * 0.95, 0.5)(T);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, marginBottom: 20, ...rise(p, 20) }}>
              <svg width={46} height={46} viewBox="0 0 46 46">
                <rect x="1" y="1" width="44" height="44" fill="none" stroke="rgba(244,241,234,0.4)" strokeWidth="2" />
                <DrawPath d="M10,24 L20,34 L37,13" p={clamp(ck, 0, 1)} color={C.goldLite} w={4} />
              </svg>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 60, color: C.white }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BScripture({ T, t0, tw }) {
  const z = 1 + 0.05 * clamp(MOTION.draw(t0, 5)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Dim o={0.95 * clamp(MOTION.enter(t0, 0.8)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'scale(' + z + ')' }}>
        <div style={{ maxWidth: 1380, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', textWrap: 'balance', fontSize: 84, lineHeight: 1.16, color: C.white }}>
          <span style={{ ...rise(MOTION.enter(t0 + 0.4, 1)(T), 18), display: 'inline-block' }}>“Unless the Lord builds the house,</span>{' '}
          <span style={{ ...rise(MOTION.enter(t0 + 1.5, 1)(T), 18), display: 'inline-block' }}>the builders labor in vain.”</span>
        </div>
        <div style={{ width: 160 * clamp(MOTION.enter(t0 + 2.4, 0.8)(T), 0, 1), height: 2, background: C.gold, margin: '46px 0 26px' }} />
        <div style={{ ...caps(26, C.goldLite, 8), opacity: clamp(MOTION.enter(t0 + 2.6, 0.8)(T), 0, 1) }}>{tw.scriptureRef}</div>
      </div>
    </div>
  );
}

function BBring({ T, t0 }) {
  const items = ['A guide', 'A pen', 'A willingness to be real'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 176 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 66, color: C.white, ...rise(MOTION.enter(t0 + 0.15, 0.8)(T), 20) }}>
          You don't need a polished story. Just bring —
        </div>
        <div style={{ display: 'flex', marginTop: 46 }}>
          {items.map((s, i) => {
            const p = clamp(MOTION.enter(t0 + 0.9 + i * 0.5, 0.7)(T), 0, 1);
            return (
              <div key={i} style={{ flex: 1, paddingLeft: i ? 40 : 0, borderLeft: i ? '1px solid rgba(244,241,234,' + 0.35 * p + ')' : 'none', ...rise(p, 26) }}>
                <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 34, color: C.gold }}>{'0' + (i + 1)}</div>
                <div style={{ ...caps(32, C.cream, 3), marginTop: 14 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BSixWeeks({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 180 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 84, color: C.white, ...rise(MOTION.enter(t0 + 0.15, 0.9)(T), 26) }}>
          Six weeks. <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>One faithful step at a time.</em>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 46 }}>
          {[1, 2, 3, 4, 5, 6].map((n, i) => {
            const p = clamp(MOTION.pop(t0 + 0.9 + i * 0.36, 0.6)(T), 0, 1);
            return (
              <div key={n} style={{ flex: 1, height: 116, position: 'relative', border: '1px solid rgba(244,241,234,' + (0.2 + 0.3 * p) + ')', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 116 * p, background: i === 0 ? C.gold : 'rgba(201,169,110,0.32)' }} />
                <div style={{ position: 'absolute', left: 20, bottom: 16, fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 52, color: i === 0 ? C.ink : C.cream, opacity: p }}>{'0' + n}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BEnd({ T, t0, tw }) {
  const p = MOTION.enter(t0 + 0.3, 1)(T);
  const drift = clamp(MOTION.draw(t0, 6.5)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Dim o={0.97 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', opacity: 0.045, transform: 'translate(-50%,-50%) scale(' + (1.05 + drift * 0.2) + ')' }}>
        <Monogram h={300} color={C.cream} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Monogram h={74} color={C.gold} style={{ opacity: clamp(p, 0, 1), marginBottom: 60 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 84, color: C.white, textAlign: 'center', ...rise(MOTION.enter(t0 + 0.7, 0.9)(T), 30) }}>
          Ask your group leader for dates
        </div>
        <div style={{ width: 200 * clamp(MOTION.enter(t0 + 1.5, 0.8)(T), 0, 1), height: 3, background: C.gold, margin: '48px 0 34px' }} />
        <div style={{ ...caps(40, C.cream, 8), ...rise(MOTION.enter(t0 + 1.8, 0.9)(T), 18) }}>{tw.url}</div>
        <div style={{ ...caps(22, 'rgba(244,241,234,0.5)', 6), marginTop: 40, opacity: clamp(MOTION.enter(t0 + 2.4, 0.9)(T), 0, 1) }}>{tw.weekLabel} · The Life You're Building</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- slate */
function Slate({ T, scenes, total }) {
  let acc = 0, idx = 0, name = scenes[0] ? scenes[0].name : '';
  for (let i = 0; i < scenes.length; i++) {
    if (T >= acc) { idx = i; name = scenes[i].name; }
    acc += scenes[i].dur;
  }
  const mm = String(Math.floor(T / 60)).padStart(2, '0');
  const ss = String(Math.floor(T % 60)).padStart(2, '0');
  const ff = String(Math.floor((T % 1) * 30)).padStart(2, '0');
  return (
    <div style={{ position: 'absolute', right: 44, top: 40, display: 'flex', alignItems: 'center', gap: 18, padding: '12px 20px', background: 'rgba(12,12,12,0.72)', border: '1px solid rgba(201,169,110,0.5)' }}>
      <span style={caps(19, C.gold, 3)}>{'Overlay ' + String(idx + 1).padStart(2, '0') + ' / ' + scenes.length}</span>
      <span style={{ width: 1, height: 20, background: 'rgba(244,241,234,0.3)' }} />
      <span style={caps(19, C.cream, 3)}>{name}</span>
      <span style={{ width: 1, height: 20, background: 'rgba(244,241,234,0.3)' }} />
      <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: 19, color: 'rgba(244,241,234,0.7)', fontVariantNumeric: 'tabular-nums' }}>{mm + ':' + ss + ':' + ff}</span>
    </div>
  );
}

/* -------------------------------------------------------------------- piece */
function Piece({ tw, scenes }) {
  const { T, CUES, authoredTotal } = useComposition();
  const D = {};
  scenes.forEach((s) => { D[s.name] = s.dur; });
  const beat = (n) => ({ t0: CUES[n], t1: CUES[n] + D[n] });
  const q = beat('Question'), np = beat('NotPaper'), wi = beat('Witnesses'), st = beat('StopMark'),
    dr = beat('Drift'), lt = beat('LowerThird'), ti = beat('TitleCard'), sr = beat('Structure'),
    dm = beat('Domains'), nt = beat('NotThis'), ii = beat('ItIs'), sc = beat('Scripture'),
    br = beat('Bring'), sw = beat('SixWeeks'), en = beat('EndCard');

  const capItems = [
    { at: q.t0 + 0.2, text: 'Can I ask you a personal question? What kind of life are you actually building right now?' },
    { at: np.t0, text: 'Not the one on paper. Not the highlight reel. The real one.' },
    { at: wi.t0, text: 'The one your calendar, your spending, your relationships, and even your energy would describe if they could talk.' },
    { at: st.t0, until: st.t0 + 0.1, text: '' },
    { at: dr.t0, text: 'Life gets full. Work expands. Responsibilities grow. And somewhere in all that motion, good men drift.' },
    { at: dr.t0 + 4.4, text: 'Not off a cliff. Just a little at a time — until the life we are living is not quite the one we meant to build.' },
    { at: lt.t0, text: "I'm Michael Gauthier, and I created a six-week experience for men ready to stop drifting and start building on purpose." },
    { at: ti.t0, until: ti.t0 + 0.1, text: '' },
    { at: sr.t0, text: 'It is built on a simple idea: your life is a structure.' },
    { at: sr.t0 + 4, text: 'It has a bedrock, a foundation, pillars, guardrails, habits, energy, and a legacy.' },
    { at: dm.t0, text: 'Over six weeks, with a group of men, you will look clearly at the whole structure.' },
    { at: dm.t0 + 5.5, text: 'You will choose one area for concentrated work without losing sight of the rest.' },
    { at: nt.t0, text: "Here's what it is not. This is not a lecture. It is not a place to pretend you have it all together. And it is not one more thing to do alone." },
    { at: ii.t0, text: 'It is a group of men willing to tell the truth, pray for one another, hold each other accountable, and actually follow through.' },
    { at: sc.t0, until: sc.t0 + 0.1, text: '' },
    { at: br.t0, text: "You don't need a polished story or all the answers. Bring a guide, a pen, and a willingness to be real. That is enough to begin." },
    { at: sw.t0, text: "Six weeks. One faithful step at a time. Say yes. Show up. Let's build something that lasts." },
    { at: en.t0, until: en.t0 + 0.1, text: '' },
  ];

  return (
    <BareCtx.Provider value={tw.plate !== 'footage' && !tw.keepScrims}>
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} data-screen-label={'t=' + Math.floor(T) + 's'}>
      <Plate mode={tw.plate} T={T} />
      {tw.bgOpacity > 0 && (
        <div style={{ position: 'absolute', inset: 0, background: tw.bgColor, opacity: clamp(tw.bgOpacity / 100, 0, 1), pointerEvents: 'none' }} />
      )}

      <Beat from={q.t0} to={q.t1}><BQuestion T={T} t0={q.t0} /></Beat>
      <Beat from={np.t0} to={np.t1}><BNotPaper T={T} t0={np.t0} /></Beat>
      <Beat from={wi.t0} to={wi.t1}><BWitnesses T={T} t0={wi.t0} /></Beat>
      <Beat from={st.t0} to={st.t1}><BStop T={T} t0={st.t0} /></Beat>
      <Beat from={dr.t0} to={dr.t1}><BDrift T={T} t0={dr.t0} /></Beat>
      <Beat from={lt.t0} to={lt.t1}><BLowerThird T={T} t0={lt.t0} tw={tw} /></Beat>
      <Beat from={ti.t0} to={ti.t1}><BTitle T={T} t0={ti.t0} tw={tw} /></Beat>
      <Beat from={sr.t0} to={sr.t1}><BStructure T={T} t0={sr.t0} /></Beat>
      <Beat from={dm.t0} to={dm.t1}><BDomains T={T} t0={dm.t0} t1={dm.t1} tw={tw} /></Beat>
      <Beat from={nt.t0} to={nt.t1}><BNotThis T={T} t0={nt.t0} /></Beat>
      <Beat from={ii.t0} to={ii.t1}><BItIs T={T} t0={ii.t0} /></Beat>
      <Beat from={sc.t0} to={sc.t1}><BScripture T={T} t0={sc.t0} tw={tw} /></Beat>
      <Beat from={br.t0} to={br.t1}><BBring T={T} t0={br.t0} /></Beat>
      <Beat from={sw.t0} to={sw.t1}><BSixWeeks T={T} t0={sw.t0} /></Beat>
      <Beat from={en.t0} to={en.t1}><BEnd T={T} t0={en.t0} tw={tw} /></Beat>

      {/* persistent hairline progress rule */}
      <div style={{ position: 'absolute', left: 0, top: 0, height: 4, width: (1920 * clamp(T / (authoredTotal || 1), 0, 1)) + 'px', background: C.gold, opacity: tw.slate ? 0.9 : 0 }} />
      {tw.slate && <Slate T={T} scenes={scenes} total={authoredTotal} />}

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
/* --------------------------------------------------------------------- root */
function OverlayKit() {
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
      <CompositionStage width={1920} height={1080} bg={tw.plate === 'transparent' ? 'transparent' : (tw.plate === 'chroma key' ? '#00B140' : '#000')}
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
        <TweakText label="Challenge title" value={tw.challengeTitle} onChange={(v) => setTweak('challengeTitle', v)} />
        <TweakText label="Subtitle" value={tw.subtitle} onChange={(v) => setTweak('subtitle', v)} />
        <TweakSelect label="Focus area" value={tw.focusArea} options={DOMAINS} onChange={(v) => setTweak('focusArea', v)} />
        <TweakText label="Week label" value={tw.weekLabel} onChange={(v) => setTweak('weekLabel', v)} />
        <TweakText label="Scripture ref" value={tw.scriptureRef} onChange={(v) => setTweak('scriptureRef', v)} />
        <TweakText label="URL" value={tw.url} onChange={(v) => setTweak('url', v)} />
      </TweaksPanel>
    </div>
  );
}
window.OverlayKit = OverlayKit;
