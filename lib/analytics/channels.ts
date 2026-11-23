// Classifies a visit into a marketing channel from its entry referrer, UTMs and
// landing path. Pure (no Node APIs) so the collect route, register route and
// tests can all share it.

export const CHANNELS = [
  "ai", "search", "social", "email", "paid", "business_card", "partner", "referral", "direct",
] as const;
export type Channel = (typeof CHANNELS)[number];

export const CHANNEL_LABELS: Record<string, string> = {
  ai: "AI assistants",
  search: "Search",
  social: "Social",
  email: "Email",
  paid: "Paid",
  business_card: "Business cards",
  partner: "Partners",
  referral: "Referral sites",
  direct: "Direct / unknown",
  unknown: "Before tracking",
};

// Host suffix → source name. Checked against the referrer host and against utm_source.
const AI: Record<string, string> = {
  "chatgpt.com": "chatgpt", "chat.openai.com": "chatgpt", "openai.com": "chatgpt",
  "perplexity.ai": "perplexity", "claude.ai": "claude", "gemini.google.com": "gemini",
  "bard.google.com": "gemini", "copilot.microsoft.com": "copilot", "you.com": "you",
  "phind.com": "phind", "meta.ai": "meta_ai", "grok.com": "grok", "deepseek.com": "deepseek",
  "poe.com": "poe", "mistral.ai": "mistral",
};
const SEARCH: Record<string, string> = {
  "google.": "google", "bing.com": "bing", "duckduckgo.com": "duckduckgo", "yahoo.com": "yahoo",
  "ecosia.org": "ecosia", "search.brave.com": "brave", "yandex.": "yandex", "baidu.com": "baidu",
  "startpage.com": "startpage", "qwant.com": "qwant",
};
const SOCIAL: Record<string, string> = {
  "facebook.com": "facebook", "fb.com": "facebook", "fb.me": "facebook", "m.facebook.com": "facebook",
  "instagram.com": "instagram", "linkedin.com": "linkedin", "lnkd.in": "linkedin",
  "t.co": "x", "x.com": "x", "twitter.com": "x", "youtube.com": "youtube", "youtu.be": "youtube",
  "tiktok.com": "tiktok", "pinterest.com": "pinterest", "threads.net": "threads", "reddit.com": "reddit",
  "nextdoor.com": "nextdoor", "vimeo.com": "vimeo",
};
const WEBMAIL: Record<string, string> = {
  "mail.google.com": "gmail", "outlook.live.com": "outlook", "outlook.office.com": "outlook",
  "mail.yahoo.com": "yahoo_mail", "mail.aol.com": "aol",
};
const PARTNER: Record<string, string> = { "forgedlife": "forgedlife" };

function match(host: string, table: Record<string, string>): string | null {
  for (const [needle, name] of Object.entries(table)) {
    if (needle.endsWith(".")) {
      // "google." matches google.com, google.co.uk, www.google.ca …
      if (host === needle.slice(0, -1) || host.includes(`.${needle}`) || host.startsWith(needle)) return name;
    } else if (!needle.includes(".")) {
      if (host.includes(needle)) return name;
    } else if (host === needle || host.endsWith(`.${needle}`)) {
      return name;
    }
  }
  return null;
}

export function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "") || null;
  } catch {
    return null;
  }
}

export type ClassifyInput = {
  referrerHost: string | null;
  siteHosts: string[];
  landingPath: string;
  utmSource?: string | null;
  utmMedium?: string | null;
};

export function classifyChannel(input: ClassifyInput): { channel: Channel; source: string | null } {
  const utmSource = input.utmSource?.trim().toLowerCase() || null;
  const utmMedium = input.utmMedium?.trim().toLowerCase() || null;
  const ref = input.referrerHost && !input.siteHosts.includes(input.referrerHost) ? input.referrerHost : null;

  if (utmMedium && /^(cpc|ppc|paid|paidsearch|paid_social|display|ads?)$/.test(utmMedium)) {
    return { channel: "paid", source: utmSource ?? ref };
  }
  if (utmMedium && /e-?mail|newsletter/.test(utmMedium)) return { channel: "email", source: utmSource ?? "email" };
  if (utmSource) {
    const ai = match(utmSource, AI);
    if (ai) return { channel: "ai", source: ai };
    if (/e-?mail|newsletter/.test(utmSource)) return { channel: "email", source: utmSource };
  }
  if (input.landingPath.startsWith("/c/") || utmMedium === "business_card" || utmSource === "business_card") {
    return { channel: "business_card", source: utmSource ?? "card" };
  }
  if (ref) {
    const ai = match(ref, AI);
    if (ai) return { channel: "ai", source: ai };
    // Webmail before search: mail.google.com must not count as Google search.
    const mail = match(ref, WEBMAIL);
    if (mail) return { channel: "email", source: mail };
    const search = match(ref, SEARCH);
    if (search) return { channel: "search", source: search };
    const social = match(ref, SOCIAL);
    if (social) return { channel: "social", source: social };
    const partner = match(ref, PARTNER);
    if (partner) return { channel: "partner", source: partner };
  }
  if (utmMedium && /social/.test(utmMedium)) return { channel: "social", source: utmSource ?? ref };
  if (utmSource) {
    const social = match(utmSource, SOCIAL);
    if (social) return { channel: "social", source: social };
    const search = match(utmSource, SEARCH);
    if (search) return { channel: "search", source: search };
    const partner = match(utmSource, PARTNER);
    if (partner) return { channel: "partner", source: partner };
    return { channel: "referral", source: utmSource };
  }
  if (ref) return { channel: "referral", source: ref };
  return { channel: "direct", source: null };
}
