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
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 128, lineHeight: 1.02, color: C.white, marginTop: 22, ...rise(MOTION.enter(t0 + 0.7, 0.9)(T), 44) }}>{tw.episodeTitle}</div>
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

/* ON SCREEN: THE FOUR PILLARS */
const PILLARS = [
  ['Family', 'The people entrusted to you'],
  ['Fitness', 'The body that carries your calling'],
  ['Fun', 'Joy, rest, adventure, memories'],
  ['Finances', 'Resources serving your purpose'],
];
function BPillarsCard({ T, t0 }) {
  const slab = clamp(MOTION.pop(t0 + 0.2, 0.8)(T), 0, 1);
  const PW = 120; // column render width (302:1060 svg, cropped view)
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, right: 140, top: 148, textAlign: 'center' }}>
        <div style={{ ...caps(26, C.gold, 12), opacity: clamp(MOTION.enter(t0 + 0.15, 0.7)(T), 0, 1) }}>Layer 03</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 116, color: C.white, marginTop: 14, ...rise(MOTION.enter(t0 + 0.3, 0.9)(T), 30) }}>The Four Pillars</div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 388, display: 'flex', gap: 30, alignItems: 'flex-end' }}>
        {PILLARS.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 1.0 + i * 0.5, 0.85)(T), 0, 1);
          const wordP = clamp(MOTION.enter(t0 + 1.45 + i * 0.5, 0.6)(T), 0, 1);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* classical column, revealed bottom-up */}
              <div style={{ height: 320, width: PW, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', left: 0, right: 0, bottom: 0, height: 320 * p, overflow: 'hidden',
                  display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                }}>
                  <img src={(window.SOLO_SCENE ? '../' : './') + 'pillar-design.svg'} alt="" style={{ height: 320, width: 'auto', display: 'block' }} />
                </div>
              </div>
              <div style={{ ...caps(28, C.cream, 3), marginTop: 24, opacity: wordP, transform: 'translateY(' + (1 - wordP) * 12 + 'px)' }}>{h}</div>
              <div style={{ ...caps(18, 'rgba(244,241,234,0.7)', 2.2), marginTop: 12, height: 52, textAlign: 'center', lineHeight: 1.5, opacity: clamp(MOTION.enter(t0 + 1.7 + i * 0.5, 0.7)(T), 0, 1) }}>{sub}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 856, height: 16, background: C.gold, transform: 'scaleX(' + slab + ')' }} />
    </div>
  );
}

/* uneven pillars */
function BUneven({ T, t0 }) {
  const heights = [250, 110, 90, 230];
  const labels = ['Career', 'Marriage', 'Health', 'Bank account'];
  const line = clamp(MOTION.draw(t0 + 2.6, 1.2)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 168 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 74, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 24) }}>
          Almost every man's pillars are <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>uneven.</em>
        </div>
        <div style={{ position: 'relative', display: 'flex', gap: 34, alignItems: 'flex-end', marginTop: 40, height: 300 }}>
          {heights.map((h, i) => {
            const p = clamp(MOTION.pop(t0 + 0.9 + i * 0.3, 0.7)(T), 0, 1);
            const thin = h < 150;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* uneven column: same classical design, cut to its height */}
                <div style={{ height: h, width: 72, position: 'relative', overflow: 'hidden', opacity: thin ? 0.45 : 1 }}>
                  <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', height: h * p, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <img src={(window.SOLO_SCENE ? '../' : './') + 'pillar-design.svg'} alt="" style={{ height: 250, width: 'auto', display: 'block' }} />
                  </div>
                </div>
                <div style={{ ...caps(22, thin ? 'rgba(244,241,234,0.6)' : C.cream, 3), marginTop: 16, textAlign: 'center' }}>{labels[i]}</div>
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 296, height: 2, background: C.gold, opacity: 0.55, transform: 'scaleX(' + line + ')', transformOrigin: 'left' }} />
        </div>
      </div>
    </div>
  );
}

/* one weak pillar loads the others */
function BConnected({ T, t0 }) {
  const items = [
    ['When health tanks', 'patience at home goes with it'],
    ['When money is stress', 'it steals your presence'],
    ['When joy disappears', 'life becomes brittle'],
  ];
  const load = clamp(MOTION.enter(t0 + 5.4, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.9 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 180 }}>
        <Kicker text="These pillars are connected" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 300 }}>
        {items.map(([a, b], i) => {
          const p = clamp(MOTION.enter(t0 + 0.6 + i * 1.5, 0.7)(T), 0, 1);
          const arrow = clamp(MOTION.draw(t0 + 1.05 + i * 1.5, 0.6)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 34, ...rise(p, 22) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 54, color: 'rgba(244,241,234,0.66)', width: 620 }}>{a}</span>
              <svg width={110} height={20}><DrawPath d="M0,10 L96,10" p={arrow} color={C.gold} w={2} cap="butt" />
                <path d="M92,4 L104,10 L92,16" fill="none" stroke={C.gold} strokeWidth={2} opacity={arrow > 0.9 ? 1 : 0} /></svg>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 58, color: C.white }}>{b}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 780, opacity: load, transform: 'translateY(' + (1 - load) * 22 + 'px)' }}>
        <div style={{ width: 1640 * load, height: 3, background: C.goldLite, marginBottom: 30 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 82, color: C.white }}>
          One weak pillar quietly <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>loads the others.</em>
        </div>
      </div>
    </div>
  );
}

function BScripture({ T, t0, tw }) {
  const z = 1 + 0.05 * clamp(MOTION.draw(t0, 7)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Dim o={0.95 * clamp(MOTION.enter(t0, 0.8)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'scale(' + z + ')' }}>
        <div style={{ maxWidth: 1500, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', textWrap: 'balance', fontSize: 76, lineHeight: 1.18, color: C.white }}>
          <span style={{ ...rise(MOTION.enter(t0 + 0.4, 1)(T), 18), display: 'inline-block' }}>“Whoever can be trusted with very little</span>{' '}
          <span style={{ ...rise(MOTION.enter(t0 + 1.5, 1)(T), 18), display: 'inline-block' }}>can also be trusted with much.”</span>
        </div>
        <div style={{ width: 160 * clamp(MOTION.enter(t0 + 2.5, 0.8)(T), 0, 1), height: 2, background: C.gold, margin: '46px 0 26px' }} />
        <div style={{ ...caps(26, C.goldLite, 8), opacity: clamp(MOTION.enter(t0 + 2.7, 0.8)(T), 0, 1) }}>{tw.scriptureRef}</div>
      </div>
    </div>
  );
}

/* ON SCREEN: FOCUS ONE • STEWARD ALL FOUR */
function BRhythm({ T, t0, tw }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 1.6, 0.9)(T), 0, 1);
  const dot = clamp(MOTION.pop(t0 + 1.3, 0.6)(T), 0, 1);
  const fi = Math.max(0, PILLARS.findIndex((p) => p[0] === tw.focusPillar));
  const lock = clamp(MOTION.enter(t0 + 2.6, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.94 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44 }}>
        <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 104, color: C.white, ...rise(a, 26) }}>Focus one</span>
        <span style={{ width: 16, height: 16, borderRadius: '50%', background: C.gold, transform: 'scale(' + dot + ')' }} />
        <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 104, color: C.goldLite, fontStyle: 'italic', ...rise(b, 26) }}>Steward all four</span>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 430, display: 'flex', gap: 30, alignItems: 'flex-end' }}>
        {PILLARS.map(([h], i) => {
          const on = i === fi;
          const p = clamp(MOTION.enter(t0 + 2.2 + i * 0.2, 0.6)(T), 0, 1);
          const H = on ? 320 : 230;
          return (
            <div key={i} style={{ flex: 1, opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* classical column, gold when it is the focus pillar */}
              <div style={{ height: H, width: on ? 96 : 72, position: 'relative', overflow: 'hidden', opacity: on ? 1 : 1 - 0.45 * lock }}>
                <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', height: H * p, overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <img src={(window.SOLO_SCENE ? '../' : './') + (on ? 'pillar-design-gold.svg' : 'pillar-design.svg')} alt=""
                    style={{ height: on ? 320 : 250, width: 'auto', display: 'block' }} />
                </div>
              </div>
              <div style={{ ...caps(26, on ? C.goldLite : C.cream, 3), marginTop: 20, textAlign: 'center' }}>{h}</div>
              <div style={{ ...caps(18, on ? C.goldLite : 'rgba(244,241,234,0.5)', 3), marginTop: 12, textAlign: 'center', opacity: lock }}>
                {on ? 'Focus pillar' : 'One faithful touch'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* one faithful touch each */
const TOUCHES = [
  ['Family', 'One act of presence'],
  ['Fitness', 'One choice that supports it'],
  ['Fun', 'One moment of joy or renewal'],
  ['Finances', 'One purposeful decision'],
];
function BTouches({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 168 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 70, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 22) }}>
          Not four new programs. <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>Simple evidence.</em>
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 42 }}>
          {TOUCHES.map(([h, sub], i) => {
            const p = clamp(MOTION.enter(t0 + 0.9 + i * 0.45, 0.7)(T), 0, 1);
            return (
              <div key={i} style={{ flex: 1, ...rise(p, 28) }}>
                <div style={{ height: 3, background: C.gold, transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
                <div style={{ ...caps(28, C.cream, 3), marginTop: 20 }}>{h}</div>
                <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 38, color: 'rgba(244,241,234,0.78)', marginTop: 12, lineHeight: 1.18 }}>{sub}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* rate 1-10 */
function BRate({ T, t0 }) {
  const scores = [7, 4, 3, 8];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 175 }}>
        <Kicker text="Rate every pillar — one to ten" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
        <div style={{ ...caps(23, 'rgba(244,241,234,0.62)', 3), marginTop: 22 }}>One win and one concern in each</div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 330 }}>
        {PILLARS.map(([h], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 0.75, 0.7)(T), 0, 1);
          const fill = clamp(MOTION.draw(t0 + 1.0 + i * 0.75, 1.2)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 30, ...rise(p, 20) }}>
              <span style={{ ...caps(28, C.cream, 3), width: 260 }}>{h}</span>
              <span style={{ flex: 1, display: 'flex', gap: 9 }}>
                {Array.from({ length: 10 }).map((_, j) => (
                  <span key={j} style={{
                    flex: 1, height: 32,
                    background: j < Math.round(scores[i] * fill) ? C.gold : 'rgba(244,241,234,0.14)',
                  }} />
                ))}
              </span>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 46, color: C.goldLite, width: 90, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{Math.round(scores[i] * fill)}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 760, ...caps(23, 'rgba(244,241,234,0.6)', 3), opacity: clamp(MOTION.enter(t0 + 4.2, 0.8)(T), 0, 1), lineHeight: 1.6 }}>
        Use your calendar, habits, relationships, health, and spending as evidence
      </div>
    </div>
  );
}

const WORK = [
  ['Rate all four pillars', 'One win and one concern in each — from the evidence, not the aspiration.'],
  ['Choose your Focus Pillar', 'Then write one meaningful first step for this week.'],
  ['Name one faithful touch for the other three', 'Simple enough to do. Real enough to matter.'],
];
function BTheWork({ T, t0, tw }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 170 }}>
        <Kicker text={'Your pre-work · ' + tw.weekLabel} p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 290 }}>
        {WORK.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 1.5, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', gap: 44, alignItems: 'flex-start', paddingBottom: 38, marginBottom: 38, borderBottom: '1px solid rgba(244,241,234,' + 0.2 * p + ')', ...rise(p, 26) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.gold, width: 100 }}>{'0' + (i + 1)}</span>
              <span>
                <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 60, color: C.white, lineHeight: 1.06 }}>{h}</span>
                <span style={{ display: 'block', ...caps(23, 'rgba(244,241,234,0.72)', 3), marginTop: 16 }}>{sub}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* not perfect balance — faithful stewardship */
function BNotBalance({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 1.8, 0.9)(T), 0, 1);
  const rule = clamp(MOTION.draw(t0 + 1.2, 0.8)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 190, width: 1560 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 82, color: 'rgba(244,241,234,0.68)', ...rise(a, 26) }}>
          The goal is not perfect balance.
        </div>
        <div style={{ width: 460 * rule, height: 2, background: C.gold, margin: '26px 0' }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 100, color: C.white, ...rise(b, 26) }}>
          It is <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>faithful stewardship.</em>
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
  const lines = ['Do the work.', 'Focus one.', 'Steward all four.'];
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
  const lt = beat('LowerThird'), ti = beat('TitleCard'), pc = beat('PillarsCard'), un = beat('Uneven'),
    cn = beat('Connected'), sc = beat('Scripture'), rh = beat('Rhythm'), tc = beat('Touches'),
    ra = beat('Rate'), wk = beat('TheWork'), nb = beat('NotBalance'), pr = beat('Prayer'), nx = beat('NextUp');

  const capItems = [
    { at: lt.t0, text: 'Welcome to week three. Now we come up to the part of the structure everyone can see.' },
    { at: ti.t0, until: ti.t0 + 0.1, text: '' },
    { at: pc.t0, text: 'Family. Fitness. Fun. Finances. Not four hobbies — four areas of stewardship.' },
    { at: un.t0, text: 'A strong career beside a thin marriage. A healthy bank account beside a body quietly breaking down.' },
    { at: cn.t0, text: 'These pillars are connected. One weak pillar quietly loads the others.' },
    { at: sc.t0, until: sc.t0 + 0.1, text: '' },
    { at: rh.t0, text: 'Here is the rhythm for the rest of this challenge: focus one, steward all four.' },
    { at: tc.t0, text: 'Give each of the other three one faithful touch every week.' },
    { at: ra.t0, text: 'Rate every pillar from one to ten and name one win and one concern in each.' },
    { at: wk.t0, text: 'Then choose your Focus Pillar and write one meaningful first step for this week.' },
    { at: nb.t0, text: 'The goal is not perfect balance. It is faithful stewardship.' },
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
      <Beat from={pc.t0} to={pc.t1}><BPillarsCard T={T} t0={pc.t0} /></Beat>
      <Beat from={un.t0} to={un.t1}><BUneven T={T} t0={un.t0} /></Beat>
      <Beat from={cn.t0} to={cn.t1}><BConnected T={T} t0={cn.t0} /></Beat>
      <Beat from={sc.t0} to={sc.t1}><BScripture T={T} t0={sc.t0} tw={tw} /></Beat>
      <Beat from={rh.t0} to={rh.t1}><BRhythm T={T} t0={rh.t0} tw={tw} /></Beat>
      <Beat from={tc.t0} to={tc.t1}><BTouches T={T} t0={tc.t0} /></Beat>
      <Beat from={ra.t0} to={ra.t1}><BRate T={T} t0={ra.t0} /></Beat>
      <Beat from={wk.t0} to={wk.t1}><BTheWork T={T} t0={wk.t0} tw={tw} /></Beat>
      <Beat from={nb.t0} to={nb.t1}><BNotBalance T={T} t0={nb.t0} /></Beat>
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

function Week3Kit() {
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
        <TweakSelect label="Focus pillar" value={tw.focusPillar} options={['Family', 'Fitness', 'Fun', 'Finances']} onChange={(v) => setTweak('focusPillar', v)} />
        <TweakText label="Scripture ref" value={tw.scriptureRef} onChange={(v) => setTweak('scriptureRef', v)} />
        <TweakText label="Next up" value={tw.nextUp} onChange={(v) => setTweak('nextUp', v)} />
        <TweakText label="URL" value={tw.url} onChange={(v) => setTweak('url', v)} />
      </TweaksPanel>
    </div>
  );
}
window.Week3Kit = Week3Kit;
