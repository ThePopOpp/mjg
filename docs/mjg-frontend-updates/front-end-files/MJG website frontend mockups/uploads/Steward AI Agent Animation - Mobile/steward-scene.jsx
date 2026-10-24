// steward-scene.jsx — the Steward AI Agent showcase, one continuous composition.
// Everything is a pure function of authored time T from useComposition().
(function () {
  const { useComposition, Shot, Easing, animate, clamp, CompositionStage, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle } = window;

  // ---- Three motion helpers (the only easing used anywhere) ---------------
  const MOTION = {
    enter: (T, at, d = 0.55) => clamp((T - at) / d, 0, 1) === 0 ? 0 : Easing.easeOutCubic(clamp((T - at) / d, 0, 1)),
    glide: (p) => Easing.easeInOutCubic(clamp(p, 0, 1)),
    pop: (p) => Easing.easeOutBack(clamp(p, 0, 1)),
  };
  const env = (T, a, b, ramp = 0.35) => clamp((T - a) / ramp, 0, 1) * clamp((b - T) / ramp, 0, 1);
  const typed = (text, T, a, b) => text.slice(0, Math.round(text.length * clamp((T - a) / (b - a), 0, 1)));

  // ---- Theme tokens (app/globals.css :root / .dark) -----------------------
  const THEMES = {
    dark: { bg: '#141211', bgA: 'rgba(20,18,17,0.84)', fg: '#F0EBE0', card: '#1F1C19', muted: '#2C2825', mutedFg: '#B1AA9A', border: '#373330', gold: '#b88a4a', goldText: '#d4a862', particle: '#c9a96e', particleOpacity: 0.55, bubbleBg: '#F0EBE0', bubbleFg: '#141211', logo: 'assets/mjg-logo-white.svg' },
    light: { bg: '#FBFAF8', bgA: 'rgba(251,250,248,0.86)', fg: '#1F1C19', card: '#FFFFFF', muted: '#F4F1EB', mutedFg: '#6D665F', border: '#E1DBD0', gold: '#b88a4a', goldText: '#9a6f30', particle: '#B6924F', particleOpacity: 0.35, bubbleBg: '#1F1C19', bubbleFg: '#FBFAF8', logo: 'assets/mjg-logo-black.svg' },
  };
  const SANS = '"Geist", Arial, sans-serif', SERIF = '"Fraunces", Georgia, serif';

  // ---- Script -------------------------------------------------------------
  const MSGS = [
    { id: 'l0', role: 'steward', at: 2.0, end: 3.3, text: "I'm listening. What would you like to discuss?" },
    { id: 'l1', role: 'member', voice: true, at: 8.8, text: "I need help with my family situation." },
    { id: 'l2', role: 'steward', at: 10.0, end: 11.0, text: "I'm here. Keep going." },
    { id: 't0', role: 'steward', at: 13.0, end: 14.3, text: "Let's think it through. What's the decision in front of you?" },
    { id: 't1', role: 'member', at: 17.9, text: 'I keep saying yes, then resenting it.' },
    { id: 't2', role: 'steward', at: 19.0, end: 21.4, text: "That sounds like a guardrail that isn't written down yet. What are you protecting when you say yes?" },
    { id: 's0', role: 'steward', at: 25.0, end: 26.3, text: "Let's find one small step you'll actually take this week." },
    { id: 's1', role: 'member', at: 28.9, text: 'Not letting people down.' },
    { id: 's2', role: 'steward', at: 30.0, end: 31.8, text: 'Then the cost lands on the people closest to you. Here is wording for your Guardrails page.' },
    { id: 'p', role: 'proposal', at: 32.4, approveAt: 34.0, label: 'Guardrails — Protect What Matters', text: 'I don\u2019t say yes on the spot. I check, and I come back.' },
  ];
  const THINKING = [[9.2, 10.0], [18.2, 19.0], [29.2, 30.0]];
  const RECORDING = [5.3, 8.5];
  const TYPING = [{ a: 15.1, b: 17.6, text: MSGS[4].text }, { a: 26.7, b: 28.6, text: MSGS[7].text }];
  const MODE_AT = { listen: 1.6, think: 12.5, step: 24.5 };
  const MODES = [
    { key: 'listen', label: 'Listen First', blurb: 'Say it out loud. No advice back unless you ask.' },
    { key: 'think', label: 'Help Me Think', blurb: 'Work through it together. Questions, options, trade-offs.' },
    { key: 'step', label: 'Help Me Take a Step', blurb: 'Turn it into one thing you can actually do this week.' },
  ];
  const THREADS = [['Saying yes before I mean it', 'Now'], ['What I actually stand on', '2d'], ['Thursday mornings with Dave', '1w'], ['Where my energy goes', '3w']];

  const CAM = [
    { at: 0, target: null, s: 1 },
    { at: 1.4, d: 1.2, target: 'cards', s: 1.45 },
    { at: 3.0, d: 0.9, target: 'chat', s: 1.15 },
    { at: 5.6, d: 0.8, target: 'composer', s: 1.6 },
    { at: 9.4, d: 0.8, target: 'chat', s: 1.15 },
    { at: 12.5, d: 0.6, target: 'pills', s: 1.7 },
    { at: 13.9, d: 0.8, target: 'chat', s: 1.15 },
    { at: 15.4, d: 0.6, target: 'composer', s: 1.5 },
    { at: 18.8, d: 0.8, target: 'chat', s: 1.15 },
    { at: 24.5, d: 0.6, target: 'pills', s: 1.7 },
    { at: 25.9, d: 0.8, target: 'chat', s: 1.15 },
    { at: 27.0, d: 0.6, target: 'composer', s: 1.5 },
    { at: 29.6, d: 0.8, target: 'chat', s: 1.15 },
    { at: 36.0, d: 1.1, target: null, s: 1 },
  ];
  const CURSOR = [
    { at: 0, target: 'cursor-home' },
    { at: 1.5, d: 1.2, target: 'card-listen', click: 1.6 },
    { at: 5.2, d: 0.9, target: 'mic', click: 5.3 },
    { at: 8.4, d: 0.7, target: 'send-check', click: 8.5 },
    { at: 8.6, d: 0.1, target: 'composer' },
    { at: 12.4, d: 1.0, target: 'pill-think', click: 12.5 },
    { at: 15.0, d: 0.8, target: 'composer-text', click: 15.1 },
    { at: 17.7, d: 0.6, target: 'send', click: 17.8 },
    { at: 24.4, d: 1.0, target: 'pill-step', click: 24.5 },
    { at: 26.6, d: 0.8, target: 'composer-text', click: 26.7 },
    { at: 28.7, d: 0.6, target: 'send', click: 28.8 },
    { at: 33.9, d: 1.0, target: 'approve', click: 34.0 },
    { at: 34.1, d: 0.1, target: 'proposal' },
  ];
  const CLICKS = CURSOR.filter((k) => k.click != null).map((k) => k.click);

  function resolveKeys(keys, T) {
    let cur = keys[0], next = null, p = 1;
    for (let i = 1; i < keys.length; i++) {
      const k = keys[i], d = k.d || 0.7;
      if (T >= k.at) { cur = k; continue; }
      if (T > k.at - d) { next = k; p = (T - (k.at - d)) / d; }
      break;
    }
    return { cur, next, p: MOTION.glide(p) };
  }

  // ---- Icons (lucide paths) ----------------------------------------------
  const I = ({ d, size = 16, sw = 2, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>{d.map((p, i) => <path key={i} d={p} />)}</svg>
  );
  const P = {
    plus: ['M12 5v14', 'M5 12h14'], msg: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'], book: ['M12 7v14', 'M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z'],
    more: ['M12 12h.01', 'M19 12h.01', 'M5 12h.01'], check: ['M20 6 9 17l-5-5'], mic: ['M12 19v3', 'M19 10v2a7 7 0 0 1-14 0v-2', 'M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z'],
    up: ['m5 12 7-7 7 7', 'M12 19V5'], x: ['M18 6 6 18', 'm6 6 12 12'], copy: ['M8 8h12v12H8z', 'M16 8V4H4v12h4'], refresh: ['M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16', 'M8 16H3v5'],
    moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'], sun: ['M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'], chev: ['m6 9 6 6 6-6'],
    arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
  };

  // ---- three.js canvas bound to T ----------------------------------------
  function ThreeCanvas({ kind, w, h, T, params, style }) {
    const ref = React.useRef(null), inst = React.useRef(null);
    const [, bump] = React.useState(0);
    React.useEffect(() => {
      if (window.THREE) return;
      const on = () => bump((n) => n + 1);
      window.addEventListener('three-ready', on); return () => window.removeEventListener('three-ready', on);
    }, []);
    React.useLayoutEffect(() => {
      if (!window.THREE || !window.StewardThree || !ref.current) return;
      if (!inst.current) inst.current = new window.StewardThree[kind](ref.current, w, h);
      inst.current.render(T, params);
    });
    return <canvas ref={ref} width={w} height={h} style={Object.assign({ display: 'block', width: w, height: h }, style)} />;
  }

  // ---- Stable sub-components (module scope so React keeps their DOM across frames) ----
  const Avatar = ({ C, T, pulse }) => (
    <span style={{ marginTop: 2, display: 'flex', height: 28, width: 28, flexShrink: 0, alignItems: 'center', justifyContent: 'center', borderRadius: 8, background: C.muted, border: `1px solid ${C.border}` }}>
      <img src="assets/s-steps-gold.svg" alt="" style={{ height: 16, width: 'auto', display: 'block', transform: pulse ? `scale(${1 + Math.sin(T * 12) * 0.12})` : 'none' }} />
    </span>
  );
  const Eq = ({ C, T, e }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, height: 40, width: '100%', overflow: 'hidden' }}>
      {Array.from({ length: 72 }, (_, i) => {
        const k = i / 72, bell = Math.sin(k * Math.PI);
        const n = 0.5 + 0.5 * Math.sin(T * 7.3 + i * 0.62) * Math.sin(T * 3.1 + i * 1.7) + Math.sin(T * 13.7 + i * 2.3) * 0.18;
        const h = 4 + Math.max(0, n) * 30 * bell * e;
        return <span key={i} style={{ flexShrink: 0, width: 2, height: h, borderRadius: 999, background: C.gold, opacity: 0.55 + bell * 0.45 }} />;
      })}
    </div>
  );
  const Pill = ({ C, reg, seam, id, label, active, onlyWhen }) => (
    <span ref={reg(id)} style={{ height: 28, padding: '0 12px', borderRadius: 999, display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', border: `1px solid ${active ? C.gold : C.border}`, background: active ? C.gold : 'transparent', color: active ? '#fff' : C.fg, opacity: onlyWhen ? 1 - seam : 0 }}>{label}</span>
  );
  const IconBtn = ({ C, reg, id, d, filled, dim, size = 36 }) => (
    <span ref={id ? reg(id) : undefined} style={{ height: size, width: size, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: filled ? 'none' : `1px solid ${C.border}`, background: filled ? (dim ? C.muted : C.fg) : C.card, color: filled ? (dim ? C.mutedFg : C.bg) : C.fg, transform: dim ? 'scale(0.9)' : 'none' }}><I d={d} size={16} /></span>
  );

  // ---- The piece -----------------------------------------------------------
  function Piece({ tweaks }) {
    const { T, authoredTotal } = useComposition();
    const C = THEMES[tweaks.theme] || THEMES.dark;
    const M = tweaks.layout === 'mobile';
    const W = M ? 1080 : 1920, H = M ? 1920 : 1080, APP_W = M ? 390 : 1440, APP_H = M ? 693 : 810, K = W / APP_W, PAD = M ? 16 : 28;
    const appRef = React.useRef(null), els = React.useRef({});
    const missed = React.useRef(false);
    const [, remeasure] = React.useState(0);
    const pending = React.useRef(false);
    const bump = () => { if (pending.current) return; pending.current = true; requestAnimationFrame(() => { pending.current = false; remeasure((k) => k + 1); }); };
    const reg = (id) => (el) => { if (el && els.current[id] !== el) { els.current[id] = el; if (missed.current) bump(); } };
    // layout-space measurement (offset chain up to the app root), immune to the camera/tilt transforms
    const rect = (id) => {
      const a = appRef.current, e = els.current[id]; if (!a || !e) { missed.current = true; return null; }
      let x = 0, y = 0, n = e;
      while (n && n !== a) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      if (n !== a) { missed.current = true; return null; }
      const k = K, w = e.offsetWidth * k, h = e.offsetHeight * k; x *= k; y *= k;
      return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
    };
    React.useLayoutEffect(() => {
      if (missed.current && !appRef.current) bump();
      missed.current = false;
    });

    // --- derived state from T ---
    const mode = T >= MODE_AT.step ? 'step' : T >= MODE_AT.think ? 'think' : T >= MODE_AT.listen ? 'listen' : null;
    const seam = clamp((T - (authoredTotal - 0.8)) / 0.6, 0, 1); // loop seam: transcript -> welcome
    const welcomeOp = mode ? seam : 1;
    const recording = T >= RECORDING[0] && T < RECORDING[1];
    const thinking = THINKING.some(([a, b]) => T >= a && T < b);
    const speaking = MSGS.some((m) => m.role === 'steward' && T >= m.at && T < m.end);
    const draft = TYPING.reduce((acc, t) => (T >= t.a && T < t.b + 0.25 ? typed(t.text, T, t.a, t.b) : acc), '');
    const focused = TYPING.some((t) => T >= t.a - 0.05 && T < t.b + 0.25);
    const energy = Math.max(env(T, RECORDING[0], RECORDING[1]) * 1, ...THINKING.map(([a, b]) => env(T, a, b, 0.3) * 0.85), ...TYPING.map((t) => env(T, t.a, t.b, 0.3) * 0.6), ...MSGS.filter((m) => m.end).map((m) => env(T, m.at, m.end, 0.3) * 0.5), 0.18);
    const orbMode = recording ? 'listening' : thinking ? 'thinking' : speaking ? 'speaking' : 'idle';
    const status = recording ? 'Listening…' : thinking ? 'Thinking…' : speaking ? 'Responding…' : 'Grounded in your Blueprint';

    // --- camera ---
    const camPoint = (k) => { const r = k.target ? rect(k.target) : null; return r ? { x: r.cx, y: r.cy, s: k.s } : { x: W / 2, y: H / 2, s: k.s }; };
    const ck = resolveKeys(CAM, T);
    const a = camPoint(ck.cur), b = ck.next ? camPoint(ck.next) : a;
    const cam = { x: a.x + (b.x - a.x) * ck.p, y: a.y + (b.y - a.y) * ck.p, s: a.s + (b.s - a.s) * ck.p };
    if (M) cam.s = 1; // phone already fills the stage width — pan only
    // keep the frame inside the app bounds
    const vw = W / cam.s, vh = H / cam.s;
    cam.x = clamp(cam.x, vw / 2, W - vw / 2); cam.y = clamp(cam.y, vh / 2, H - vh / 2);
    const tiltX = tweaks.tilt ? Math.sin(T * 0.35) * 1.6 : 0, tiltY = tweaks.tilt ? Math.cos(T * 0.27) * 2.2 : 0;
    const camStyle = { position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${W / 2 - cam.x * cam.s}px, ${H / 2 - cam.y * cam.s}px) scale(${cam.s})` };

    // --- cursor ---
    const uk = resolveKeys(CURSOR, T);
    const cp = (k) => { const r = rect(k.target); return r ? { x: r.cx, y: r.cy } : { x: W * 0.78, y: H * 0.83 }; };
    const ca = cp(uk.cur), cb = uk.next ? cp(uk.next) : ca;
    const cur = { x: ca.x + (cb.x - ca.x) * uk.p, y: ca.y + (cb.y - ca.y) * uk.p };
    const clickP = CLICKS.reduce((m, c) => Math.max(m, env(T, c - 0.05, c + 0.22, 0.08)), 0);
    const ring = CLICKS.reduce((m, c) => (T >= c && T < c + 0.5 ? Math.max(m, (T - c) / 0.5) : m), 0);
    const cursorOp = clamp((T - 0.1) / 0.5, 0, 1) * clamp((35.6 - T) / 0.5, 0, 1);

    const gold07 = 'rgba(184,138,74,0.07)', gold50 = 'rgba(184,138,74,0.5)', gold15 = 'rgba(184,138,74,0.15)';

    return (
      <div style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden', fontFamily: SANS, color: C.fg, perspective: 2600 }}>
        {/* ambient particle field */}
        {tweaks.particles ? <ThreeCanvas key={W} kind="Particles" w={W} h={H} T={T} params={{ energy, color: C.particle, opacity: C.particleOpacity }} style={{ position: 'absolute', inset: 0 }} /> : null}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, transparent 45%, ${C.bg} 100%)` }} />

        {/* camera rig */}
        <div style={camStyle}>
          <div style={{ position: 'absolute', inset: 0, transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, transformStyle: 'preserve-3d' }}>
            {/* app at 1440x810, scaled to the 1920 stage */}
            <div ref={appRef} style={{ position: 'absolute', left: 0, top: 0, width: APP_W, height: APP_H, transform: `scale(${K})`, transformOrigin: '0 0', background: C.bgA, display: 'flex', flexDirection: 'column', fontSize: 14, lineHeight: 1.45 }}>
              {/* top nav */}
              {M ? (
                <div style={{ height: 56, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ height: 36, width: 36, borderRadius: 999, border: `1px solid ${C.border}`, background: C.card, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><I d={['M4 6h16', 'M4 12h16', 'M4 18h16']} size={16} /></span>
                  <img src={C.logo} alt="MJG" style={{ height: 28, width: 'auto', display: 'block' }} />
                  <span style={{ height: 36, width: 36, borderRadius: 999, border: `1px solid ${C.border}`, background: C.muted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><I d={tweaks.theme === 'light' ? P.sun : P.moon} size={15} /></span>
                </div>
              ) : (
              <div style={{ height: 56, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 64px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img src={C.logo} alt="MJG" style={{ height: 30, width: 'auto', display: 'block' }} />
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 15 }}>Michael J. Gauthier</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 26, fontSize: 13.5, fontWeight: 600 }}>
                  <span>Home</span><span>About</span><span>Mission</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>Resources <I d={P.chev} size={12} /></span>
                  <span>Contact</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: C.mutedFg }}>Account <I d={P.chev} size={12} /></span>
                  <span style={{ height: 36, width: 36, borderRadius: 999, border: `1px solid ${C.border}`, background: C.muted, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}><I d={tweaks.theme === 'light' ? P.sun : P.moon} size={15} /></span>
                </div>
              </div>

              )}

              {/* body */}
              <div style={{ flex: 1, minHeight: 0, display: 'grid', gridTemplateColumns: M ? 'minmax(0,1fr)' : '258px minmax(0,1fr)', padding: M ? 0 : '0 64px 0 64px' }}>
                {/* sidebar */}
                {M ? null : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '14px 14px 14px 0', borderRight: `1px solid ${C.border}`, minHeight: 0 }}>
                  <span style={{ height: 36, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 13.5 }}><I d={P.plus} size={15} /> New conversation</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {[['Steward', P.msg, true], ['My Blueprint', P.book, false], ['More', P.more, false]].map(([l, d, act]) => (
                      <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, padding: '8px 10px', fontSize: 13.5, fontWeight: act ? 600 : 400, background: act ? gold15 : 'transparent', color: act ? C.goldText : C.fg }}><I d={d} size={15} /> {l}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minHeight: 0 }}>
                    <span style={{ padding: '0 10px 6px', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.mutedFg }}>Recent</span>
                    {THREADS.map(([t, w], i) => (
                      <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 8, padding: '8px 10px', fontSize: 13.5, background: i === 0 ? C.muted : 'transparent' }}><span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t}</span><span style={{ fontSize: 11, color: C.mutedFg, flexShrink: 0 }}>{w}</span></span>
                    ))}
                  </div>
                  <div ref={reg('nextstep')} style={{ borderRadius: 12, border: `1px solid ${gold50}`, background: gold07, padding: 12, boxShadow: `0 0 0 ${env(T, 34.1, 37, 0.5) * 6}px rgba(184,138,74,0.12)` }}>
                    <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.goldText }}>My next faithful step</span>
                    <span style={{ display: 'block', marginTop: 4, fontFamily: SERIF, fontSize: 14, lineHeight: 1.35 }}>Put the phone in the kitchen at 9pm. Tonight.</span>
                    <span style={{ marginTop: 10, height: 28, borderRadius: 6, background: C.gold, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 600 }}><I d={P.check} size={13} /> I did this</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, padding: 12 }}>
                    <span style={{ height: 32, width: 32, borderRadius: 999, background: C.fg, color: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>JW</span>
                    <span style={{ minWidth: 0 }}><span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>Jeremy</span><span style={{ display: 'block', fontSize: 12, color: C.mutedFg }}>Free · Steward</span></span>
                  </div>
                </div>
                )}

                {/* main */}
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
                  {/* status row */}
                  <div style={{ flex: 'none', display: 'flex', flexDirection: M ? 'column' : 'row', alignItems: M ? 'stretch' : 'center', justifyContent: 'space-between', gap: M ? 10 : 16, padding: M ? '10px 16px' : '8px 28px', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ position: 'relative', height: 40, width: 40, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="assets/s-steps-gold.svg" alt="Steward" style={{ height: 22, width: 'auto', display: 'block', transform: `scale(${1 + Math.sin(T * (orbMode === 'thinking' ? 16 : orbMode === 'speaking' ? 10 : 4)) * (0.02 + energy * 0.05)})` }} />
                        <ThreeCanvas kind="Orb" w={40} h={40} T={T} params={{ energy, mode: orbMode }} style={{ position: 'absolute', inset: 0 }} />
                      </span>
                      <span><span style={{ display: 'block', fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>Steward</span><span style={{ display: 'block', fontSize: 12, color: C.mutedFg }}>{status}</span></span>
                    </div>
                    <div ref={reg('pills')} style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
                      <Pill C={C} reg={reg} seam={seam} id="pill-listen" label="Listen First" active={mode === 'listen'} onlyWhen={!!mode} />
                      <Pill C={C} reg={reg} seam={seam} id="pill-think" label="Help Me Think" active={mode === 'think'} onlyWhen={!!mode} />
                      <Pill C={C} reg={reg} seam={seam} id="pill-step" label="Help Me Take a Step" active={mode === 'step'} onlyWhen={!!mode} />
                      <span style={{ height: 24, padding: '0 10px', borderRadius: 999, border: `1px solid ${C.border}`, display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap', color: C.mutedFg, display: M ? 'none' : 'inline-flex' }}>Blueprint context on</span>
                    </div>
                  </div>

                  {/* transcript + composer, framed together by the camera so the prompt never clips */}
                  <div ref={reg('chat')} style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden', padding: `${PAD}px ${PAD}px 8px` }}>
                    {/* welcome */}
                    <div style={{ position: 'absolute', left: PAD, right: PAD, top: PAD, opacity: welcomeOp, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: M ? 12 : 16, padding: M ? '8px 0' : '24px 0', maxWidth: 760, margin: '0 auto', pointerEvents: 'none' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.mutedFg }}>Steward</span>
                      <span style={{ fontSize: M ? 24 : 34, fontWeight: 600, lineHeight: 1.12, letterSpacing: '-0.02em', textWrap: 'pretty' }}>Welcome. I'm Steward, your personal guide for designing and living a life that matters.</span>
                      <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: M ? 18 : 26, color: C.mutedFg }}>How would you like me to help right now?</span>
                      <div ref={reg('cards')} style={{ marginTop: 4, display: 'grid', gridTemplateColumns: M ? 'minmax(0,1fr)' : 'repeat(3, minmax(0,1fr))', gap: 10, width: '100%' }}>
                        {MODES.map((m, i) => {
                          const hov = m.key === 'listen' && T > 1.2 && !mode;
                          return (
                            <div key={m.key} ref={reg('card-' + m.key)} style={{ borderRadius: 12, border: `1px solid ${hov ? C.gold : C.border}`, background: hov ? gold07 : C.card, padding: 14, transform: hov ? 'translateY(-2px)' : 'none' }}>
                              <span style={{ display: 'block', fontSize: 13.5, fontWeight: 600 }}>{m.label}</span>
                              <span style={{ display: 'block', marginTop: 4, fontSize: 12, lineHeight: 1.4, color: C.mutedFg }}>{m.blurb}</span>
                            </div>
                          );
                        })}
                      </div>
                      <span style={{ fontSize: 11.5, color: C.mutedFg }}>You can change this at any point.</span>
                    </div>

                    {/* messages, bottom-anchored so new ones push the rest up */}
                    <div style={{ position: 'absolute', left: PAD, right: PAD, bottom: 8, top: PAD, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: M ? 18 : 24, maxWidth: 760, margin: '0 auto', opacity: mode ? 1 - seam : 0, WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 56px)', maskImage: 'linear-gradient(to bottom, transparent 0, #000 56px)' }}>
                      {MSGS.map((m) => {
                        const e = MOTION.enter(T, m.at);
                        if (e === 0) return null;
                        const st = { opacity: e, transform: `translateY(${(1 - e) * 22}px)` };
                        if (m.role === 'member') return (
                          <div key={m.id} style={Object.assign({ display: 'flex', justifyContent: 'flex-end' }, st)}>
                            <div style={{ maxWidth: M ? '88%' : '78%', borderRadius: '16px 16px 4px 16px', background: C.bubbleBg, color: C.bubbleFg, padding: '10px 16px', fontSize: 15, lineHeight: 1.6 }}>
                              {m.voice ? <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}><I d={P.mic} size={12} /> Voice</span> : null}
                              {m.text}
                            </div>
                          </div>
                        );
                        if (m.role === 'proposal') {
                          const approved = T >= m.approveAt;
                          const ap = MOTION.enter(T, m.approveAt, 0.4);
                          return (
                            <div key={m.id} ref={reg('proposal')} style={Object.assign({ borderRadius: 16, border: `1px solid ${gold50}`, background: gold07, padding: 16 }, st)}>
                              <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.goldText }}>Proposed for {m.label}</span>
                              <span style={{ display: 'block', marginTop: 8, fontFamily: SERIF, fontSize: 17, lineHeight: 1.6 }}>&ldquo;{m.text}&rdquo;</span>
                              <div style={{ position: 'relative', marginTop: 14, height: M ? 72 : 32 }}>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', gap: 8, opacity: 1 - ap }}>
                                  <span ref={reg('approve')} style={{ height: 32, padding: '0 12px', borderRadius: 6, background: C.gold, color: '#fff', display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600, transform: `scale(${1 - clickP * 0.06 * (T > 33.4 ? 1 : 0)})` }}>Add this to my Blueprint</span>
                                  <span style={{ height: 32, padding: '0 12px', borderRadius: 6, border: `1px solid ${C.border}`, background: C.card, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600 }}>Change the wording</span>
                                  <span style={{ height: 32, padding: '0 8px', display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: C.mutedFg }}>Not now</span>
                                </div>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', gap: 8, opacity: ap, transform: `scale(${0.9 + MOTION.pop(ap) * 0.1})`, transformOrigin: '0 50%' }}>
                                  <span style={{ height: 24, padding: '0 10px', borderRadius: 999, background: C.gold, color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600 }}><I d={P.check} size={12} sw={3} /> Added to your Blueprint</span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.fg }}>See the page <I d={P.arrow} size={12} /></span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        const txt = typed(m.text, T, m.at, m.end), done = T >= m.end;
                        return (
                          <div key={m.id} style={Object.assign({ display: 'flex', alignItems: 'flex-start', gap: 12 }, st)}>
                            <Avatar C={C} T={T} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <span style={{ display: 'block', fontSize: 15, lineHeight: 1.6, minHeight: 24 }}>{txt}{!done ? <span style={{ display: 'inline-block', marginLeft: 2, height: 14, width: 2, background: C.fg, verticalAlign: -2, opacity: Math.sin(T * 10) > 0 ? 1 : 0.2 }} /> : null}</span>
                              <div style={{ marginTop: 8, display: 'flex', gap: 4, color: C.mutedFg, opacity: done ? MOTION.enter(T, m.end, 0.3) : 0 }}>
                                <span style={{ height: 28, width: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><I d={P.copy} size={14} /></span>
                                <span style={{ height: 28, width: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><I d={P.refresh} size={14} /></span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {thinking ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <Avatar C={C} T={T} pulse />
                          <span style={{ display: 'flex', height: 42, alignItems: 'center', gap: 6, borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, padding: '0 14px' }}>
                            {[0, 1, 2].map((i) => <span key={i} style={{ height: 6, width: 6, borderRadius: 999, background: C.fg, opacity: 0.5, transform: `translateY(${-Math.max(0, Math.sin(T * 7 - i * 0.9)) * 5}px)` }} />)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* composer */}
                  <div style={{ flex: 'none', padding: M ? '8px 16px 16px' : '8px 28px 20px' }}>
                    <div style={{ maxWidth: 760, margin: '0 auto' }}>
                      <div ref={reg('composer')} style={{ borderRadius: 16, border: `1.5px solid ${recording || focused ? C.fg : C.border}`, background: C.card, transform: recording || focused ? 'translateY(-2px)' : 'none', boxShadow: recording || focused ? '0 10px 30px rgba(0,0,0,0.18)' : '0 1px 2px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                        {recording ? (
                          <div style={{ display: 'flex', minHeight: 52, alignItems: 'center', gap: 14, padding: '6px 6px 6px 12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}><Eq C={C} T={T} e={env(T, RECORDING[0], RECORDING[1], 0.5)} /></div>
                            <span style={{ fontSize: 13, color: C.mutedFg, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>0:{String(Math.floor(T - RECORDING[0])).padStart(2, '0')}</span>
                            <IconBtn C={C} reg={reg} d={P.x} />
                            <IconBtn C={C} reg={reg} id="send-check" d={P.check} filled />
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '6px 6px 6px 14px' }}>
                            <span ref={reg('composer-text')} style={{ flex: 1, padding: '8px 0', minHeight: 40, fontSize: 15, lineHeight: 1.6, color: draft ? C.fg : C.mutedFg, display: 'flex', alignItems: 'center' }}>
                              {draft || (mode && seam < 0.5 ? 'Ask Steward anything…' : 'Choose an option above')}
                              {focused ? <span style={{ display: 'inline-block', marginLeft: 1, height: 16, width: 1.5, background: C.fg, opacity: Math.sin(T * 10) > 0 ? 1 : 0 }} /> : null}
                            </span>
                            <IconBtn C={C} reg={reg} id="mic" d={P.mic} />
                            <IconBtn C={C} reg={reg} id="send" d={P.up} filled dim={!draft} />
                          </div>
                        )}
                      </div>
                      <span style={{ display: 'block', marginTop: 10, padding: '0 4px', fontSize: 11.5, lineHeight: 1.5, color: C.mutedFg }}>Steward is not a counsellor, doctor or crisis service. In the US you can call or text <strong style={{ color: C.fg }}>988</strong> for mental-health crisis support. <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>How Steward handles what you share</span></span>
                      <div style={{ marginTop: 6, display: M ? 'none' : 'flex', justifyContent: 'space-between', gap: 16, padding: '0 4px', fontSize: 11.5, color: C.mutedFg }}>
                        <span>Steward can make mistakes. Confirm anything that touches money or commitments.</span>
                        <span style={{ whiteSpace: 'nowrap' }}><span style={{ border: `1px solid ${C.border}`, borderRadius: 3, padding: '0 4px' }}>⏎</span> send · <span style={{ border: `1px solid ${C.border}`, borderRadius: 3, padding: '0 4px' }}>⇧⏎</span> newline</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
              <span ref={reg('cursor-home')} style={{ position: 'absolute', right: 180, bottom: 60, width: 1, height: 1 }} />
            </div>
          </div>
        </div>

        {/* cursor (in stage space, follows the camera) */}
        <div style={{ position: 'absolute', left: 0, top: 0, opacity: cursorOp, transform: `translate(${W / 2 + (cur.x - cam.x) * cam.s}px, ${H / 2 + (cur.y - cam.y) * cam.s}px)`, pointerEvents: 'none' }}>
          {ring > 0 ? <span style={{ position: 'absolute', left: -22, top: -22, width: 44, height: 44, borderRadius: 999, border: `2px solid ${C.gold}`, background: M ? 'rgba(184,138,74,0.25)' : 'transparent', opacity: 1 - ring, transform: `scale(${0.4 + ring * 1.1})` }} /> : null}
          <svg width="30" height="36" viewBox="0 0 24 28" style={{ display: M ? 'none' : 'block', transform: `scale(${1 - clickP * 0.18})`, transformOrigin: '2px 2px', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.35))' }}>
            <path d="M3 2 L3 23 L8.5 17.8 L12.2 26 L15.8 24.4 L12.2 16.4 L19.5 16.4 Z" fill={C.fg} stroke={C.bg} strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  }

  function StewardAnimation() {
    const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
    const theme = t.theme === 'system' ? (document.documentElement.classList.contains('dark') ? 'dark' : 'light') : t.theme;
    const tw = Object.assign({}, t, { theme });
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <CompositionStage key={t.layout} width={t.layout === 'mobile' ? 1080 : 1920} height={t.layout === 'mobile' ? 1920 : 1080} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={THEMES[theme].bg}>
          <Piece tweaks={tw} />
        </CompositionStage>
        <TweaksPanel>
          <TweakSection label="Layout" />
          <TweakRadio label="Device" value={t.layout || 'desktop'} options={['desktop', 'mobile']} onChange={(v) => setTweak('layout', v)} />
          <TweakSection label="Theme" />
          <TweakRadio label="Mode" value={t.theme} options={['dark', 'light']} onChange={(v) => setTweak('theme', v)} />
          <TweakSection label="3D layers" />
          <TweakToggle label="Particle field" value={t.particles} onChange={(v) => setTweak('particles', v)} />
          <TweakToggle label="Window tilt" value={t.tilt} onChange={(v) => setTweak('tilt', v)} />
          <TweakSection label="Editor" />
          <TweakToggle label="Motion editor" value={t.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
        </TweaksPanel>
      </div>
    );
  }
  window.StewardAnimation = StewardAnimation;
})();
