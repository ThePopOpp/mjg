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

/* --------------------------------------------------------- week 6 beats */
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

const LAYERS6 = [
  ['Bedrock', 'Faith & identity'],
  ['Foundation', 'Mission & values'],
  ['Pillars', 'Family · Fitness · Fun · Finances'],
  ['Guardrails', 'What you refuse to lose'],
  ['Habits', 'One keystone rhythm'],
  ['Energy', 'What renews you'],
  ['Legacy', 'What your life multiplies'],
];
const THIRTY = [
  ['Start', 'What you will begin'],
  ['Stop', 'What you will lay down'],
  ['Protect', 'What you refuse to lose'],
  ['Who', 'The man who helps you keep it'],
];

function BLookBack({ T, t0 }) {
  const items = ['Named your bedrock', 'Drafted a foundation', 'Examined all four pillars', 'Chose one for focus', 'Installed a guardrail', 'Started a keystone habit', 'Named what renews you'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', right: 140, width: 760, top: 165 }}>
        <Kicker text="Six weeks ago you looked at the life you were building" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', right: 140, width: 760, top: 260, display: 'flex', flexDirection: 'column', gap: 26 }}>
        {items.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 0.6 + i * 0.7, 0.6)(T), 0, 1);
          const ck = clamp(MOTION.draw(t0 + 0.85 + i * 0.7, 0.5)(T), 0, 1);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 24, ...rise(p, 20) }}>
              <svg width={40} height={40} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                <rect x="1" y="1" width="38" height="38" fill="none" stroke="rgba(244,241,234,0.35)" strokeWidth="2" />
                <DrawPath d="M9,21 L17,29 L32,11" p={ck} color={C.goldLite} w={3.5} />
              </svg>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 48, color: C.white }}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BPersonalBlueprint({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.94 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, right: 140, top: 120, textAlign: 'center' }}>
        <div style={{ ...caps(24, C.gold, 12), opacity: clamp(MOTION.enter(t0 + 0.15, 0.7)(T), 0, 1) }}>On one page</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 92, color: C.white, marginTop: 14, ...rise(MOTION.enter(t0 + 0.3, 0.9)(T), 30) }}>
          My Personal <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>Blueprint</em>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 330, right: 330, top: 320 }}>
        {LAYERS6.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 1.0 + i * 0.8, 0.65)(T), 0, 1);
          const last = i === 6;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 26, padding: '18px 30px', marginBottom: 10, boxSizing: 'border-box',
              background: last ? 'rgba(201,169,110,' + (0.9 * p) + ')' : 'rgba(26,46,59,' + (0.55 * p) + ')',
              border: '1px solid rgba(244,241,234,' + (0.14 + 0.18 * p) + ')',
              opacity: p, transform: 'translateY(' + (1 - p) * 16 + 'px)',
            }}>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 28, color: last ? C.ink : C.gold, width: 50 }}>{'0' + (i + 1)}</span>
              <span style={{ ...caps(25, last ? C.ink : C.cream, 3), width: 240 }}>{h}</span>
              <span style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 33, color: last ? 'rgba(12,12,12,0.75)' : 'rgba(244,241,234,0.68)' }}>{sub}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BLegacyNow({ T, t0 }) {
  const items = ['The culture of your home', 'The character your children watch', 'The men you are investing in', 'The faith you are passing down', 'The way your resources serve'];
  const land = clamp(MOTION.enter(t0 + 5.0, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, right: 140, top: 155 }}>
        <Kicker text="Legacy is not only what happens after you are gone" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 80, color: C.white, marginTop: 24, ...rise(MOTION.enter(t0 + 0.4, 0.9)(T), 26) }}>
          It is what your life is multiplying <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>right now.</em>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 440, display: 'flex', gap: 22 }}>
        {items.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 1.3 + i * 0.55, 0.7)(T), 0, 1);
          return (
            <div key={i} style={{ flex: 1, ...rise(p, 26) }}>
              <div style={{ height: 3, background: C.gold, transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 36, color: C.cream, marginTop: 22, lineHeight: 1.24 }}>{s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 800, opacity: land, transform: 'translateY(' + (1 - land) * 22 + 'px)' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 72, color: C.white, textAlign: 'center' }}>
          The question is whether you are building it <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>on purpose.</em>
        </div>
      </div>
    </div>
  );
}

function BMovement({ T, t0 }) {
  const items = ['The commitments you made', 'The conversations you had', 'The boundaries you established', 'The stories you can now tell'];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 158 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 64, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 22) }}>
          Look at more than whether every number went up.
        </div>
        <div style={{ display: 'flex', gap: 26, marginTop: 38 }}>
          {items.map((s, i) => {
            const p = clamp(MOTION.enter(t0 + 0.9 + i * 0.45, 0.7)(T), 0, 1);
            return (
              <div key={i} style={{ flex: 1, ...rise(p, 26) }}>
                <div style={{ height: 3, background: C.gold, transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
                <div style={{ ...caps(22, C.cream, 3), marginTop: 20, lineHeight: 1.5 }}>{s}</div>
              </div>
            );
          })}
        </div>
        <div style={{ ...caps(24, C.goldLite, 6), marginTop: 36, opacity: clamp(MOTION.enter(t0 + 3.2, 0.9)(T), 0, 1) }}>That is meaningful movement</div>
      </div>
    </div>
  );
}

function BThirtyDays({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 175 }}>
        <Kicker text="Choose your next thirty days" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 310, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 28 }}>
        {THIRTY.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 0.8, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ padding: '34px 38px', boxSizing: 'border-box', minHeight: 210, border: '1px solid rgba(244,241,234,' + (0.16 + 0.2 * p) + ')', background: 'rgba(26,46,59,' + 0.42 * p + ')', ...rise(p, 26) }}>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 32, color: C.gold }}>{'0' + (i + 1)}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 60, color: C.white, marginTop: 10 }}>{h}</div>
              <div style={{ ...caps(21, 'rgba(244,241,234,0.7)', 2.6), marginTop: 16 }}>{sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BTheMan({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 2.2, 1)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.94 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 200, right: 200, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 58, color: 'rgba(244,241,234,0.6)', ...rise(a, 24) }}>
          The most important thing is not the page you filled out.
        </div>
        <div style={{ width: 1520 * clamp(MOTION.draw(t0 + 1.6, 0.9)(T), 0, 1), height: 2, background: C.gold, margin: '40px 0' }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 84, color: C.white, lineHeight: 1.14, ...rise(b, 28) }}>
          It is the man you are <em style={{ fontStyle: 'italic', color: C.goldLite }}>becoming</em> — and the life other people experience because you stopped drifting.
        </div>
      </div>
    </div>
  );
}

function Piece({ tw, scenes }) {
  const { T, CUES, authoredTotal } = useComposition();
  const D = {}; scenes.forEach((s) => { D[s.name] = s.dur; });
  const beat = (n) => ({ t0: CUES[n], t1: CUES[n] + D[n] });
  const lt = beat('LowerThird'), ti = beat('TitleCard'), lb = beat('LookBack'), pb = beat('PersonalBlueprint'),
    lg = beat('LegacyNow'), sc = beat('Scripture'), mv = beat('Movement'), td = beat('ThirtyDays'),
    wk = beat('TheWork'), tm = beat('TheMan'), pr = beat('Prayer'), nx = beat('NextUp');

  const capItems = [
    { at: lt.t0, text: 'Welcome to week six. You made it. Now we bring the pieces together and look forward.' },
    { at: ti.t0, until: ti.t0 + 0.1, text: '' },
    { at: lb.t0, text: 'You have named your bedrock, drafted a foundation, examined all four pillars, and chosen one for concentrated work.' },
    { at: pb.t0, text: 'This week you will put it on one page — your Personal Blueprint.' },
    { at: lg.t0, text: 'Legacy is what your life is multiplying right now. The question is whether you are building it on purpose.' },
    { at: sc.t0, until: sc.t0 + 0.1, text: '' },
    { at: mv.t0, text: 'Some scores may rise. Some may become more accurate because you see your life more clearly.' },
    { at: td.t0, text: 'Choose your next thirty days: what you will start, stop, protect, and who will help you keep it.' },
    { at: wk.t0, text: 'Go back through weeks one to five and complete the entire Personal Blueprint.' },
    { at: tm.t0, text: 'The most important thing you walk away with is the man you are becoming.' },
    { at: pr.t0, until: pr.t0 + 0.1, text: '' },
    { at: nx.t0, until: nx.t0 + 0.1, text: '' },
  ];

  const WORK = [
    ['Complete the Personal Blueprint', 'Go back through weeks one to five. All seven layers on one page.'],
    ['Retake the Created for More Check-In', 'Compare it with where you started — honestly.'],
    ['Choose your next thirty days', 'And share your Blueprint with someone who matters to you.'],
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
      <Beat from={lb.t0} to={lb.t1}><BLookBack T={T} t0={lb.t0} /></Beat>
      <Beat from={pb.t0} to={pb.t1}><BPersonalBlueprint T={T} t0={pb.t0} /></Beat>
      <Beat from={lg.t0} to={lg.t1}><BLegacyNow T={T} t0={lg.t0} /></Beat>
      <Beat from={sc.t0} to={sc.t1}><BScriptureCard T={T} t0={sc.t0} a="“The things you have heard me say entrust to reliable people" b="who will also be qualified to teach others.”" refText={tw.scriptureRef} /></Beat>
      <Beat from={mv.t0} to={mv.t1}><BMovement T={T} t0={mv.t0} /></Beat>
      <Beat from={td.t0} to={td.t1}><BThirtyDays T={T} t0={td.t0} /></Beat>
      <Beat from={wk.t0} to={wk.t1}><BWorkList T={T} t0={wk.t0} kicker={'Your pre-work · ' + tw.weekLabel} items={WORK} /></Beat>
      <Beat from={tm.t0} to={tm.t1}><BTheMan T={T} t0={tm.t0} /></Beat>
      <Beat from={pr.t0} to={pr.t1}><BPrayer T={T} t0={pr.t0} /></Beat>
      <Beat from={nx.t0} to={nx.t1}><BNext T={T} t0={nx.t0} tw={tw} lines={['You were created', 'to steward a life that matters.']} /></Beat>

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

function Week6Kit() {
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
window.Week6Kit = Week6Kit;
