// MJG Brand Kit / Design System — the single source of truth for logos, colors,
// fonts, voice, and reusable on-brand snippets. Consumed by the dashboard Assets
// page and by the AI agent (Siggey) so generated content stays on-brand.

export const BRAND_KIT = {
  name: "Michael J. Gauthier",
  shortName: "MJG",
  tagline: "Created for More",
  wordmark: "Michael J. Gauthier",

  logos: [
    {
      key: "logo_black",
      label: "Primary logo (black)",
      url: "https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_Black-1.svg",
      usage: "Light backgrounds (default).",
    },
    {
      key: "logo_white",
      label: "Primary logo (white)",
      url: "https://michaeljgauthier.com/wp-content/uploads/2025/03/MJG_Logo_White-1.svg",
      usage: "Dark backgrounds.",
    },
  ],

  // Hex values reflect the dashboard theme tokens (app/globals.css) and the
  // established email palette.
  colors: {
    gold: { hex: "#c9aa70", label: "MJG gold (accent)" },
    green: { hex: "#315f43", label: "Stewardship green (primary)" },
    deepGreen: { hex: "#1f3d2b", label: "Deep green" },
    cream: { hex: "#faf8f4", label: "Cream background" },
    ink: { hex: "#111111", label: "Body text" },
    muted: { hex: "#5f6d66", label: "Muted text" },
  },

  fonts: {
    serif: "Fraunces, Georgia, serif",
    sans: "Geist, Arial, sans-serif",
    // Web fonts are unreliable in email — use these system-safe stacks there.
    emailSerif: "Georgia, 'Times New Roman', serif",
    emailSans: "Arial, Helvetica, sans-serif",
  },

  voice: [
    "Warm",
    "Professional",
    "Faith-centered",
    "Clear and respectful",
    "Stewardship-focused — never salesy",
  ],

  links: {
    site: "https://michaeljgauthier.com",
    optOut: "https://my.michaeljgauthier.com/sms/opt-out",
  },
} as const;

// A ready-to-use, on-brand email button (inline styles for email-client safety).
export function brandEmailButton(href: string, label: string): string {
  const { green } = BRAND_KIT.colors;
  return `<a href="${href}" style="display:inline-block;background:${green.hex};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-family:${BRAND_KIT.fonts.emailSans};font-weight:700;">${label}</a>`;
}

// An on-brand email header block (logo + wordmark eyebrow).
export function brandEmailHeader(): string {
  const logo = BRAND_KIT.logos[0].url;
  return `<div style="text-align:left;padding-bottom:16px;">
  <img src="${logo}" alt="${BRAND_KIT.name}" style="height:40px;width:auto;" />
  <p style="text-transform:uppercase;letter-spacing:.14em;color:${BRAND_KIT.colors.gold.hex};font-size:12px;font-weight:700;margin:12px 0 0;font-family:${BRAND_KIT.fonts.emailSans};">${BRAND_KIT.tagline}</p>
</div>`;
}
