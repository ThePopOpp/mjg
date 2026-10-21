// The authored Steward demo: a 37-second product story, as data.
//
// Copied verbatim from the approved steward-scene.jsx. Every number is a beat
// someone timed by eye against the rendered video, so these are not values to
// tidy, round or "improve" — changing one changes the film. If the story needs
// to change, it should be re-authored in the original tool and re-exported.
//
// The five scenes, per the source's own scene list:
//   Opening  1s   the welcome screen settles, camera pushes toward the cards
//   Listen  11s   Listen First is chosen, a voice note is recorded, Steward answers
//   Think   12s   Help Me Think is chosen, a question is typed and sent
//   Step    11s   Steward proposes Guardrails wording and it is approved
//   Close    2s   camera pulls back to the whole app
//
// The Step beat is the one that matters commercially: it is propose → approve →
// written, which is the contract the entire product is built on.

export const AUTHORED_TOTAL = 37;

export const SCENES = [
  { name: "Opening", dur: 1 },
  { name: "Listen", dur: 11 },
  { name: "Think", dur: 12 },
  { name: "Step", dur: 11 },
  { name: "Close", dur: 2 },
] as const;

// ── Theme tokens (mirroring app/globals.css :root / .dark) ──────────────────

export type Theme = {
  bg: string;
  bgA: string;
  fg: string;
  card: string;
  muted: string;
  mutedFg: string;
  border: string;
  gold: string;
  goldText: string;
  particle: string;
  particleOpacity: number;
  bubbleBg: string;
  bubbleFg: string;
  logo: string;
};

const ASSETS = "/steward/anim";

export const THEMES: Record<"dark" | "light", Theme> = {
  dark: {
    bg: "#141211",
    bgA: "rgba(20,18,17,0.84)",
    fg: "#F0EBE0",
    card: "#1F1C19",
    muted: "#2C2825",
    mutedFg: "#B1AA9A",
    border: "#373330",
    gold: "#b88a4a",
    goldText: "#d4a862",
    particle: "#c9a96e",
    particleOpacity: 0.55,
    bubbleBg: "#F0EBE0",
    bubbleFg: "#141211",
    logo: `${ASSETS}/mjg-logo-white.svg`,
  },
  light: {
    bg: "#FBFAF8",
    bgA: "rgba(251,250,248,0.86)",
    fg: "#1F1C19",
    card: "#FFFFFF",
    muted: "#F4F1EB",
    mutedFg: "#6D665F",
    border: "#E1DBD0",
    gold: "#b88a4a",
    goldText: "#9a6f30",
    particle: "#B6924F",
    particleOpacity: 0.35,
    bubbleBg: "#1F1C19",
    bubbleFg: "#FBFAF8",
    logo: `${ASSETS}/mjg-logo-black.svg`,
  },
};

export const S_MARK = `${ASSETS}/s-steps-gold.svg`;
export const SANS = '"Geist", Arial, sans-serif';
export const SERIF = '"Fraunces", Georgia, serif';

// ── The script ───────────────────────────────────────────────────────────────

export type Msg =
  | { id: string; role: "steward"; at: number; end: number; text: string }
  | { id: string; role: "member"; at: number; text: string; voice?: boolean }
  | { id: string; role: "proposal"; at: number; approveAt: number; label: string; text: string };

export const MSGS: Msg[] = [
  { id: "l0", role: "steward", at: 2.0, end: 3.3, text: "I'm listening. What would you like to discuss?" },
  { id: "l1", role: "member", voice: true, at: 8.8, text: "I need help with my family situation." },
  { id: "l2", role: "steward", at: 10.0, end: 11.0, text: "I'm here. Keep going." },
  { id: "t0", role: "steward", at: 13.0, end: 14.3, text: "Let's think it through. What's the decision in front of you?" },
  { id: "t1", role: "member", at: 17.9, text: "I keep saying yes, then resenting it." },
  { id: "t2", role: "steward", at: 19.0, end: 21.4, text: "That sounds like a guardrail that isn't written down yet. What are you protecting when you say yes?" },
  { id: "s0", role: "steward", at: 25.0, end: 26.3, text: "Let's find one small step you'll actually take this week." },
  { id: "s1", role: "member", at: 28.9, text: "Not letting people down." },
  { id: "s2", role: "steward", at: 30.0, end: 31.8, text: "Then the cost lands on the people closest to you. Here is wording for your Guardrails page." },
  {
    id: "p",
    role: "proposal",
    at: 32.4,
    approveAt: 34.0,
    label: "Guardrails — Protect What Matters",
    text: "I don’t say yes on the spot. I check, and I come back.",
  },
];

export const THINKING: [number, number][] = [
  [9.2, 10.0],
  [18.2, 19.0],
  [29.2, 30.0],
];
export const RECORDING: [number, number] = [5.3, 8.5];
export const TYPING = [
  { a: 15.1, b: 17.6, text: "I keep saying yes, then resenting it." },
  { a: 26.7, b: 28.6, text: "Not letting people down." },
];
export const MODE_AT = { listen: 1.6, think: 12.5, step: 24.5 };

export const MODES = [
  { key: "listen", label: "Listen First", blurb: "Say it out loud. No advice back unless you ask." },
  { key: "think", label: "Help Me Think", blurb: "Work through it together. Questions, options, trade-offs." },
  { key: "step", label: "Help Me Take a Step", blurb: "Turn it into one thing you can actually do this week." },
] as const;

export const THREADS: [string, string][] = [
  ["Saying yes before I mean it", "Now"],
  ["What I actually stand on", "2d"],
  ["Thursday mornings with Dave", "1w"],
  ["Where my energy goes", "3w"],
];

/** Camera keys. `s` is zoom; `target` is a registered element id, or null for the whole stage. */
export const CAM = [
  { at: 0, target: null, s: 1 },
  { at: 1.4, d: 1.2, target: "cards", s: 1.45 },
  { at: 3.0, d: 0.9, target: "chat", s: 1.15 },
  { at: 5.6, d: 0.8, target: "composer", s: 1.6 },
  { at: 9.4, d: 0.8, target: "chat", s: 1.15 },
  { at: 12.5, d: 0.6, target: "pills", s: 1.7 },
  { at: 13.9, d: 0.8, target: "chat", s: 1.15 },
  { at: 15.4, d: 0.6, target: "composer", s: 1.5 },
  { at: 18.8, d: 0.8, target: "chat", s: 1.15 },
  { at: 24.5, d: 0.6, target: "pills", s: 1.7 },
  { at: 25.9, d: 0.8, target: "chat", s: 1.15 },
  { at: 27.0, d: 0.6, target: "composer", s: 1.5 },
  { at: 29.6, d: 0.8, target: "chat", s: 1.15 },
  { at: 36.0, d: 1.1, target: null, s: 1 },
] as const;

/** Pointer keys. `click` is when the press lands, which drives the ring and the dip. */
export const CURSOR = [
  { at: 0, target: "cursor-home" },
  { at: 1.5, d: 1.2, target: "card-listen", click: 1.6 },
  { at: 5.2, d: 0.9, target: "mic", click: 5.3 },
  { at: 8.4, d: 0.7, target: "send-check", click: 8.5 },
  { at: 8.6, d: 0.1, target: "composer" },
  { at: 12.4, d: 1.0, target: "pill-think", click: 12.5 },
  { at: 15.0, d: 0.8, target: "composer-text", click: 15.1 },
  { at: 17.7, d: 0.6, target: "send", click: 17.8 },
  { at: 24.4, d: 1.0, target: "pill-step", click: 24.5 },
  { at: 26.6, d: 0.8, target: "composer-text", click: 26.7 },
  { at: 28.7, d: 0.6, target: "send", click: 28.8 },
  { at: 33.9, d: 1.0, target: "approve", click: 34.0 },
  { at: 34.1, d: 0.1, target: "proposal" },
] as const;

export const CLICKS = CURSOR.filter(
  (k): k is typeof k & { click: number } => "click" in k && k.click != null,
).map((k) => k.click);

// ── Stage geometry ───────────────────────────────────────────────────────────

export type SceneLayout = "desktop" | "mobile";

/**
 * The sizes the composition is authored at. Nothing inside it is responsive —
 * the camera aims at measured pixel positions — so the stage stays these exact
 * dimensions and is scaled as a unit.
 *
 * These live here rather than beside the scene so the stage can read them
 * without importing the scene, which is what keeps three.js out of the initial
 * bundle.
 */
export const STAGE: Record<SceneLayout, { w: number; h: number }> = {
  desktop: { w: 1920, h: 1080 },
  mobile: { w: 1080, h: 1920 },
};
