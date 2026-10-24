import { Fraunces, Geist } from "next/font/google";

// The marketing site's type, loaded once. The classes define the CSS variables
// that `font-display` and `font-marketing` read, so they must sit on an
// ancestor of anything using them — the marketing layout, and every dialog,
// since dialogs render in a portal outside that layout.

export const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

export const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const MARKETING_FONT_VARS = `${fraunces.variable} ${geist.variable}`;
