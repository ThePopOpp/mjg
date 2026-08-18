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
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 132, lineHeight: 1.02, color: C.white, marginTop: 22, ...rise(MOTION.enter(t0 + 0.7, 0.9)(T), 44) }}>{tw.episodeTitle}</div>
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

/* a blueprint tells you where — not why */
function BWhereWhy({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.8)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 2.0, 0.9)(T), 0, 1);
  const walls = clamp(MOTION.draw(t0 + 0.4, 2.0)(T), 0, 1);
  const inner = clamp(MOTION.draw(t0 + 1.5, 1.6)(T), 0, 1);
  const marks = clamp(MOTION.enter(t0 + 2.6, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 176, width: 1560 }}>
        <svg width={640} height={365} viewBox="0 0 640 365" style={{ marginBottom: 22, overflow: 'visible' }}>
          {/* outer wall */}
          <DrawPath d="M20,290 L20,30 L470,30 L470,290 L20,290" p={walls} color="rgba(244,241,234,0.75)" w={4} cap="butt" />
          {/* interior walls with door gaps */}
          <DrawPath d="M20,160 L150,160 M210,160 L300,160" p={inner} color="rgba(244,241,234,0.5)" w={2.5} cap="butt" />
          <DrawPath d="M300,30 L300,110 M300,168 L300,290" p={inner} color="rgba(244,241,234,0.5)" w={2.5} cap="butt" />
          {/* door swings */}
          <DrawPath d="M210,160 A58,58 0 0 1 152,102" p={inner} color="rgba(244,241,234,0.35)" w={1.6} cap="butt" />
          <DrawPath d="M300,168 A56,56 0 0 1 356,112" p={inner} color="rgba(244,241,234,0.35)" w={1.6} cap="butt" />
          {/* dimension line */}
          <g opacity={marks}>
            <line x1={20} y1={318} x2={470} y2={318} stroke={C.gold} strokeWidth={1.4} />
            <line x1={20} y1={311} x2={20} y2={325} stroke={C.gold} strokeWidth={1.4} />
            <line x1={470} y1={311} x2={470} y2={325} stroke={C.gold} strokeWidth={1.4} />
            <text x={245} y={352} textAnchor="middle" fill={C.goldLite} fontFamily={SANS} fontWeight="700" fontSize={17} letterSpacing="3">WHERE</text>
            <text x={85} y={230} fill="rgba(244,241,234,0.45)" fontFamily={SANS} fontWeight="600" fontSize={15} letterSpacing="2.5">ROOM</text>
            <text x={85} y={100} fill="rgba(244,241,234,0.45)" fontFamily={SANS} fontWeight="600" fontSize={15} letterSpacing="2.5">ROOM</text>
            <text x={360} y={230} fill="rgba(244,241,234,0.45)" fontFamily={SANS} fontWeight="600" fontSize={15} letterSpacing="2.5">ROOM</text>
          </g>
        </svg>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 68, color: 'rgba(244,241,234,0.7)', ...rise(a, 22) }}>
          A blueprint tells you where the walls go.
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 92, color: C.white, marginTop: 16, ...rise(b, 26) }}>
          It cannot tell you <em style={{ fontStyle: 'italic', color: C.goldLite }}>why the house is being built.</em>
        </div>
      </div>
    </div>
  );
}

/* ON SCREEN: BEDROCK — Faith & Identity */
function BBedrockCard({ T, t0 }) {
  const p = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const slab = clamp(MOTION.pop(t0 + 0.15, 0.8)(T), 0, 1);
  const rule = clamp(MOTION.draw(t0 + 1.1, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...caps(26, C.gold, 12), opacity: p }}>Layer 01</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 190, lineHeight: 1, color: C.white, margin: '26px 0 8px', ...rise(p, 40) }}>Bedrock</div>
        <div style={{ width: 620 * slab, height: 20, background: C.gold, margin: '18px 0 34px' }} />
        <div style={{ ...caps(34, C.cream, 8), opacity: clamp(rule, 0, 1) }}>Faith & Identity</div>
      </div>
    </div>
  );
}

/* what is your life rooted in — four unstable footings */
const FOOTINGS = ['Performance', 'Approval', 'Income', 'Control'];
function BRootedIn({ T, t0, t1 }) {
  const shake = clamp(MOTION.enter(t0 + 7.8, 1.2)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.9 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 158 }}>
        <Kicker text="One question" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 96, color: C.white, marginTop: 26, ...rise(MOTION.enter(t0 + 0.4, 0.9)(T), 30) }}>
          What is your life actually <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>rooted in?</em>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 470, display: 'flex', gap: 30 }}>
        {FOOTINGS.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 1.5 + i * 0.55, 0.7)(T), 0, 1);
          const w = shake * (2.5 + i * 0.6);
          const tilt = shake * (i % 2 === 0 ? -2.2 : 2.6);
          return (
            <div key={i} style={{
              flex: 1, height: 240, position: 'relative', boxSizing: 'border-box',
              border: '1px solid rgba(244,241,234,' + (0.2 + 0.24 * p) + ')',
              background: 'rgba(26,46,59,' + 0.5 * p + ')',
              opacity: p * (1 - 0.35 * shake),
              transform: 'translateX(' + Math.sin(T * 9 + i) * w + 'px) rotate(' + tilt + 'deg)',
              transformOrigin: 'bottom center',
            }}>
              <div style={{ position: 'absolute', left: 26, top: 24, fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 32, color: C.gold }}>{'0' + (i + 1)}</div>
              <div style={{ position: 'absolute', left: 26, right: 26, bottom: 30, ...caps(30, C.cream, 3) }}>{s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 790, opacity: shake, transform: 'translateY(' + (1 - shake) * 22 + 'px)' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 76, color: C.white, textAlign: 'center' }}>
          When those things shake, <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>you shake with them.</em>
        </div>
      </div>
    </div>
  );
}

/* received before achieved */
function BReceived({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 2.2, 0.9)(T), 0, 1);
  const rule = clamp(MOTION.draw(t0 + 1.4, 0.8)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 178, width: 1560 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 88, color: C.white, ...rise(a, 26) }}>
          Your identity is <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>received</em> before it is achieved.
        </div>
        <div style={{ width: 520 * rule, height: 2, background: C.gold, margin: '30px 0' }} />
        <div style={{ display: 'flex', gap: 60, alignItems: 'baseline', ...rise(b, 24) }}>
          <span style={{ ...caps(30, C.cream, 4) }}>You work <span style={{ color: C.goldLite }}>from</span> worth</span>
          <span style={{ ...caps(30, 'rgba(244,241,234,0.55)', 4) }}>Not <span style={{ color: C.goldLite }}>for</span> it</span>
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
          <span style={{ ...rise(MOTION.enter(t0 + 0.4, 1)(T), 18), display: 'inline-block' }}>“Above all else, guard your heart,</span>{' '}
          <span style={{ ...rise(MOTION.enter(t0 + 1.6, 1)(T), 18), display: 'inline-block' }}>for everything you do flows from it.”</span>
        </div>
        <div style={{ width: 160 * clamp(MOTION.enter(t0 + 2.6, 0.8)(T), 0, 1), height: 2, background: C.gold, margin: '46px 0 26px' }} />
        <div style={{ ...caps(26, C.goldLite, 8), opacity: clamp(MOTION.enter(t0 + 2.8, 0.8)(T), 0, 1) }}>{tw.scriptureRef}</div>
      </div>
    </div>
  );
}

/* compartment vs center */
const SPOKES = ['Love', 'Lead', 'Work', 'Spend', 'Rest', 'Respond'];
function BCenter({ T, t0 }) {
  const R = 175;
  const core = clamp(MOTION.pop(t0 + 0.5, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 150 }}>
        <Kicker text="It is the center that shapes everything" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: 270, width: 640, height: 560, marginLeft: -320 }}>
        <svg width={640} height={560} viewBox="0 0 640 560" style={{ overflow: 'visible' }}>
          {/* spokes draw out of the circle edge one at a time */}
          {SPOKES.map((s, i) => {
            const line = clamp(MOTION.draw(t0 + 1.5 + i * 0.85, 0.55)(T), 0, 1);
            const ang = (-90 + i * 60) * Math.PI / 180;
            const x0 = 320 + Math.cos(ang) * 96, y0 = 275 + Math.sin(ang) * 96;
            const x1 = 320 + Math.cos(ang) * R, y1 = 275 + Math.sin(ang) * R;
            return <line key={i}
              x1={x0} y1={y0}
              x2={x0 + (x1 - x0) * line} y2={y0 + (y1 - y0) * line}
              stroke="rgba(201,169,110,0.75)" strokeWidth={2} opacity={line > 0 ? 1 : 0} />;
          })}
          <circle cx={320} cy={275} r={92 * core} fill={C.gold} />
          <text x={320} y={287} textAnchor="middle" fill={C.ink} fontFamily={SANS} fontWeight="700" fontSize={30} letterSpacing="3" opacity={core > 0.85 ? 1 : 0}>FAITH</text>
          {/* each word fades in after its line finishes */}
          {SPOKES.map((s, i) => {
            const word = clamp(MOTION.enter(t0 + 2.1 + i * 0.85, 0.55)(T), 0, 1);
            const ang = (-90 + i * 60) * Math.PI / 180;
            const x = 320 + Math.cos(ang) * (R + 52), y = 275 + Math.sin(ang) * (R + 52);
            return <text key={i} x={x} y={y + 9} textAnchor="middle" fill={C.cream}
              fontFamily={SANS} fontWeight="700" fontSize={27} letterSpacing="3" opacity={word}>{s.toUpperCase()}</text>;
          })}
        </svg>
      </div>
    </div>
  );
}

/* the foundation's four parts */
const FOUNDATION = [
  ['Mission', 'What you are here to do in this season'],
  ['Values', 'The convictions that guide your decisions'],
  ['Life verse', 'Truth you want to stand on'],
  ['Daily purpose', 'How you show up in the life in front of you'],
];
function BFoundation({ T, t0 }) {
  const slab = clamp(MOTION.pop(t0 + 0.3, 0.8)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 150 }}>
        <div style={{ ...caps(26, C.gold, 12), opacity: clamp(MOTION.enter(t0 + 0.15, 0.7)(T), 0, 1) }}>Layer 02</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 104, color: C.white, marginTop: 14, ...rise(MOTION.enter(t0 + 0.3, 0.9)(T), 30) }}>Foundation</div>
        <div style={{ width: 1640 * slab, height: 4, background: C.gold, marginTop: 26 }} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 470, display: 'flex', gap: 26 }}>
        {FOUNDATION.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 1.1 + i * 0.9, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ flex: 1, ...rise(p, 30) }}>
              <div style={{ height: 3, background: C.gold, transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 30, color: C.gold, marginTop: 22 }}>{'0' + (i + 1)}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 58, color: C.white, marginTop: 10, lineHeight: 1.06 }}>{h}</div>
              <div style={{ ...caps(21, 'rgba(244,241,234,0.7)', 2.6), marginTop: 18, lineHeight: 1.5 }}>{sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* messy true beats polished */
function BMessyTrue({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 1.9, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 180, width: 1560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40, ...rise(a, 24) }}>
          <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 84, color: C.white }}>A <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>messy true</em> mission</span>
          <span style={{ ...caps(28, C.gold, 6) }}>beats</span>
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 76, color: 'rgba(244,241,234,0.68)', marginTop: 18, ...rise(b, 24) }}>
          a polished one you never live by.
        </div>
      </div>
    </div>
  );
}

/* values as filters */
const FILTERS = ['Time', 'Energy', 'Attention', 'Resources'];
function BFilters({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 172 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 76, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 24) }}>
          Values are not words you admire.{' '}
          <span style={{ whiteSpace: 'nowrap' }}>They are <em style={{ fontStyle: 'italic', color: C.goldLite }}>filters.</em></span>
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
          {FILTERS.map((s, i) => {
            const p = clamp(MOTION.enter(t0 + 1.0 + i * 0.42, 0.7)(T), 0, 1);
            return (
              <div key={i} style={{ flex: 1, ...rise(p, 28) }}>
                <div style={{ height: 3, background: C.gold, transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
                <div style={{ ...caps(32, C.cream, 3), marginTop: 20 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* the audit question */
const EVIDENCE = ['Your calendar', 'Your choices', 'Your relationships', 'Your spending'];
function BAudit({ T, t0, t1 }) {
  const q = clamp(MOTION.enter(t0 + 5.6, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 190 }}>
        <Kicker text="If I looked at" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 290 }}>
        {EVIDENCE.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 0.6 + i * 0.75, 0.7)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 34, paddingBottom: 18, marginBottom: 16, borderBottom: '1px solid rgba(244,241,234,' + 0.18 * p + ')', ...rise(p, 22) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 34, color: C.gold, width: 70 }}>{'0' + (i + 1)}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 60, color: C.white }}>{s}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 800, opacity: q, transform: 'translateY(' + (1 - q) * 24 + 'px)' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 82, color: C.white }}>
          would I be able to see <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>what matters most to you?</em>
        </div>
      </div>
    </div>
  );
}

const WORK = [
  ['Circle your values — narrow to five', 'Not the ones you admire. The ones you actually filter by.'],
  ['Write one clear sentence of mission', 'Rough is fine. A first draft on paper beats a perfect one in your head.'],
  ['Choose a life verse', 'Truth you want to stand on when it gets heavy.'],
];
function BTheWork({ T, t0, tw }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 170 }}>
        <Kicker text={'Open your guide · ' + tw.weekLabel} p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 290 }}>
        {WORK.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 1.5, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', gap: 44, alignItems: 'flex-start', paddingBottom: 40, marginBottom: 40, borderBottom: '1px solid rgba(244,241,234,' + 0.2 * p + ')', ...rise(p, 26) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.gold, width: 100 }}>{'0' + (i + 1)}</span>
              <span>
                <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 64, color: C.white, lineHeight: 1.06 }}>{h}</span>
                <span style={{ display: 'block', ...caps(23, 'rgba(244,241,234,0.72)', 3), marginTop: 16 }}>{sub}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* every open door is not your door */
function BOpenDoor({ T, t0 }) {
  const doors = [0, 1, 2, 3, 4];
  const settle = clamp(MOTION.enter(t0 + 4.2, 1.1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 168 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 78, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 24) }}>
          Every open door stops looking like <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>your door.</em>
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 44 }}>
          {doors.map((d, i) => {
            const mine = i === 2;
            /* one door at a time: frame draws, then the leaf swings open */
            const start = t0 + 1.0 + i * 0.55;
            const frame = clamp(MOTION.draw(start, 0.5)(T), 0, 1);
            const swing = clamp(MOTION.pop(start + 0.35, 0.7)(T), 0, 1);
            const open = 52 * swing * (mine ? 1.25 : 1);
            return (
              <div key={i} style={{ flex: 1, position: 'relative', height: 210, opacity: mine ? 1 : 1 - 0.55 * settle, perspective: '700px' }}>
                <svg width="100%" height="210" viewBox="0 0 260 210" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
                  <DrawPath d="M6,206 L6,6 L254,6 L254,206" p={frame} color={mine ? C.gold : 'rgba(244,241,234,0.42)'} w={4} cap="butt" />
                </svg>
                {/* the door leaf, swinging open on its hinge */}
                <div style={{
                  position: 'absolute', left: 10, top: 10, bottom: 4, width: 240,
                  background: mine ? 'rgba(201,169,110,' + (0.35 + 0.6 * settle) + ')' : 'rgba(26,46,59,0.72)',
                  borderRight: '2px solid ' + (mine ? C.goldLite : 'rgba(244,241,234,0.28)'),
                  transform: 'rotateY(' + (-open) + 'deg)', transformOrigin: 'left center',
                  opacity: frame,
                }}>
                  <div style={{ position: 'absolute', right: 16, top: '50%', width: 11, height: 11, marginTop: -5, borderRadius: '50%', background: mine ? C.ink : 'rgba(244,241,234,0.5)' }} />
                </div>
              </div>
            );
          })}
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
  const lines = ['Do the work.', 'Bring your draft.', 'Build from truth.'];
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
  const lt = beat('LowerThird'), ti = beat('TitleCard'), ww = beat('WhereWhy'), bc = beat('BedrockCard'),
    ri = beat('RootedIn'), rc = beat('Received'), sc = beat('Scripture'), ce = beat('Center'),
    fo = beat('Foundation'), mt = beat('MessyTrue'), fi = beat('Filters'), au = beat('Audit'),
    wk = beat('TheWork'), od = beat('OpenDoor'), pr = beat('Prayer'), nx = beat('NextUp');

  const capItems = [
    { at: lt.t0, text: 'Welcome to week two. This week we go underneath, to the two layers everything else rests on.' },
    { at: ti.t0, until: ti.t0 + 0.1, text: '' },
    { at: ww.t0, text: 'A man can be incredibly disciplined while aiming all that discipline at the wrong definition of a good life.' },
    { at: bc.t0, until: bc.t0 + 0.1, text: '' },
    { at: ri.t0, text: 'Bedrock answers one question: what is your life actually rooted in? Where do you get your worth?' },
    { at: rc.t0, text: 'Your identity is received before it is achieved. You work from worth, not for it.' },
    { at: sc.t0, until: sc.t0 + 0.1, text: '' },
    { at: ce.t0, text: 'Faith is not a compartment you visit on Sundays. It is the center that shapes everything else.' },
    { at: fo.t0, text: 'On top of the bedrock you pour a foundation: mission, values, a life verse, and a daily purpose.' },
    { at: mt.t0, text: 'I am not asking for something impressive. I am asking for something real.' },
    { at: fi.t0, text: 'Your values become filters for what you say yes and no to.' },
    { at: au.t0, until: au.t0 + 0.1, text: '' },
    { at: wk.t0, text: 'Open your guide and draft it. Do not wait until it is perfect.' },
    { at: od.t0, text: 'You stop chasing things simply because you can, and start building what fits the man you are becoming.' },
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
      <Beat from={ww.t0} to={ww.t1}><BWhereWhy T={T} t0={ww.t0} /></Beat>
      <Beat from={bc.t0} to={bc.t1}><BBedrockCard T={T} t0={bc.t0} /></Beat>
      <Beat from={ri.t0} to={ri.t1}><BRootedIn T={T} t0={ri.t0} t1={ri.t1} /></Beat>
      <Beat from={rc.t0} to={rc.t1}><BReceived T={T} t0={rc.t0} /></Beat>
      <Beat from={sc.t0} to={sc.t1}><BScripture T={T} t0={sc.t0} tw={tw} /></Beat>
      <Beat from={ce.t0} to={ce.t1}><BCenter T={T} t0={ce.t0} /></Beat>
      <Beat from={fo.t0} to={fo.t1}><BFoundation T={T} t0={fo.t0} /></Beat>
      <Beat from={mt.t0} to={mt.t1}><BMessyTrue T={T} t0={mt.t0} /></Beat>
      <Beat from={fi.t0} to={fi.t1}><BFilters T={T} t0={fi.t0} /></Beat>
      <Beat from={au.t0} to={au.t1}><BAudit T={T} t0={au.t0} t1={au.t1} /></Beat>
      <Beat from={wk.t0} to={wk.t1}><BTheWork T={T} t0={wk.t0} tw={tw} /></Beat>
      <Beat from={od.t0} to={od.t1}><BOpenDoor T={T} t0={od.t0} /></Beat>
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

function Week2Kit() {
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
window.Week2Kit = Week2Kit;
