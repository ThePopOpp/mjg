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

/* --------------------------------------------------------- week 5 beats */
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

/* shaped by what you repeat */
function BRepeat({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 2.0, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 172 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 66, color: 'rgba(244,241,234,0.68)', ...rise(a, 24) }}>
          Not your best intentions. Not your most inspired days.
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 104, color: C.white, marginTop: 22, ...rise(b, 28) }}>
          You are shaped by <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>what you repeat.</em>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 44 }}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 22, background: i % 7 === 0 ? C.gold : 'rgba(244,241,234,0.34)', opacity: clamp(MOTION.enter(t0 + 1.2 + i * 0.055, 0.35)(T), 0, 1) }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ON SCREEN: KEYSTONE HABITS */
function BKeystoneCard({ T, t0 }) {
  const p = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const slab = clamp(MOTION.pop(t0 + 0.15, 0.8)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...caps(25, C.gold, 12), opacity: p }}>Layer 05</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 150, lineHeight: 1.02, color: C.white, margin: '24px 0 8px', textAlign: 'center', ...rise(p, 40) }}>Keystone Habits</div>
        <div style={{ width: 700 * slab, height: 16, background: C.gold, margin: '22px 0 34px' }} />
        <div style={{ ...caps(29, C.cream, 8), opacity: clamp(MOTION.enter(t0 + 1.1, 0.9)(T), 0, 1), textAlign: 'center' }}>Small rhythms that strengthen everything</div>
      </div>
    </div>
  );
}

/* the small domino with a wide ripple */
const RIPPLE = ['Sleep', 'Mood', 'Patience', 'Discipline'];
function BDomino({ T, t0 }) {
  const GROUND = 560;
  const line = clamp(MOTION.draw(t0 + 0.3, 0.9)(T), 0, 1);
  /* a real domino run: each tile stands up, then tips into the next */
  const tiles = [
    { label: 'Exercise', x: 210, w: 64, h: 190, gold: true },
    { label: 'Sleep', x: 400, w: 76, h: 235 },
    { label: 'Mood', x: 620, w: 88, h: 280 },
    { label: 'Patience', x: 870, w: 100, h: 325 },
    { label: 'Discipline', x: 1150, w: 112, h: 370 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.91 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 170 }}>
        <Kicker text="A small domino with a wide ripple" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 190 }}>
        <svg width={1640} height={470} viewBox="0 0 1640 470" style={{ overflow: 'visible' }}>
          {/* ground */}
          <line x1={80} y1={GROUND - 190} x2={1560 * line + 80 * (1 - line)} y2={GROUND - 190} stroke="rgba(201,169,110,0.55)" strokeWidth={2.5} />
          {tiles.map((d, i) => {
            const rise2 = clamp(MOTION.pop(t0 + 0.6 + i * 0.4, 0.6)(T), 0, 1);
            const tip = clamp(MOTION.enter(t0 + 2.6 + i * 0.55, 0.75)(T), 0, 1);
            const angle = tip * (i === tiles.length - 1 ? 62 : 76);
            const y0 = GROUND - 190;
            return (
              <g key={i}>
                {/* tile pivots on its bottom-right corner */}
                <g transform={'rotate(' + angle + ',' + (d.x + d.w) + ',' + y0 + ')'}>
                  <g transform={'translate(' + d.x + ',' + (y0 - d.h * rise2) + ') scale(1,' + rise2 + ')'} opacity={rise2}>
                    <rect width={d.w} height={d.h} rx={10}
                      fill={d.gold ? C.gold : 'rgba(244,241,234,0.92)'} />
                    <rect x={6} y={6} width={d.w - 12} height={d.h - 12} rx={7}
                      fill="none" stroke={d.gold ? 'rgba(12,12,12,0.25)' : 'rgba(26,46,59,0.25)'} strokeWidth={2} />
                    <line x1={8} y1={d.h / 2} x2={d.w - 8} y2={d.h / 2}
                      stroke={d.gold ? 'rgba(12,12,12,0.25)' : 'rgba(26,46,59,0.25)'} strokeWidth={2} />
                    <circle cx={d.w / 2} cy={d.h / 4} r={5} fill={d.gold ? 'rgba(12,12,12,0.4)' : 'rgba(26,46,59,0.4)'} />
                    <circle cx={d.w / 2} cy={d.h * 0.68} r={5} fill={d.gold ? 'rgba(12,12,12,0.4)' : 'rgba(26,46,59,0.4)'} />
                    <circle cx={d.w / 3} cy={d.h * 0.82} r={5} fill={d.gold ? 'rgba(12,12,12,0.4)' : 'rgba(26,46,59,0.4)'} />
                    <circle cx={d.w * 2 / 3} cy={d.h * 0.82} r={5} fill={d.gold ? 'rgba(12,12,12,0.4)' : 'rgba(26,46,59,0.4)'} />
                  </g>
                </g>
                {/* label under the ground line */}
                <text x={d.x + d.w / 2} y={y0 + 44} textAnchor="middle"
                  fill={d.gold ? C.goldLite : 'rgba(244,241,234,' + (0.45 + 0.45 * tip) + ')'}
                  fontFamily={SANS} fontWeight="700" fontSize={22} letterSpacing="3.5" opacity={rise2}>
                  {d.label.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 800, ...caps(24, 'rgba(244,241,234,0.66)', 4), opacity: clamp(MOTION.enter(t0 + 5.4, 0.8)(T), 0, 1) }}>
        Exercise is rarely just exercise
      </div>
    </div>
  );
}

/* identity, cue, minimum */
const DESIGN = [
  ['Start with identity', '“I am becoming the kind of man who cares for the body God gave me.”'],
  ['Attach it to a cue', 'Something you already do, every day, without thinking.'],
  ['Decide the minimum version', 'The one you can still do on the hard days.'],
];
function BDesignHabit({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, top: 175 }}>
        <Kicker text="Design one habit" p={MOTION.enter(t0 + 0.15, 0.7)(T)} />
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 300, display: 'flex', gap: 30 }}>
        {DESIGN.map(([h, sub], i) => {
          const p = clamp(MOTION.enter(t0 + 0.7 + i * 0.9, 0.75)(T), 0, 1);
          return (
            <div key={i} style={{ flex: 1, ...rise(p, 28) }}>
              <div style={{ height: 3, background: C.gold, transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 30, color: C.gold, marginTop: 24 }}>{'0' + (i + 1)}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 52, color: C.white, marginTop: 12, lineHeight: 1.1 }}>{h}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 400, fontStyle: 'italic', fontSize: 34, color: 'rgba(244,241,234,0.74)', marginTop: 20, lineHeight: 1.34 }}>{sub}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 800, opacity: clamp(MOTION.enter(t0 + 3.6, 0.9)(T), 0, 1) }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 62, color: C.white }}>
          Missing once is information. <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>Recovery is part of the plan.</em>
        </div>
      </div>
    </div>
  );
}

/* four kinds of energy */
const ENERGY = ['Physical', 'Emotional', 'Mental', 'Spiritual'];
function BEnergy({ T, t0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.93 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, right: 140, top: 170, textAlign: 'center' }}>
        <div style={{ ...caps(25, C.gold, 12), opacity: clamp(MOTION.enter(t0 + 0.15, 0.7)(T), 0, 1) }}>Layer 06</div>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 116, color: C.white, marginTop: 16, ...rise(MOTION.enter(t0 + 0.3, 0.9)(T), 30) }}>Energy</div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 430, display: 'flex', gap: 28 }}>
        {ENERGY.map((s, i) => {
          const p = clamp(MOTION.enter(t0 + 0.9 + i * 0.5, 0.7)(T), 0, 1);
          return (
            <div key={i} style={{ flex: 1, ...rise(p, 28) }}>
              <div style={{ height: 8, background: C.goldLite, boxShadow: '0 0 22px rgba(201,169,110,0.7)', transform: 'scaleX(' + p + ')', transformOrigin: 'left' }} />
              <div style={{ ...caps(30, C.cream, 3), marginTop: 24 }}>{s}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 690, opacity: clamp(MOTION.enter(t0 + 3.4, 0.9)(T), 0, 1), textAlign: 'center' }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 74, color: C.white }}>
          Renewable — but <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>not unlimited.</em>
        </div>
      </div>
    </div>
  );
}

/* the pulse */
function BPulse({ T, t0 }) {
  const p = clamp(MOTION.draw(t0 + 0.5, 4.2)(T), 0, 1);
  const pairs = [['Work', 'Rest'], ['Output', 'Renewal'], ['Exertion', 'Recovery']];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, right: 140, bottom: 168 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 76, color: C.white, ...rise(MOTION.enter(t0 + 0.2, 0.8)(T), 24) }}>
          A healthy life has a <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>pulse.</em>
        </div>
        <svg width={1640} height={170} viewBox="0 0 1640 170" style={{ marginTop: 20 }}>
          <DrawPath d="M0,120 L180,120 L240,30 L300,150 L360,120 L560,120 L620,30 L680,150 L740,120 L940,120 L1000,30 L1060,150 L1120,120 L1640,120" p={p} color={C.gold} w={4} cap="round" />
        </svg>
        <div style={{ display: 'flex', gap: 70, marginTop: 6 }}>
          {pairs.map(([a, b], i) => (
            <span key={i} style={{ ...caps(25, C.cream, 4), opacity: clamp(MOTION.enter(t0 + 1.4 + i * 0.7, 0.7)(T), 0, 1) }}>
              {a} <span style={{ color: C.gold }}>·</span> {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* energy debt */
function BDebt({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const drain = clamp(MOTION.draw(t0 + 1.0, 3.2)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 4.0, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Dim o={0.92 * clamp(MOTION.enter(t0, 0.7)(T), 0, 1)} color={C.ink} />
      <div style={{ position: 'absolute', left: 140, right: 140, top: 230 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 78, color: C.white, ...rise(a, 26) }}>
          Most tired men are not lazy. They are running on empty.
        </div>
        <div style={{ marginTop: 56, height: 46, background: 'rgba(244,241,234,0.12)', position: 'relative' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: (100 - 96 * drain) + '%', background: C.gold }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: (96 * drain) + '%', borderTop: '1px solid rgba(229,86,75,0.5)', borderBottom: '1px solid rgba(229,86,75,0.5)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
          <span style={{ ...caps(22, C.goldLite, 4) }}>Spending</span>
          <span style={{ ...caps(22, 'rgba(244,241,234,0.5)', 4) }}>Never refilling</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 140, right: 140, top: 700, opacity: b, transform: 'translateY(' + (1 - b) * 24 + 'px)' }}>
        <div style={{ width: 1640 * b, height: 3, background: C.goldLite, marginBottom: 30 }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 72, color: C.white }}>
          Then your body, relationships, or focus <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>sends the invoice.</em>
        </div>
      </div>
    </div>
  );
}

/* rest is stewardship */
function BRest({ T, t0 }) {
  const a = clamp(MOTION.enter(t0 + 0.3, 0.9)(T), 0, 1);
  const b = clamp(MOTION.enter(t0 + 1.9, 0.9)(T), 0, 1);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Scrim o={MOTION.enter(t0, 0.6)(T)} />
      <div style={{ position: 'absolute', left: 140, bottom: 186, width: 1560 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 76, color: 'rgba(244,241,234,0.68)', ...rise(a, 26) }}>
          Rest is not weakness or laziness.
        </div>
        <div style={{ width: 440 * clamp(MOTION.draw(t0 + 1.3, 0.8)(T), 0, 1), height: 2, background: C.gold, margin: '28px 0' }} />
        <div style={{ fontFamily: SERIF, fontWeight: 400, textWrap: 'balance', fontSize: 106, color: C.white, ...rise(b, 26) }}>
          It is <em style={{ fontStyle: 'italic', color: C.goldLite, whiteSpace: 'nowrap' }}>stewardship.</em>
        </div>
      </div>
    </div>
  );
}

function Piece({ tw, scenes }) {
  const { T, CUES, authoredTotal } = useComposition();
  const D = {}; scenes.forEach((s) => { D[s.name] = s.dur; });
  const beat = (n) => ({ t0: CUES[n], t1: CUES[n] + D[n] });
  const lt = beat('LowerThird'), ti = beat('TitleCard'), rp = beat('Repeat'), kc = beat('KeystoneCard'),
    dm = beat('Domino'), dh = beat('DesignHabit'), s1 = beat('Scripture1'), en = beat('EnergyCard'),
    pu = beat('Pulse'), db = beat('Debt'), s2 = beat('Scripture2'), rs = beat('Rest'),
    wk = beat('TheWork'), pr = beat('Prayer'), nx = beat('NextUp');

  const capItems = [
    { at: lt.t0, text: 'Welcome to week five. Now we strengthen the structure with keystone habits and energy.' },
    { at: ti.t0, until: ti.t0 + 0.1, text: '' },
    { at: rp.t0, text: 'The life you build will be shaped by what you repeat. What you do over and over is what you become.' },
    { at: kc.t0, until: kc.t0 + 0.1, text: '' },
    { at: dm.t0, text: 'A keystone habit is a small domino with a wide ripple.' },
    { at: dh.t0, text: 'Start with identity. Attach the habit to something you already do. Decide the minimum version for hard days.' },
    { at: s1.t0, until: s1.t0 + 0.1, text: '' },
    { at: en.t0, text: 'You have four kinds of energy: physical, emotional, mental, and spiritual.' },
    { at: pu.t0, text: 'A healthy life has a pulse: work and rest, output and renewal, exertion and recovery.' },
    { at: db.t0, text: 'Energy debt is like financial debt. You can ignore it for a while, and then the invoice arrives.' },
    { at: s2.t0, until: s2.t0 + 0.1, text: '' },
    { at: rs.t0, text: 'Rest is not weakness or laziness. It is stewardship.' },
    { at: wk.t0, text: 'Notice what drains you and what renews you. Then design one keystone habit and protect one rhythm of renewal.' },
    { at: pr.t0, until: pr.t0 + 0.1, text: '' },
    { at: nx.t0, until: nx.t0 + 0.1, text: '' },
  ];

  const WORK = [
    ['Notice what drains and renews you', 'Across physical, emotional, mental, and spiritual energy.'],
    ['Design one keystone habit', 'Identity, cue, and minimum version. Run it for seven days.'],
    ['Protect one rhythm of renewal', 'And check in with one man — tell him what happened, without spin.'],
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
      <Beat from={rp.t0} to={rp.t1}><BRepeat T={T} t0={rp.t0} /></Beat>
      <Beat from={kc.t0} to={kc.t1}><BKeystoneCard T={T} t0={kc.t0} /></Beat>
      <Beat from={dm.t0} to={dm.t1}><BDomino T={T} t0={dm.t0} /></Beat>
      <Beat from={dh.t0} to={dh.t1}><BDesignHabit T={T} t0={dh.t0} /></Beat>
      <Beat from={s1.t0} to={s1.t1}><BScriptureCard T={T} t0={s1.t0} a="“Let us not become weary in doing good, for at the proper time" b="we will reap a harvest if we do not give up.”" refText={tw.scriptureRef1} /></Beat>
      <Beat from={en.t0} to={en.t1}><BEnergy T={T} t0={en.t0} /></Beat>
      <Beat from={pu.t0} to={pu.t1}><BPulse T={T} t0={pu.t0} /></Beat>
      <Beat from={db.t0} to={db.t1}><BDebt T={T} t0={db.t0} /></Beat>
      <Beat from={s2.t0} to={s2.t1}><BScriptureCard T={T} t0={s2.t0} a="“Come with me by yourselves to a quiet place" b="and get some rest.”" refText={tw.scriptureRef2} /></Beat>
      <Beat from={rs.t0} to={rs.t1}><BRest T={T} t0={rs.t0} /></Beat>
      <Beat from={wk.t0} to={wk.t1}><BWorkList T={T} t0={wk.t0} kicker={'Your pre-work · ' + tw.weekLabel} items={WORK} /></Beat>
      <Beat from={pr.t0} to={pr.t1}><BPrayer T={T} t0={pr.t0} /></Beat>
      <Beat from={nx.t0} to={nx.t1}><BNext T={T} t0={nx.t0} tw={tw} lines={['One habit.', 'One rhythm.', 'One touch in every pillar.']} /></Beat>

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

function Week5Kit() {
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
        <TweakText label="Scripture ref 1" value={tw.scriptureRef1} onChange={(v) => setTweak('scriptureRef1', v)} />
        <TweakText label="Scripture ref 2" value={tw.scriptureRef2} onChange={(v) => setTweak('scriptureRef2', v)} />
        <TweakText label="Next up" value={tw.nextUp} onChange={(v) => setTweak('nextUp', v)} />
        <TweakText label="URL" value={tw.url} onChange={(v) => setTweak('url', v)} />
      </TweaksPanel>
    </div>
  );
}
window.Week5Kit = Week5Kit;
