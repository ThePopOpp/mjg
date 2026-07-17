// Install guidance — one source of truth for "how do I install this?", shared by
// the React button (components/pwa/install-app-button.tsx) and the hand-built
// static pages (lib/public-site/static-pages.ts serialises these into its script).
//
// Why this exists: iOS Safari has never supported `beforeinstallprompt`, and never
// will — Apple offers no programmatic install. On iOS the ONLY route is
// Share → Add to Home Screen, so the quality of these instructions IS the install
// experience. Everything below is about making that route findable.

export type InstallPlatform =
  | "in-app"       // Facebook/Instagram/LinkedIn webview — cannot install at all
  | "iphone"
  | "ipad"
  | "macos-safari"
  | "android"
  | "desktop";

export type InstallGuide = {
  title: string;
  steps: string[];
  note?: string;
  // Set when the current browser cannot install at all and the user must switch.
  blocked?: string;
};

type NavLike = { userAgent: string; maxTouchPoints?: number };

export function detectInstallPlatform(nav: NavLike): InstallPlatform {
  const ua = nav.userAgent || "";

  // In-app browsers first: a link opened from Facebook/Instagram/LinkedIn runs in a
  // webview with NO Add to Home Screen at all. This is the most common reason
  // "install doesn't work" — the user isn't doing anything wrong, the option
  // genuinely isn't there.
  if (/FBAN|FBAV|FB_IAB|Instagram|LinkedInApp|Twitter|MicroMessenger|Snapchat|Pinterest|\bLine\//i.test(ua)) {
    return "in-app";
  }

  if (/iPhone|iPod/.test(ua)) return "iphone";
  // iPadOS 13+ reports itself as "Macintosh" — checking /iPad/ alone misses every
  // modern iPad and hands it desktop instructions that don't exist in iPad Safari.
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && (nav.maxTouchPoints ?? 0) > 1)) return "ipad";
  if (/Android/.test(ua)) return "android";

  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Brave/.test(ua);
  if (/Macintosh|Mac OS X/.test(ua) && isSafari) return "macos-safari";

  return "desktop";
}

export const INSTALL_GUIDES: Record<InstallPlatform, InstallGuide> = {
  "in-app": {
    title: "Open in your browser first",
    blocked: "This in-app browser can’t install apps — the option isn’t available here.",
    steps: [
      "Tap the ••• (or ⋯) menu, usually in the top-right corner.",
      "Choose “Open in Safari” — or “Open in browser” on Android.",
      "Once it opens in Safari or Chrome, tap Install app again.",
    ],
    note: "Links opened from Facebook, Instagram or LinkedIn run in a mini-browser that Apple and Google don’t allow apps to be installed from.",
  },
  iphone: {
    title: "Add to your iPhone Home Screen",
    steps: [
      "Tap the Share button at the bottom of Safari — the square with an arrow pointing up.",
      "Scroll down the list and tap “Add to Home Screen”.",
      "Tap “Add” in the top-right. The MJG icon appears on your Home Screen.",
    ],
    note: "iPhone has no one-tap install — Apple only allows this through the Share menu. It works in Chrome and Edge on iPhone too, using the same Share button.",
  },
  ipad: {
    title: "Add to your iPad Home Screen",
    steps: [
      "Tap the Share button in Safari’s toolbar at the top — the square with an arrow pointing up.",
      "Scroll down the list and tap “Add to Home Screen”.",
      "Tap “Add”. The MJG icon appears on your Home Screen.",
    ],
    note: "On iPad the Share button is at the top of the window, not the bottom.",
  },
  "macos-safari": {
    title: "Add to your Mac Dock",
    steps: [
      "In the menu bar, open the File menu.",
      "Choose “Add to Dock…”.",
      "Confirm the name — MJG opens in its own window from your Dock.",
    ],
    note: "Requires Safari 17 or later (macOS Sonoma). On an older Safari, use Chrome or Edge instead, which offer a one-click install.",
  },
  android: {
    title: "Install on Android",
    steps: [
      "Tap the ⋮ menu in Chrome, top-right.",
      "Tap “Install app” (it may say “Add to Home screen”).",
      "Confirm — the MJG icon appears with your other apps.",
    ],
  },
  desktop: {
    title: "Install on your computer",
    steps: [
      "Look for the install icon in the address bar, on the right — a screen with a downward arrow.",
      "Or open the ⋮ menu → “Install Michael J. Gauthier…”.",
      "Confirm — the app opens in its own window.",
    ],
    note: "Works in Chrome, Edge and Brave. Firefox doesn’t support installing web apps on the desktop.",
  },
};

// The iOS Share glyph, drawn from scratch: a square with an arrow leaving the top.
// Users scan for this shape rather than reading the word "Share", so showing it is
// the difference between finding the button and giving up.
export const SHARE_ICON_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M7 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1"/></svg>';

// Which platforms have no programmatic install and therefore always need the guide.
export function needsManualInstall(platform: InstallPlatform) {
  return platform === "iphone" || platform === "ipad" || platform === "macos-safari" || platform === "in-app";
}
