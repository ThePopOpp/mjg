// @ds-adherence-ignore -- omelette starter scaffold (raw elements/hex/px by design)

/* BEGIN USAGE */
// animations.jsx
// Reusable animation starter: Stage, Timeline, Sprite, easing helpers.
// Exports (to window): Stage, Sprite, PlaybackBar, TextSprite, ImageSprite, RectSprite,
//   useTime, useTimeline, useSprite, Easing, interpolate, animate, clamp.
//
// Usage (in an HTML file that loads React + Babel):
//
//   <Stage width={1280} height={720} duration={10} background="#f6f4ef">
//     <MyScene />
//   </Stage>
//
// <Stage> auto-scales to the viewport and provides the scrubber, play/pause,
// ←/→ seek, space, and 0-to-reset controls, and persists the playhead.
// Inside <Stage>, any child can call useTime() to read the current
// playhead (seconds). Or wrap content in <Sprite start={1} end={4}>...</Sprite>
// to only render during that window -- children receive a `localTime` and
// `progress` via the useSprite() hook. Use Easing + interpolate()/animate()
// for tweens; TextSprite / ImageSprite / RectSprite have built-in entry/exit.
// Build YOUR scenes by composing Sprites inside a Stage.
/* END USAGE */
// ─────────────────────────────────────────────────────────────────────────────

// ── Easing functions (hand-rolled, Popmotion-style) ─────────────────────────
// All easings take t ∈ [0,1] and return eased t ∈ [0,1] (may overshoot for back/elastic).
const Easing = {
  linear: (t) => t,

  // Quad
  easeInQuad:    (t) => t * t,
  easeOutQuad:   (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  // Cubic
  easeInCubic:    (t) => t * t * t,
  easeOutCubic:   (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  // Quart
  easeInQuart:    (t) => t * t * t * t,
  easeOutQuart:   (t) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t),

  // Expo
  easeInExpo:  (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  // Sine
  easeInSine:    (t) => 1 - Math.cos((t * Math.PI) / 2),
  easeOutSine:   (t) => Math.sin((t * Math.PI) / 2),
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,

  // Back (overshoot)
  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158, c2 = c1 * 1.525;
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },

  // Elastic
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

// ── Core interpolation helpers ──────────────────────────────────────────────

// Clamp a value to [min, max]
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// interpolate([0, 0.5, 1], [0, 100, 50], ease?) -> fn(t)
// Popmotion-style: linearly maps t across input keyframes to output values,
// with optional easing per segment (single fn or array of fns).
function interpolate(input, output, ease = Easing.linear) {
  return (t) => {
    if (t <= input[0]) return output[0];
    if (t >= input[input.length - 1]) return output[output.length - 1];
    for (let i = 0; i < input.length - 1; i++) {
      if (t >= input[i] && t <= input[i + 1]) {
        const span = input[i + 1] - input[i];
        const local = span === 0 ? 0 : (t - input[i]) / span;
        const easeFn = Array.isArray(ease) ? (ease[i] || Easing.linear) : ease;
        const eased = easeFn(local);
        return output[i] + (output[i + 1] - output[i]) * eased;
      }
    }
    return output[output.length - 1];
  };
}

// animate({from, to, start, end, ease})(t) — simpler single-segment tween.
// Returns `from` before `start`, `to` after `end`.
function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// ── Timeline context ────────────────────────────────────────────────────────

const TimelineContext = React.createContext({ time: 0, duration: 10, playing: false });

const useTime = () => React.useContext(TimelineContext).time;
const useTimeline = () => React.useContext(TimelineContext);

// ── Sprite ──────────────────────────────────────────────────────────────────
// Renders children only when the playhead is inside [start, end]. Provides
// a sub-context with `localTime` (seconds since start) and `progress` (0..1).
//
//   <Sprite start={2} end={5}>
//     {({ localTime, progress }) => <Thing x={progress * 100} />}
//   </Sprite>
//
// Or as a plain wrapper — children can call useSprite() themselves.

const SpriteContext = React.createContext({ localTime: 0, progress: 0, duration: 0 });
const useSprite = () => React.useContext(SpriteContext);

function Sprite({ start = 0, end = Infinity, children, keepMounted = false }) {
  const { time } = useTimeline();
  const visible = time >= start && time <= end;
  if (!visible && !keepMounted) return null;

  const duration = end - start;
  const localTime = Math.max(0, time - start);
  const progress = duration > 0 && isFinite(duration)
    ? clamp(localTime / duration, 0, 1)
    : 0;

  const value = { localTime, progress, duration, visible };

  return (
    <SpriteContext.Provider value={value}>
      {typeof children === 'function' ? children(value) : children}
    </SpriteContext.Provider>
  );
}

// ── Sample sprite components ────────────────────────────────────────────────

// TextSprite: fades/slides text in on entry, holds, then fades out on exit.
// Props: text, x, y, size, color, font, entryDur, exitDur, align
function TextSprite({
  text,
  x = 0, y = 0,
  size = 48,
  color = '#111',
  font = 'Inter, system-ui, sans-serif',
  weight = 600,
  entryDur = 0.45,
  exitDur = 0.35,
  entryEase = Easing.easeOutBack,
  exitEase = Easing.easeInCubic,
  align = 'left',
  letterSpacing = '-0.01em',
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let ty = 0;

  if (localTime < entryDur) {
    const t = entryEase(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    ty = (1 - t) * 16;
  } else if (localTime > exitStart) {
    const t = exitEase(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    ty = -t * 8;
  }

  const translateX = align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0';

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      transform: `translate(${translateX}, ${ty}px)`,
      opacity,
      fontFamily: font,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing,
      whiteSpace: 'pre',
      lineHeight: 1.1,
      willChange: 'transform, opacity',
    }}>
      {text}
    </div>
  );
}

// ImageSprite: scales + fades in; optional Ken Burns drift during hold.
function ImageSprite({
  src,
  x = 0, y = 0,
  width = 400, height = 300,
  entryDur = 0.6,
  exitDur = 0.4,
  kenBurns = false,
  kenBurnsScale = 1.08,
  radius = 12,
  fit = 'cover',
  placeholder = null, // {label: string} for striped placeholder
}) {
  const { localTime, duration } = useSprite();
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutCubic(clamp(localTime / entryDur, 0, 1));
    opacity = t;
    scale = 0.96 + 0.04 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInCubic(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = (kenBurns ? kenBurnsScale : 1) + 0.02 * t;
  } else if (kenBurns) {
    const holdSpan = exitStart - entryDur;
    const holdT = holdSpan > 0 ? (localTime - entryDur) / holdSpan : 0;
    scale = 1 + (kenBurnsScale - 1) * holdT;
  }

  const content = placeholder ? (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'repeating-linear-gradient(135deg, #e9e6df 0 10px, #dcd8cf 10px 20px)',
      color: '#6b6458',
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      fontSize: 13,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    }}>
      {placeholder.label || 'image'}
    </div>
  ) : (
    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
  );

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      borderRadius: radius,
      overflow: 'hidden',
      willChange: 'transform, opacity',
    }}>
      {content}
    </div>
  );
}

// RectSprite: simple rectangle that animates position/size/color via props.
// Useful demo primitive — takes a `render` fn for per-frame customization.
function RectSprite({
  x = 0, y = 0,
  width = 100, height = 100,
  color = '#111',
  radius = 8,
  entryDur = 0.4,
  exitDur = 0.3,
  render, // optional: (ctx) => style overrides
}) {
  const spriteCtx = useSprite();
  const { localTime, duration } = spriteCtx;
  const exitStart = Math.max(0, duration - exitDur);

  let opacity = 1;
  let scale = 1;

  if (localTime < entryDur) {
    const t = Easing.easeOutBack(clamp(localTime / entryDur, 0, 1));
    opacity = clamp(localTime / entryDur, 0, 1);
    scale = 0.4 + 0.6 * t;
  } else if (localTime > exitStart) {
    const t = Easing.easeInQuad(clamp((localTime - exitStart) / exitDur, 0, 1));
    opacity = 1 - t;
    scale = 1 - 0.15 * t;
  }

  const overrides = render ? render(spriteCtx) : {};

  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width, height,
      background: color,
      borderRadius: radius,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center',
      willChange: 'transform, opacity',
      ...overrides,
    }} />
  );
}


function Stage({
  width = 1280,
  height = 720,
  duration = 10,
  background = '#f6f4ef',
  fps = 60,
  loop = true,
  autoplay = true,
  persistKey = 'animstage',
  children,
}) {
  const [time, setTime] = React.useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(persistKey + ':t') || '0');
      return isFinite(v) ? clamp(v, 0, duration) : 0;
    } catch { return 0; }
  });
  const [playing, setPlaying] = React.useState(autoplay);
  const [hoverTime, setHoverTime] = React.useState(null);
  const [scale, setScale] = React.useState(1);

  const stageRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const lastTsRef = React.useRef(null);

  // Persist playhead
  React.useEffect(() => {
    try { localStorage.setItem(persistKey + ':t', String(time)); } catch {}
  }, [time, persistKey]);

  // Auto-scale to fit viewport
  React.useEffect(() => {
    if (!stageRef.current) return;
    const el = stageRef.current;
    const measure = () => {
      const barH = 44; // playback bar height
      const s = Math.min(
        el.clientWidth / width,
        (el.clientHeight - barH) / height
      );
      setScale(Math.max(0.05, s));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [width, height]);

  // Animation loop
  React.useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const step = (ts) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      setTime((t) => {
        let next = t + dt;
        if (next >= duration) {
          if (loop) next = next % duration;
          else { next = duration; setPlaying(false); }
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [playing, duration, loop]);

  // Keyboard: space = play/pause, ← → = seek
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setPlaying(p => !p);
      } else if (e.code === 'ArrowLeft') {
        setTime(t => clamp(t - (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.code === 'ArrowRight') {
        setTime(t => clamp(t + (e.shiftKey ? 1 : 0.1), 0, duration));
      } else if (e.key === '0' || e.code === 'Home') {
        setTime(0);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [duration]);

  const displayTime = hoverTime != null ? hoverTime : time;

  const ctxValue = React.useMemo(
    () => ({ time: displayTime, duration, playing, setTime, setPlaying }),
    [displayTime, duration, playing]
  );

  return (
    <div
      ref={stageRef}
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        background: '#0a0a0a',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Canvas area — vertically centered in remaining space */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        <div
          ref={canvasRef}
          style={{
            width, height,
            background,
            position: 'relative',
            transform: `scale(${scale})`,
            transformOrigin: 'center',
            flexShrink: 0,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}
        >
          <TimelineContext.Provider value={ctxValue}>
            {children}
          </TimelineContext.Provider>
        </div>
      </div>

      {/* Playback bar — stacked below canvas, never overlapping */}
      <PlaybackBar
        time={displayTime}
        actualTime={time}
        duration={duration}
        playing={playing}
        onPlayPause={() => setPlaying(p => !p)}
        onReset={() => { setTime(0); }}
        onSeek={(t) => setTime(t)}
        onHover={(t) => setHoverTime(t)}
      />
    </div>
  );
}

// ── Playback bar ────────────────────────────────────────────────────────────
// Play/pause, return-to-begin, scrub track, time display.
// Uses fixed-width time fields so layout doesn't thrash.

function PlaybackBar({ time, duration, playing, onPlayPause, onReset, onSeek, onHover }) {
  const trackRef = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const timeFromEvent = React.useCallback((e) => {
    const rect = trackRef.current.getBoundingClientRect();
    const x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    return x * duration;
  }, [duration]);

  const onTrackMove = (e) => {
    if (!trackRef.current) return;
    const t = timeFromEvent(e);
    if (dragging) {
      onSeek(t);
    } else {
      onHover(t);
    }
  };

  const onTrackLeave = () => {
    if (!dragging) onHover(null);
  };

  const onTrackDown = (e) => {
    setDragging(true);
    const t = timeFromEvent(e);
    onSeek(t);
    onHover(null);
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onUp = () => setDragging(false);
    const onMove = (e) => {
      if (!trackRef.current) return;
      const t = timeFromEvent(e);
      onSeek(t);
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
    };
  }, [dragging, timeFromEvent, onSeek]);

  const pct = duration > 0 ? (time / duration) * 100 : 0;
  const fmt = (t) => {
    const total = Math.max(0, t);
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    const cs = Math.floor((total * 100) % 100);
    return `${String(m).padStart(1, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const mono = 'JetBrains Mono, ui-monospace, SFMono-Regular, monospace';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '8px 16px',
      background: 'rgba(20,20,20,0.92)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      width: '100%',
      maxWidth: 680,
      alignSelf: 'center',

      borderRadius: 8,
      color: '#f6f4ef',
      fontFamily: 'Inter, system-ui, sans-serif',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <IconButton onClick={onReset} title="Return to start (0)">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 2v10M12 2L5 7l7 5V2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
        </svg>
      </IconButton>
      <IconButton onClick={onPlayPause} title="Play/pause (space)">
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="2" width="3" height="10" fill="currentColor"/>
            <rect x="8" y="2" width="3" height="10" fill="currentColor"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
          </svg>
        )}
      </IconButton>

      {/* Current time: fixed width so it doesn't thrash */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'right',
        color: '#f6f4ef',
      }}>
        {fmt(time)}
      </div>

      {/* Scrub track */}
      <div
        ref={trackRef}
        onMouseMove={onTrackMove}
        onMouseLeave={onTrackLeave}
        onMouseDown={onTrackDown}
        style={{
          flex: 1,
          height: 22,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, right: 0, height: 4,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: 0, width: `${pct}%`, height: 4,
          background: 'oklch(72% 0.12 250)',
          borderRadius: 2,
        }}/>
        <div style={{
          position: 'absolute',
          left: `${pct}%`, top: '50%',
          width: 12, height: 12,
          marginLeft: -6, marginTop: -6,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
        }}/>
      </div>

      {/* Duration: fixed width */}
      <div style={{
        fontFamily: mono,
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        width: 64, textAlign: 'left',
        color: 'rgba(246,244,239,0.55)',
      }}>
        {fmt(duration)}
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 28, height: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 6,
        color: '#f6f4ef',
        cursor: 'pointer',
        padding: 0,
        transition: 'background 120ms',
      }}
    >
      {children}
    </button>
  );
}


Object.assign(window, {
  Easing, interpolate, animate, clamp,
  TimelineContext, useTime, useTimeline,
  Sprite, SpriteContext, useSprite,
  TextSprite, ImageSprite, RectSprite,
  Stage, PlaybackBar,
});

// ══════════════════════════════════════════════════════════════════════════
//  MJG · The Stewardship Blueprint — 20s brand animation
// ══════════════════════════════════════════════════════════════════════════

const GOLD    = '#BF9B57';
const GOLD_LT = '#E0C892';
const GOLD_DK = '#9B7B3C';
const INK     = '#211C16';
const MUTE    = '#8A8071';
const CREAM   = '#F7F4ED';
const SERIF   = "'Playfair Display', Georgia, serif";
const SANS    = "'Manrope', system-ui, sans-serif";
const GRIDC   = 'rgba(33,28,22,0.055)';

// 0→1 envelope: ramp up [a,b], hold, ramp down [c,d]
function band(t, a, b, c, d) {
  if (t < a) return 0;
  if (t < b) return Easing.easeOutCubic((t - a) / (b - a));
  if (t < c) return 1;
  if (t < d) return 1 - Easing.easeInCubic((t - c) / (d - c));
  return 0;
}
// eased 0→1 entry progress
function ein(t, a, b) { return Easing.easeOutCubic(clamp((t - a) / (b - a), 0, 1)); }
// straight-line draw fraction → dashoffset
function lineLen(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }
function ptAlong(pts, frac) {
  let total = 0; const segs = [];
  for (let i = 0; i < pts.length - 1; i++) { const l = lineLen(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); segs.push(l); total += l; }
  let d = clamp(frac, 0, 1) * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i] || i === segs.length - 1) { const u = segs[i] ? d / segs[i] : 0; return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * u, y: pts[i].y + (pts[i + 1].y - pts[i].y) * u }; }
    d -= segs[i];
  }
  return pts[pts.length - 1];
}
const GOLD_GLOW = 'rgba(191,155,87,0.16)';
const GOLD_BURST = 'rgba(191,155,87,0.24)';
const MOTES = Array.from({ length: 28 }, (_, i) => {
  const r = (s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
  return { x: r(1) * 1920, y: r(2) * 1080, sz: 1.1 + r(3) * 2.4, sp: 8 + r(4) * 26, ph: r(5) * Math.PI * 2, drift: (r(6) - 0.5) * 60 };
});

// ── Drifting gold dust motes (persistent atmosphere) ─────────────────────────
function Motes() {
  const t = useTime();
  const glob = animate({ from: 0, to: 1, start: 0.5, end: 2.4 })(t) * animate({ from: 1, to: 0.7, start: 17, end: 19 })(t);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {MOTES.map((m, i) => {
        const y = (((m.y - t * m.sp) % 1120) + 1120) % 1120 - 20;
        const x = m.x + Math.sin(t * 0.35 + m.ph) * m.drift;
        const tw = 0.22 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.25 + m.ph));
        return <circle key={i} cx={x} cy={y} r={m.sz} fill={GOLD} opacity={tw * 0.45 * glob} />;
      })}
    </svg>
  );
}

// ── Subtle blueprint grid (persistent) ──────────────────────────────────────
function BlueprintGrid() {
  const t = useTime();
  const op = animate({ from: 0, to: 1, start: 0.1, end: 1.8, ease: Easing.easeOutCubic })(t);
  const settle = animate({ from: 1, to: 0.55, start: 16.8, end: 18.4 })(t);
  const o = op * settle;
  const step = 80;
  const vx = []; for (let x = step; x < 1920; x += step) vx.push(x);
  const hy = []; for (let y = step; y < 1080; y += step) hy.push(y);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {vx.map((x, i) => <line key={'v' + i} x1={x} y1={0} x2={x} y2={1080} stroke={GRIDC} strokeWidth={1} opacity={o} />)}
      {hy.map((y, i) => <line key={'h' + i} x1={0} y1={y} x2={1920} y2={y} stroke={GRIDC} strokeWidth={1} opacity={o} />)}
    </svg>
  );
}

// ── Reusable drawn straight line ─────────────────────────────────────────────
function GLine({ x1, y1, x2, y2, t, start, dur, color = GOLD, w = 2, ease = Easing.easeInOutCubic, opacity = 1, cap = 'round' }) {
  const len = lineLen(x1, y1, x2, y2);
  const p = animate({ from: 0, to: 1, start, end: start + dur, ease })(t);
  if (p <= 0) return null;
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w}
    strokeDasharray={len} strokeDashoffset={len * (1 - p)} strokeLinecap={cap} opacity={opacity} />;
}

// ── Drawn node dot ───────────────────────────────────────────────────────────
function Node({ cx, cy, t, at, r = 9, color = GOLD, fill = CREAM }) {
  const p = ein(t, at, at + 0.4);
  if (p <= 0) return null;
  const ping = clamp((t - at) / 0.9, 0, 1);
  return (
    <g>
      {ping > 0.001 && ping < 1 && (
        <circle cx={cx} cy={cy} r={r + ping * 36} fill="none" stroke={color} strokeWidth={2} opacity={(1 - ping) * 0.6} />
      )}
      <g opacity={p}>
        <circle cx={cx} cy={cy} r={r} fill={fill} stroke={color} strokeWidth={3} transform={`scale(${0.4 + 0.6 * Easing.easeOutBack(p)})`} style={{ transformOrigin: `${cx}px ${cy}px` }} />
      </g>
    </g>
  );
}

// ── Brand lockup (monogram + name) ───────────────────────────────────────────
function LogoReveal({ t, start, cx = 960, cy = 380, size = 80, exitA = 999, exitB = 999 }) {
  const op = band(t, start, start + 0.6, exitA, exitB);
  if (op <= 0) return null;
  const s = 0.9 + 0.1 * Easing.easeOutCubic(clamp((t - start) / 0.7, 0, 1));
  const sweep = clamp((t - (start + 0.45)) / 1.0, 0, 1);
  const cw = size * 7.6, ch = size * 3.4;
  const ruleP = ein(t, start + 0.3, start + 0.9);
  return (
    <div style={{
      position: 'absolute', left: cx, top: cy, width: cw, height: ch,
      transform: `translate(-50%,-50%) scale(${s})`, opacity: op,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: size * 0.24,
    }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: cw * 0.72, height: ch * 0.92, transform: 'translate(-50%,-50%)', background: `radial-gradient(closest-side, ${GOLD_GLOW}, transparent 72%)`, opacity: Easing.easeOutCubic(clamp((t - start) / 0.7, 0, 1)) * (0.55 + 0.45 * Math.sin((t - start) * 1.7)), pointerEvents: 'none' }} />
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <img src="./mjg-logo-black.svg" alt="MJG" style={{ height: size * 1.32, width: 'auto', display: 'block' }} />
        {sweep > 0 && sweep < 1 && (
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: '36%', left: `${-30 + sweep * 130}%`,
            background: 'linear-gradient(105deg, transparent, rgba(255,248,233,0.0) 30%, rgba(255,248,233,0.6) 50%, rgba(255,248,233,0.0) 70%, transparent)',
            transform: 'skewX(-14deg)', mixBlendMode: 'overlay', pointerEvents: 'none',
          }} />
        )}
      </div>
      <div style={{ width: size * 2.4 * ruleP, height: 2, background: 'rgba(33,28,22,0.22)' }} />
      <div style={{
        fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: size * 0.5,
        color: INK, letterSpacing: '0.01em', whiteSpace: 'nowrap',
      }}>Michael&nbsp;J.&nbsp;Gauthier</div>
    </div>
  );
}

// ── Caption (silent-film VO line, lower third) ───────────────────────────────
function Caption({ t, text, a, b, c, d }) {
  const op = band(t, a, b, c, d);
  if (op <= 0) return null;
  const rise = (1 - ein(t, a, b)) * 12;
  return (
    <div style={{
      position: 'absolute', left: '50%', top: 966, transform: `translate(-50%, ${rise}px)`,
      width: 1320, textAlign: 'center', fontFamily: SANS, fontSize: 29, fontWeight: 500,
      color: MUTE, opacity: op, letterSpacing: '0.005em', lineHeight: 1.4,
    }}>{text}</div>
  );
}

// ── Scene 1 — Blueprint canvas opens (0–4) ───────────────────────────────────
function Scene1() {
  const t = useTime();
  if (t > 4.3) return null;
  const ulLen = 360;
  const ulP = animate({ from: 0, to: 1, start: 1.4, end: 2.3, ease: Easing.easeInOutCubic })(t);
  const ulOp = band(t, 1.6, 1.9, 2.45, 2.8);
  const typed = 'You Were Created for';
  const tyP = clamp((t - 0.8) / 1.45, 0, 1);
  const shown = typed.slice(0, Math.round(tyP * typed.length));
  const caretOn = t < 2.5 && (Math.floor((t - 0.8) * 3) % 2 === 0);
  const typeOp = band(t, 0.8, 1.0, 2.45, 2.8);
  const typeRise = (1 - ein(t, 0.7, 1.1)) * 10;
  const moreOp = band(t, 2.7, 3.1, 3.5, 4.0);
  const moreS = 0.7 + 0.3 * Easing.easeOutBack(clamp((t - 2.7) / 0.7, 0, 1));
  // drafting frame
  const inset = 116, fx2 = 1920 - inset, fy2 = 1080 - inset;
  const perim = 2 * ((fx2 - inset) + (fy2 - inset));
  const fp = animate({ from: 0, to: 1, start: 0.3, end: 2.2, ease: Easing.easeInOutCubic })(t);
  const frameOp = band(t, 0.3, 0.9, 3.3, 4.1) * 0.9;
  const fw = fx2 - inset, fh = fy2 - inset, pen = fp * perim;
  let penX = inset, penY = inset;
  if (pen <= fw) { penX = inset + pen; penY = inset; }
  else if (pen <= fw + fh) { penX = fx2; penY = inset + (pen - fw); }
  else if (pen <= 2 * fw + fh) { penX = fx2 - (pen - fw - fh); penY = fy2; }
  else { penX = inset; penY = fy2 - (pen - 2 * fw - fh); }
  const penOn = fp > 0.01 && fp < 0.992;
  return (
    <React.Fragment>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <rect x={inset} y={inset} width={fx2 - inset} height={fy2 - inset} fill="none"
          stroke={GOLD} strokeWidth={1.5} strokeDasharray={perim} strokeDashoffset={perim * (1 - fp)} opacity={frameOp} />
        {penOn && (
          <g opacity={frameOp}>
            <circle cx={penX} cy={penY} r={14} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.5} />
            <circle cx={penX} cy={penY} r={6} fill={GOLD} />
          </g>
        )}
        {/* corner crop ticks */}
        {[[inset, inset, 1, 1], [fx2, inset, -1, 1], [inset, fy2, 1, -1], [fx2, fy2, -1, -1]].map(([x, y, sx, sy], i) => (
          <g key={i} opacity={band(t, 1.7, 2.1, 3.3, 4.1)}>
            <line x1={x} y1={y} x2={x + sx * 26} y2={y} stroke={GOLD_DK} strokeWidth={1.5} />
            <line x1={x} y1={y} x2={x} y2={y + sy * 26} stroke={GOLD_DK} strokeWidth={1.5} />
          </g>
        ))}
        {/* underline draw under headline */}
        <line x1={960 - ulLen / 2} y1={636} x2={960 - ulLen / 2 + ulLen} y2={636}
          stroke={GOLD} strokeWidth={2.5} strokeDasharray={ulLen} strokeDashoffset={ulLen * (1 - ulP)} opacity={ulOp} strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `translateY(${typeRise}px)`, opacity: typeOp }}>
        <div style={{ fontFamily: SERIF, color: INK, fontSize: 104, fontWeight: 600, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{shown}<span style={{ opacity: caretOn ? 1 : 0, color: GOLD, fontWeight: 400 }}>|</span></div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: moreOp, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: `${500 + 1000 * ein(t, 2.7, 3.5)}px`, height: `${500 + 1000 * ein(t, 2.7, 3.5)}px`, borderRadius: '50%', background: `radial-gradient(closest-side, ${GOLD_BURST}, transparent 70%)`, filter: 'blur(10px)', opacity: ein(t, 2.7, 3.4) }} />
        <div style={{ position: 'relative', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 300, color: GOLD, lineHeight: 1, transform: `scale(${moreS})`, letterSpacing: '0.06em', textShadow: `0 0 36px ${GOLD_BURST}` }}>MORE</div>
      </div>
      <Caption t={t} text="What if your life was meant to be designed with purpose?" a={0.9} b={1.6} c={3.2} d={3.9} />
    </React.Fragment>
  );
}

// ── Scene 2 — Logo reveal + brand title (3.6–6.3) ────────────────────────────
function Scene2() {
  const t = useTime();
  if (t < 3.3 || t > 6.4) return null;
  const h1 = band(t, 4.0, 4.7, 5.6, 6.2);
  const h1r = (1 - ein(t, 4.0, 4.7)) * 24;
  // forming blueprint arcs behind
  const arcP = animate({ from: 0, to: 1, start: 3.8, end: 5.4, ease: Easing.easeInOutCubic })(t);
  const arcOp = band(t, 3.8, 4.3, 5.6, 6.2) * 0.5;
  const aR = 300, aLen = Math.PI * aR;
  return (
    <React.Fragment>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <GLine x1={150} y1={606} x2={470} y2={606} t={t} start={3.9} dur={1.2} color={GOLD} w={1.5} opacity={arcOp} />
        <GLine x1={1770} y1={606} x2={1450} y2={606} t={t} start={3.9} dur={1.2} color={GOLD} w={1.5} opacity={arcOp} />
      </svg>
      <LogoReveal t={t} start={3.5} cx={960} cy={328} size={68} exitA={5.7} exitB={6.3} />
      <div style={{
        position: 'absolute', left: 0, top: 452, width: '100%', textAlign: 'center',
        transform: `translateY(${h1r}px)`,
        opacity: h1, fontFamily: SERIF, color: INK, lineHeight: 1.08,
      }}>
        <div style={{ fontSize: 90, fontWeight: 600, letterSpacing: '-0.01em' }}>The Stewardship</div>
        <div style={{ fontSize: 124, fontWeight: 600, fontStyle: 'italic', color: GOLD, marginTop: 14 }}>Blueprint</div>
      </div>
      <Caption t={t} text="The Stewardship Blueprint connects what you believe with how you live." a={4.0} b={4.6} c={5.6} d={6.1} />
    </React.Fragment>
  );
}

// ── Scene 3 — Three pillars build (6–12.4) ───────────────────────────────────
function Scene3() {
  const t = useTime();
  if (t < 6.0 || t > 12.5) return null;
  const baseY = 812, top = 472, bot = 778, shaftLen = bot - top, sh = 56;
  const cols = [
    { cx: 600, start: 6.3, num: 'I', word: 'Faith' },
    { cx: 960, start: 7.6, num: 'II', word: 'Family' },
    { cx: 1320, start: 8.9, num: 'III', word: 'Finance' },
  ];
  const groundP = animate({ from: 0, to: 1, start: 6.0, end: 6.9, ease: Easing.easeInOutCubic })(t);
  const gLen = 1020, gx = 960 - gLen / 2;
  const groundOp = band(t, 6.0, 6.4, 11.7, 12.3);
  const flutes = [-0.55, 0, 0.55];
  return (
    <React.Fragment>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={gx} y1={baseY} x2={gx + gLen} y2={baseY} stroke={GOLD} strokeWidth={2.5}
          strokeDasharray={gLen} strokeDashoffset={gLen * (1 - groundP)} opacity={groundOp} strokeLinecap="round" />
        {cols.map((col, i) => {
          const s0 = col.start;
          const op = band(t, s0, s0 + 0.25, 11.7, 12.3);
          const shaftP = animate({ from: 0, to: 1, start: s0, end: s0 + 0.75, ease: Easing.easeInOutCubic })(t);
          const capS = ein(t, s0 + 0.5, s0 + 0.95);
          const baseS = ein(t, s0 + 0.45, s0 + 0.9);
          const fluteP = animate({ from: 0, to: 1, start: s0 + 0.7, end: s0 + 1.15 })(t);
          const rise = animate({ from: 0, to: 1, start: s0 + 0.2, end: s0 + 1.3 })(t);
          const fill = animate({ from: 0, to: 0.08, start: s0 + 0.6, end: s0 + 1.1 })(t) * op;
          return (
            <g key={i} opacity={op}>
              <rect x={col.cx - sh} y={top} width={sh * 2} height={shaftLen} fill={GOLD} opacity={fill} />
              {rise > 0.02 && rise < 0.99 && (
                <rect x={col.cx - sh} y={top + shaftLen * (1 - rise) - 34} width={sh * 2} height={68} fill={GOLD} opacity={0.16} />
              )}
              <line x1={col.cx - sh} y1={bot} x2={col.cx - sh} y2={top} stroke={GOLD} strokeWidth={2.5} strokeDasharray={shaftLen} strokeDashoffset={shaftLen * (1 - shaftP)} strokeLinecap="round" />
              <line x1={col.cx + sh} y1={bot} x2={col.cx + sh} y2={top} stroke={GOLD} strokeWidth={2.5} strokeDasharray={shaftLen} strokeDashoffset={shaftLen * (1 - shaftP)} strokeLinecap="round" />
              {flutes.map((f, k) => <line key={k} x1={col.cx + f * sh} y1={top + 10} x2={col.cx + f * sh} y2={bot - 10} stroke={GOLD} strokeWidth={1} opacity={0.38 * fluteP} />)}
              <g opacity={capS} style={{ transformOrigin: `${col.cx}px ${top}px`, transform: `scale(${0.6 + 0.4 * capS})` }}>
                <line x1={col.cx - 70} y1={top} x2={col.cx + 70} y2={top} stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
                <line x1={col.cx - 86} y1={top - 14} x2={col.cx - 70} y2={top} stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
                <line x1={col.cx + 86} y1={top - 14} x2={col.cx + 70} y2={top} stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
                <rect x={col.cx - 90} y={top - 30} width={180} height={16} fill="none" stroke={GOLD} strokeWidth={2.5} />
              </g>
              <g opacity={baseS} style={{ transformOrigin: `${col.cx}px ${bot}px`, transform: `scale(${0.6 + 0.4 * baseS})` }}>
                <line x1={col.cx - 72} y1={bot} x2={col.cx + 72} y2={bot} stroke={GOLD} strokeWidth={2.5} strokeLinecap="round" />
                <line x1={col.cx - 90} y1={bot + 14} x2={col.cx - 72} y2={bot} stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
                <line x1={col.cx + 90} y1={bot + 14} x2={col.cx + 72} y2={bot} stroke={GOLD} strokeWidth={2} strokeLinecap="round" />
                <rect x={col.cx - 96} y={bot + 14} width={192} height={18} fill="none" stroke={GOLD} strokeWidth={2.5} />
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
            <div style={{ position: 'absolute', left: col.cx, top: 346, transform: `translate(-50%, calc(-50% + ${(1 - medP) * 74}px)) scale(${0.6 + 0.4 * Easing.easeOutBack(medP)})`, width: 86, height: 86, borderRadius: '50%', border: `1.5px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: medOp, boxShadow: `0 0 26px ${GOLD_GLOW}`, background: CREAM }}>
              <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 40, color: GOLD, letterSpacing: '0.02em' }}>{col.num}</span>
            </div>
            <div style={{ position: 'absolute', left: col.cx, top: 858, transform: `translateX(-50%) translateY(${wordRise}px)`, fontFamily: SERIF, fontWeight: 600, fontSize: 56, color: INK, opacity: wordOp, whiteSpace: 'nowrap' }}>{col.word}</div>
          </React.Fragment>
        );
      })}
      <Caption t={t} text="Faith is the foundation." a={6.4} b={7.0} c={7.6} d={7.9} />
      <Caption t={t} text="Family is the calling." a={7.9} b={8.4} c={8.9} d={9.2} />
      <Caption t={t} text="Finance is a tool for stewardship." a={9.3} b={9.9} c={11.4} d={11.9} />
    </React.Fragment>
  );
}

// ── Scene 4 — Alignment / legacy path (12–17.2) ──────────────────────────────
function Scene4() {
  const t = useTime();
  if (t < 12.0 || t > 17.3) return null;
  // gentle push-in
  const z = animate({ from: 1, to: 1.07, start: 12.0, end: 17.2, ease: Easing.easeInOutSine })(t);
  const sceneOp = band(t, 12.2, 12.9, 16.6, 17.2);
  // path: three pillar bases (left) → ascending milestones (right)
  const pillars = [{ cx: 360 }, { cx: 470 }, { cx: 580 }];
  const baseY = 720;
  const pillars = [{ cx: 360 }, { cx: 470 }, { cx: 580 }];
  const baseY = 800;
  const milestones = [
    { x: 880, y: 648, label: 'Purpose', at: 13.4 },
    { x: 1180, y: 484, label: 'Future', at: 14.2 },
    { x: 1480, y: 312, label: 'Legacy', at: 15.0 },
  ];
  const pts = [{ x: 600, y: baseY }, ...milestones.map(m => ({ x: m.x, y: m.y }))];
  let pathLen = 0; const segs = [];
  for (let i = 0; i < pts.length - 1; i++) { const l = lineLen(pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y); segs.push(l); pathLen += l; }
  const pathP = animate({ from: 0, to: 1, start: 12.6, end: 15.4, ease: Easing.easeInOutCubic })(t);
  const pd = `M ${pts.map(p => `${p.x} ${p.y}`).join(' L ')}`;
  const baseLineLen = 240;
  const baseP = animate({ from: 0, to: 1, start: 12.4, end: 13.0 })(t);
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `scale(${z})`, transformOrigin: '54% 54%', opacity: sceneOp }}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* mini pillars */}
        {pillars.map((p, i) => {
          const op = band(t, 12.2, 12.6, 16.6, 17.2);
          return <rect key={i} x={p.cx - 26} y={baseY - 150} width={52} height={150} fill="none" stroke={GOLD} strokeWidth={2} opacity={op * 0.85} />;
        })}
        {/* base connector */}
        <line x1={360} y1={baseY} x2={600} y2={baseY} stroke={GOLD} strokeWidth={2.5} strokeDasharray={baseLineLen} strokeDashoffset={baseLineLen * (1 - baseP)} strokeLinecap="round" />
        {/* ascending legacy path */}
        <path d={pd} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - pathP)} strokeLinecap="round" strokeLinejoin="round" />
        {pathP > 0.02 && pathP < 0.99 && (() => { const tip = ptAlong(pts, pathP); return <g key="tip"><circle cx={tip.x} cy={tip.y} r={13} fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.5} /><circle cx={tip.x} cy={tip.y} r={6} fill={GOLD} /></g>; })()}
        {/* faint extension beyond legacy */}
        <line x1={1480} y1={312} x2={1680} y2={208} stroke={GOLD} strokeWidth={2} strokeDasharray="2 10" opacity={band(t, 15.2, 15.6, 16.6, 17.2) * 0.7} strokeLinecap="round" />
        {milestones.map((m, i) => <Node key={i} cx={m.x} cy={m.y} t={t} at={m.at} r={10} />)}
      </svg>
      {milestones.map((m, i) => {
        const op = band(t, m.at + 0.1, m.at + 0.5, 16.6, 17.2);
        const rp = ein(t, m.at + 0.05, m.at + 0.6);
        return (
          <div key={i} style={{
            position: 'absolute', left: m.x + 30, top: m.y, transform: 'translateY(-50%)', overflow: 'hidden', opacity: op,
          }}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 36, color: INK, whiteSpace: 'nowrap', transform: `translateX(${(1 - rp) * -20}px)`, clipPath: `inset(0 ${(1 - rp) * 100}% 0 0)` }}>{m.label}</div>
          </div>
        );
      })}
      <div style={{
        position: 'absolute', left: 470, top: baseY + 34, transform: 'translateX(-50%)',
        fontFamily: SANS, fontSize: 24, fontWeight: 700, letterSpacing: '0.2em', color: GOLD_DK, whiteSpace: 'nowrap',
        opacity: band(t, 12.8, 13.3, 16.6, 17.2),
      }}>FAITH&nbsp;·&nbsp;FAMILY&nbsp;·&nbsp;FINANCE</div>
      <Caption t={t} text="When these areas align, your resources can support what matters most." a={13.0} b={13.7} c={16.4} d={16.9} />
    </div>
  );
}

// ── Scene 5 — Final CTA (17–20) ──────────────────────────────────────────────
function Scene5() {
  const t = useTime();
  if (t < 17.0) return null;
  const lineP = animate({ from: 0, to: 1, start: 18.0, end: 18.8, ease: Easing.easeInOutCubic })(t);
  const accLen = 240;
  const accOp = band(t, 18.0, 18.3, 99, 99);
  const h1 = band(t, 18.0, 18.7, 99, 99);
  const h1r = (1 - ein(t, 18.0, 18.7)) * 22;
  const lblOp = band(t, 18.6, 19.2, 99, 99);
  return (
    <React.Fragment>
      <LogoReveal t={t} start={17.3} cx={960} cy={372} size={86} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <line x1={960 - accLen / 2} y1={520} x2={960 - accLen / 2 + accLen} y2={520}
          stroke={GOLD} strokeWidth={2.5} strokeDasharray={accLen} strokeDashoffset={accLen * (1 - lineP)} opacity={accOp} strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', left: 0, top: 556, width: '100%', textAlign: 'center',
        transform: `translateY(${h1r}px)`,
        opacity: h1, fontFamily: SERIF, fontWeight: 600, fontSize: 78, color: INK, lineHeight: 1.05, whiteSpace: 'nowrap',
      }}>Begin Your Stewardship <span style={{ fontStyle: 'italic', color: GOLD }}>Journey</span></div>
      <div style={{
        position: 'absolute', left: '50%', top: 688, transform: 'translateX(-50%)',
        opacity: lblOp, fontFamily: SANS, fontSize: 27, fontWeight: 700, letterSpacing: '0.34em', color: GOLD_DK,
      }}>FAITH&nbsp;&nbsp;·&nbsp;&nbsp;FAMILY&nbsp;&nbsp;·&nbsp;&nbsp;FINANCE&nbsp;&nbsp;·&nbsp;&nbsp;FUTURE</div>
    </React.Fragment>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
function MJGStewardship() {
  return (
    <Stage width={1920} height={1080} duration={20} background={CREAM} persistKey="mjg-stewardship">
      <BlueprintGrid />
      <Motes />
      <Scene1 />
      <Scene2 />
      <Scene3 />
      <Scene4 />
      <Scene5 />
      {/* warm top/bottom edge softening */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 220px rgba(33,28,22,0.05)' }} />
    </Stage>
  );
}

Object.assign(window, { MJGStewardship, BlueprintGrid });

