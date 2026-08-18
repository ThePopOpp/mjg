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

/* --------------------------------------------------------- week 4 beats */
function BLowerThird({ T, t0, tw }) {
  const bar = MOTION.draw(t0 + 0.15, 0.5)(T);
  const block = MOTION.enter(t0 + 0.3, 0.7)(T);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 152, width: 1140, height: 210 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,46,59,0.93)', transform: 'scaleX(' + clamp(block, 0, 1) + ')', transformOrigin: 'left' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, width: 14, height: 210 * clamp(bar, 0, 1), background: C.gold }} />
      <div style={{ position: 'absolute', left: 58, top: 42, right: 240, overflow: 'hidden', height: 130 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.white, ...rise(MOTION.enter(t0 + 0.6, 0.8)(T), 70) }}>{tw.presenter}</div>
        <div style={{ ...caps(23, C.cream, 4), marginTop: 14, ...rise(MOTION.enter(t0 + 0.95, 0.8)(T), 40) }}>Creator · The Stewardship Blueprint</div>
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
        <div style={{ ...caps(32, C.goldLite, 14), ...rise(MOTION.enter(t0 + 0.4, 0.8)(T), 22) }}>{tw.weekLabel}</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 118, lineHeight: 1.04, color: C.white, marginTop: 24, textAlign: 'center', maxWidth: 1500, ...rise(MOTION.enter(t0 + 0.7, 0.9)(T), 44) }}>{tw.episodeTitle}</div>
        <div style={{ width: 220 * cw, height: 3, background: C.gold, margin: '48px 0 32px' }} />
        <div style={{ ...caps(26, C.cream, 6), ...rise(MOTION.enter(t0 + 1.5, 0.9)(T), 18), textAlign: 'center' }}>{tw.subtitle}</div>
      </div>
      {[[110, 110, 1, 1], [1810, 110, -1, 1], [110, 970, 1, -1], [1810, 970, -1, -1]].map(([x, y, sx, sy], i) => (
        <svg key={i} width={90} height={90} style={{ position: 'absolute', left: x - (sx > 0 ? 0 : 90), top: y - (sy > 0 ? 0 : 90), opacity: cw, transform: 'scale(' + sx + ',' + sy + ')' }}>
          <path d={'M0,0 L' + 76 * cw + ',0 M0,0 L0,' + 76 * cw} stroke={C.gold} strokeWidth={3} />
        </svg>
      ))}
    </div>
  );
}

function BScriptureCard({ T, t0, a, b, refText }) {
  const z = 1 + 0.05 * clamp(MOTION.draw(t0, 7)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Dim o={0.95 * clamp(MOTION.enter(t0, 0.8)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: 'scale(' + z + ')' }}>
        <div style={{ maxWidth: 1520, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', textWrap: 'balance', fontSize: 74, lineHeight: 1.2, color: C.white }}>
          <span style={{ ...rise(MOTION.enter(t0 + 0.4, 1)(T), 18), display: 'inline-block' }}>{a}</span>{' '}
          <span style={{ ...rise(MOTION.enter(t0 + 1.5, 1)(T), 18), display: 'inline-block' }}>{b}</span>
        </div>
        <div style={{ width: 160 * clamp(MOTION.enter(t0 + 2.5, 0.8)(T), 0, 1), height: 2, background: C.gold, margin: '46px 0 26px' }} />
        <div style={{ ...caps(25, C.goldLite, 8), opacity: clamp(MOTION.enter(t0 + 2.7, 0.8)(T), 0, 1) }}>{refText}</div>
      </div>
    </div>
  );
}

function BWorkList({ T, t0, kicker, items }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 170 }}>
        <Kicker text={kicker} p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 290 }}>
        {items.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 1.5, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', gap: 44, alignItems: 'flex-start', paddingBottom: 36, marginBottom: 36, borderBottom: '1px solid rgba(244,241,234,' + 0.2 * p + ')', ...rise(p, 26) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 58, color: C.gold, width: 100 }}>{'0' + (i + 1)}</span>
              <span>
                <span style={{ display: 'block', fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 56, color: C.white, lineHeight: 1.08 }}>{h}</span>
                <span style={{ display: 'block', ...caps(22, 'rgba(244,241,234,0.72)', 3), marginTop: 16 }}>{sub}</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BPrayer({ T, t0 }) {
  const p = clamp(MOTION.enter(t0 + 0.3, 1.2)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', left: 140, bottom: 170, display: 'flex', alignItems: 'center', gap: 22, opacity: p }}>
      <span style={{ width: 90 * p, height: 1, background: 'rgba(201,169,110,0.9)' }} />
      <span style={{ ...caps(23, C.goldLite, 10) }}>A moment to pray</span>
    </div>
  );
}

function BNext({ T, t0, tw, lines }) {
  const p = MOTION.enter(t0 + 0.3, 1)(T);
  const drift = clamp(MOTION.draw(t0, 6.5)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Dim o={0.97 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: '50%', top: '50%', opacity: 0.045, transform: 'translate(-50%,-50%) scale(' + (1.05 + drift * 0.2) + ')' }}>
        <Monogram h={300} color={C.cream} />
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Monogram h={62} color={C.gold} style={{ opacity: clamp(p, 0, 1), marginBottom: 54 }} />
        <div style={{ display: 'flex', gap: 44, alignItems: 'baseline' }}>
          {lines.map((s, i) => (
            <span key={i} style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 64, color: i === lines.length - 1 ? C.white : 'rgba(244,241,234,0.8)', ...rise(MOTION.enter(t0 + 0.6 + i * 0.5, 0.8)(T), 24) }}>{s}</span>
          ))}
        </div>
        <div style={{ width: 220 * clamp(MOTION.enter(t0 + 2.4, 0.8)(T), 0, 1), height: 3, background: C.gold, margin: '52px 0 34px' }} />
        <div style={{ ...caps(28, C.goldLite, 10), ...rise(MOTION.enter(t0 + 2.7, 0.9)(T), 18) }}>{tw.nextUp}</div>
        <div style={{ ...caps(21, 'rgba(244,241,234,0.5)', 6), marginTop: 34, opacity: clamp(MOTION.enter(t0 + 3.2, 0.9)(T), 0, 1) }}>{tw.url}</div>
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
      <span style={caps(18, C.gold, 3)}>{'Overlay ' + String(idx + 1).padStart(2, '0') + ' / ' + scenes.length}</span>
      <span style={{ width: 1, height: 20, background: 'rgba(244,241,234,0.3)' }} />
      <span style={caps(18, C.cream, 3)}>{name}</span>
      <span style={{ width: 1, height: 20, background: 'rgba(244,241,234,0.3)' }} />
      <span style={{ fontFamily: SANS, fontSize: 18, color: 'rgba(244,241,234,0.7)', fontVariantNumeric: 'tabular-nums' }}>{mm + ':' + ss + ':' + ff}</span>
    </div>
  );
}

/* the mountain road — winding road, guardrail installs post by post before the edge */
function BRoad({ T, t0 }) {
  const road = clamp(MOTION.draw(t0 + 0.4, 2.0)(T), 0, 1);
  const cliff = clamp(MOTION.draw(t0 + 1.6, 1.2)(T), 0, 1);
  const rail = clamp(MOTION.draw(t0 + 2.8, 1.8)(T), 0, 1);
  const glow = clamp(MOTION.enter(t0 + 4.8, 0.9)(T), 0, 1);
  const label = clamp(MOTION.enter(t0 + 5.0, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 150 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 68, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 22) }}>
          Where do they put the guardrail?
        </div>
        <svg width={1640} height={310} viewBox="0 0 1640 310" style={{ marginTop: 24, overflow: 'visible' }}>
          {/* road edges sweeping around the bend */}
          <DrawPath d="M0,110 C420,106 900,116 1640,128" p={road} color="rgba(244,241,234,0.55)" w={3.5} cap="butt" />
          <DrawPath d="M0,168 C420,172 900,190 1640,258" p={road} color="rgba(244,241,234,0.28)" w={2.5} cap="butt" />
          {/* center dashes */}
          <DrawPath d="M0,140 C420,138 900,150 1640,190" p={road} color="rgba(244,241,234,0.22)" w={2} cap="butt" dash="22 26" />
          {/* the drop: hatching below the outer edge */}
          {[140, 340, 540, 740, 940, 1140, 1340, 1540].map((x, i) => {
            const y = 176 + (x / 1640) * 78;
            return <line key={i} x1={x} y1={y + 10} x2={x - 26} y2={y + 52}
              stroke="rgba(244,241,234,0.22)" strokeWidth={2}
              opacity={cliff > (i + 1) / 9 ? 1 : 0} />;
          })}
          {/* guardrail: two gold rails hugging the outer edge */}
          <DrawPath d="M0,196 C420,200 900,216 1640,282" p={rail} color={C.gold} w={7} cap="butt" />
          <DrawPath d="M0,214 C420,218 900,236 1640,304" p={rail} color="rgba(201,169,110,0.55)" w={3.5} cap="butt" />
          {/* posts pop in one at a time as the rail passes them */}
          {[90, 290, 490, 690, 890, 1090, 1290, 1490].map((x, i) => {
            const share = (i + 0.5) / 8;
            const pop = clamp((rail - share) * 9, 0, 1);
            const yTop = 196 + (x / 1640) * 80;
            return <g key={i} opacity={pop} transform={'scale(1,' + (0.3 + 0.7 * pop) + ')'} style={{ transformOrigin: x + 'px ' + (yTop + 36) + 'px' }}>
              <rect x={x - 5} y={yTop} width={10} height={40} fill={C.gold} />
              <circle cx={x} cy={yTop} r={7} fill={C.goldLite} />
            </g>;
          })}
          {/* soft glow along the finished rail */}
          <DrawPath d="M0,196 C420,200 900,216 1640,282" p={rail} color={'rgba(220,192,132,' + 0.35 * glow + ')'} w={16} cap="butt" />
        </svg>
        <div style={{ display: 'flex', gap: 60, marginTop: 10, opacity: label }}>
          <span style={{ ...caps(24, 'rgba(244,241,234,0.6)', 4) }}>Not at the bottom of the canyon</span>
          <span style={{ ...caps(24, C.goldLite, 4) }}>Before the edge</span>
        </div>
      </div>
    </div>
  );
}

/* ON SCREEN: GUARDRAILS */
function BGuardrailCard({ T, t0 }) {
  const p = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const slab = clamp(MOTION.pop(t0 + 0.15, 0.8)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...caps(25, C.gold, 12), opacity: p }}>Layer 04</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 168, lineHeight: 1, color: C.white, margin: '24px 0 8px', ...rise(p, 40) }}>Guardrails</div>
        <div style={{ width: 700 * slab, height: 16, background: C.gold, margin: '20px 0 34px' }} />
        <div style={{ ...caps(30, C.cream, 8), opacity: clamp(MOTION.enter(t0 + 1.1, 0.9)(T), 0, 1), textAlign: 'center' }}>Boundaries that protect what matters</div>
      </div>
    </div>
  );
}

/* decision made ahead of time */
const PRESSURES = ['Tired', 'Tempted', 'Lonely', 'Afraid', 'Under pressure'];
function BAheadOfTime({ T, t0, t1 }) {
  const done = clamp(MOTION.enter(t0 + 6.8, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.9 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 190 }}>
        <Kicker text="A decision you make ahead of time" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 76, color: C.white, marginTop: 26, ...rise(MOTION.enter(t0 + 0.4, 0.9)(T), 26) }}>
          Before you are —
        </div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 470, display: 'flex', gap: 22 }}>
        {PRESSURES.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 1.0 + i * 0.42, 0.6)(T), 0, 1);
          return (
            <div key={i} style={{ flex: 1, padding: '32px 20px', boxSizing: 'border-box', textAlign: 'center', border: '1px solid rgba(244,241,234,' + (0.18 + 0.2 * p) + ')', opacity: p * (1 - 0.4 * done), ...caps(27, C.cream, 3) }}>{s}</div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 720, opacity: done, transform: 'translateY(' + (1 - done) * 24 + 'px)' }}>
        <div style={{ width: 1640 * done, height: 3, background: C.goldLite, marginBottom: 30 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 86, color: C.white }}>
          So in the moment, the decision is <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>already made.</em>
        </div>
      </div>
    </div>
  );
}

/* good intentions are not guardrails */
function BIntentions({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.8)(T), 0, 1);
  const x = clamp(MOTION.draw(t0 + 1.3, 0.6)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 2.1, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 180, width: 1560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, ...rise(a, 22), opacity: a * (1 - 0.35 * x) }}>
          <svg width={52} height={52} viewBox="0 0 52 52">
            <rect x="1" y="1" width="50" height="50" fill="none" stroke="rgba(244,241,234,0.4)" strokeWidth="2" />
            <DrawPath d="M13,13 L39,39" p={clamp(x * 2, 0, 1)} color={C.gold} w={4} />
            <DrawPath d="M39,13 L13,39" p={clamp(x * 2 - 1, 0, 1)} color={C.gold} w={4} />
          </svg>
          <span style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', textWrap: 'balance', fontSize: 62, color: 'rgba(244,241,234,0.7)' }}>“I should be more careful.”</span>
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 84, color: C.white, marginTop: 30, ...rise(b, 26) }}>
          Good intentions are <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>not guardrails.</em>
        </div>
      </div>
    </div>
  );
}

/* flip the frame — protects what */
const PROTECTS = [
  ['A guardrail around your finances', 'protects future freedom'],
  ['A guardrail around your marriage', 'protects the intimacy you want'],
  ['A guardrail around your health', 'protects your capacity for everything else'],
];
function BProtects({ T, t0, t1 }) {
  const land = clamp(MOTION.enter(t0 + 7, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 175 }}>
        <Kicker text="Flip it" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 285 }}>
        {PROTECTS.map(([a, b], i) => {
          const p = clamp(MOTION.enter(t0 + 0.6 + i * 1.4, 0.7)(T), 0, 1);
          const arrow = clamp(MOTION.draw(t0 + 1.0 + i * 1.4, 0.6)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 34, ...rise(p, 22) }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 48, color: 'rgba(244,241,234,0.66)', width: 700 }}>{a}</span>
              <svg width={100} height={20}><DrawPath d="M0,10 L86,10" p={arrow} color={C.gold} w={2} cap="butt" />
                <path d="M82,4 L94,10 L82,16" fill="none" stroke={C.gold} strokeWidth={2} opacity={arrow > 0.9 ? 1 : 0} /></svg>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 54, color: C.white, flex: 1 }}>{b}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 750, opacity: land, transform: 'translateY(' + (1 - land) * 22 + 'px)' }}>
        <div style={{ width: 1640 * land, height: 3, background: C.goldLite, marginBottom: 28 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 78, color: C.white }}>
          They protect the things you <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>refuse to lose.</em>
        </div>
      </div>
    </div>
  );
}

/* who am I becoming */
function BBecoming({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.8)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 2.2, 0.9)(T), 0, 1);
  const fuel = clamp(MOTION.enter(t0 + 4.0, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, right: 140, top: 210 }}>
        <div style={{ opacity: a, transform: 'translateY(' + (1 - a) * 20 + 'px)' }}>
          <div style={{ ...caps(21, 'rgba(244,241,234,0.5)', 6), marginBottom: 18 }}>Not</div>
          <div style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', textWrap: 'balance', fontSize: 66, color: 'rgba(244,241,234,0.62)' }}>“No phone during family time.”</div>
        </div>
        <div style={{ width: 1640 * clamp(MOTION.draw(t0 + 1.8, 0.8)(T), 0, 1), height: 2, background: 'rgba(201,169,110,0.6)', margin: '48px 0' }} />
        <div style={{ opacity: b, transform: 'translateY(' + (1 - b) * 20 + 'px)' }}>
          <div style={{ ...caps(21, C.gold, 6), marginBottom: 18 }}>But</div>
          <div style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', textWrap: 'balance', fontSize: 74, color: C.white, lineHeight: 1.14 }}>“I am the kind of father who gives my family undivided attention.”</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 790, display: 'flex', gap: 44, opacity: fuel }}>
        <span style={{ ...caps(26, 'rgba(244,241,234,0.6)', 5) }}>Same boundary</span>
        <span style={{ ...caps(26, C.goldLite, 5) }}>Completely different fuel</span>
      </div>
    </div>
  );
}

/* four parts of a guardrail */
const PARTS = [
  ['What it protects', 'The pillar or person on the other side of the line'],
  ['The trigger', 'The moment, place, or state that starts the drift'],
  ['The specific line', 'What you will or will not do — measurable, not vague'],
  ['The person you tell', 'A guardrail nobody knows about is a wish'],
];
function BFourParts({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 160 }}>
        <Kicker text="Draft one guardrail — four parts" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 300, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
        {PARTS.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 0.8, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ padding: '34px 36px', boxSizing: 'border-box', minHeight: 230, border: '1px solid rgba(244,241,234,' + (0.16 + 0.2 * p) + ')', background: 'rgba(26,46,59,' + 0.42 * p + ')', ...rise(p, 26) }}>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 34, color: C.gold }}>{'0' + (i + 1)}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 52, color: C.white, marginTop: 12 }}>{h}</div>
              <div style={{ ...caps(20, 'rgba(244,241,234,0.7)', 2.6), marginTop: 16, lineHeight: 1.55 }}>{sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* nobody regrets the wise guardrails */
function BRegret({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 2.0, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 176, width: 1560 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 74, color: C.white, ...rise(a, 24) }}>
          Nobody looks back and regrets the wise guardrails they put in place.
        </div>
        <div style={{ width: 520 * clamp(MOTION.draw(t0 + 1.5, 0.8)(T), 0, 1), height: 2, background: C.gold, margin: '30px 0' }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 68, color: 'rgba(244,241,234,0.72)', ...rise(b, 24) }}>
          Plenty of men grieve the ones they <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>never set.</em>
        </div>
      </div>
    </div>
  );
}

function Piece({ tw, scenes }) {
  const { T, CUES, authoredTotal } = useComposition();
  const D = {}; scenes.forEach((s) => { D[s.name] = s.dur; });
  const beat = (n) => ({ t0: CUES[n], t1: CUES[n] + D[n] });
  const lt = beat('LowerThird'), ti = beat('TitleCard'), rd = beat('Road'), gc = beat('GuardrailCard'),
    ah = beat('AheadOfTime'), it = beat('Intentions'), sc = beat('Scripture'), pt = beat('Protects'),
    bc = beat('Becoming'), fp = beat('FourParts'), wk = beat('TheWork'), rg = beat('Regret'),
    pr = beat('Prayer'), nx = beat('NextUp');

  const capItems = [
    { at: lt.t0, text: 'Welcome to week four. Now we protect what matters by installing guardrails.' },
    { at: ti.t0, until: ti.t0 + 0.1, text: '' },
    { at: rd.t0, text: 'Picture a mountain road with a steep drop. Where do they put the guardrail? Not at the bottom of the canyon. Before the edge.' },
    { at: gc.t0, until: gc.t0 + 0.1, text: '' },
    { at: ah.t0, text: 'A guardrail is a decision you make ahead of time, so that in the moment the decision is already made.' },
    { at: it.t0, text: 'Good intentions are not guardrails. I should be more careful protects nothing.' },
    { at: sc.t0, until: sc.t0 + 0.1, text: '' },
    { at: pt.t0, text: 'Guardrails are not limits on a meaningful life. They protect the things you refuse to lose.' },
    { at: bc.t0, text: 'The deepest question is not what am I not allowed to do. It is who am I becoming.' },
    { at: fp.t0, text: 'Draft one guardrail using four parts: what it protects, the trigger, the specific line, and the person you will tell.' },
    { at: wk.t0, text: 'Your primary guardrail should protect the Focus Pillar you chose last week.' },
    { at: rg.t0, text: 'Nobody looks back and regrets the wise guardrails they put in place.' },
    { at: pr.t0, until: pr.t0 + 0.1, text: '' },
    { at: nx.t0, until: nx.t0 + 0.1, text: '' },
  ];

  const WORK = [
    ['Name two or three places you drift', 'Think of a regret an earlier guardrail might have prevented.'],
    ['Draft one guardrail — all four parts', 'It should protect the Focus Pillar you chose last week.'],
    ['Tell one man from your group', 'Give him permission to ask how it is going.'],
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
      <Beat from={rd.t0} to={rd.t1}><BRoad T={T} t0={rd.t0} /></Beat>
      <Beat from={gc.t0} to={gc.t1}><BGuardrailCard T={T} t0={gc.t0} /></Beat>
      <Beat from={ah.t0} to={ah.t1}><BAheadOfTime T={T} t0={ah.t0} t1={ah.t1} /></Beat>
      <Beat from={it.t0} to={it.t1}><BIntentions T={T} t0={it.t0} /></Beat>
      <Beat from={sc.t0} to={sc.t1}><BScriptureCard T={T} t0={sc.t0} a="“The prudent see danger and take refuge," b="but the simple keep going and pay the penalty.”" refText={tw.scriptureRef} /></Beat>
      <Beat from={pt.t0} to={pt.t1}><BProtects T={T} t0={pt.t0} t1={pt.t1} /></Beat>
      <Beat from={bc.t0} to={bc.t1}><BBecoming T={T} t0={bc.t0} /></Beat>
      <Beat from={fp.t0} to={fp.t1}><BFourParts T={T} t0={fp.t0} /></Beat>
      <Beat from={wk.t0} to={wk.t1}><BWorkList T={T} t0={wk.t0} kicker={'Your pre-work · ' + tw.weekLabel} items={WORK} /></Beat>
      <Beat from={rg.t0} to={rg.t1}><BRegret T={T} t0={rg.t0} /></Beat>
      <Beat from={pr.t0} to={pr.t1}><BPrayer T={T} t0={pr.t0} /></Beat>
      <Beat from={nx.t0} to={nx.t1}><BNext T={T} t0={nx.t0} tw={tw} lines={['Build one this week.']} /></Beat>

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

function Week4Kit() {
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
window.Week4Kit = Week4Kit;
