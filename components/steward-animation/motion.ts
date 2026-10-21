// The motion vocabulary the Steward animation is authored in.
//
// Extracted from animations-v3.jsx, which is a 1347-line authoring harness —
// scene sync, cue tables, an export pipeline, a tweaks panel. The composition
// itself uses four things from it, and those four are here. Porting the harness
// would be porting a tool we do not run.
//
// Every value is a pure function of authored time `t`. That is the property the
// whole thing rests on: it is what lets the same scene be played on a clock
// (autoplay) or scrubbed by a scrollbar (scroll), forwards or backwards, with
// no state to rewind and nothing to get out of sync.

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const Easing = {
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/** The three easings the composition uses, and nothing else. */
export const MOTION = {
  /** 0→1 over `d` seconds starting at `at`. Exactly 0 before it begins. */
  enter: (T: number, at: number, d = 0.55) =>
    clamp((T - at) / d, 0, 1) === 0 ? 0 : Easing.easeOutCubic(clamp((T - at) / d, 0, 1)),
  glide: (p: number) => Easing.easeInOutCubic(clamp(p, 0, 1)),
  pop: (p: number) => Easing.easeOutBack(clamp(p, 0, 1)),
};

/** A 0→1→0 envelope across [a, b], ramping over `ramp` seconds at each end. */
export const env = (T: number, a: number, b: number, ramp = 0.35) =>
  clamp((T - a) / ramp, 0, 1) * clamp((b - T) / ramp, 0, 1);

/** `text` revealed character by character between `a` and `b`. */
export const typed = (text: string, T: number, a: number, b: number) =>
  text.slice(0, Math.round(text.length * clamp((T - a) / (b - a), 0, 1)));

export type Keyframe = {
  at: number;
  /** Seconds spent travelling INTO this key. Default 0.7. */
  d?: number;
  target?: string | null;
};

/**
 * Find where a keyframe track sits at time T.
 *
 * The convention is unusual and worth stating: `d` is the time spent travelling
 * *into* a key, so the move for a key at `at` runs over `[at - d, at]` and the
 * key is reached exactly at `at`. Returns the key currently held, the one being
 * travelled to, and an eased 0→1 through that move.
 */
export function resolveKeys<K extends Keyframe>(keys: K[], T: number) {
  let cur = keys[0];
  let next: K | null = null;
  let p = 1;
  for (let i = 1; i < keys.length; i += 1) {
    const k = keys[i];
    const d = k.d || 0.7;
    if (T >= k.at) {
      cur = k;
      continue;
    }
    if (T > k.at - d) {
      next = k;
      p = (T - (k.at - d)) / d;
    }
    break;
  }
  return { cur, next, p: MOTION.glide(p) };
}
