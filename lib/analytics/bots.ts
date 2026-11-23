// Crawler detection for middleware.ts. Crawlers never run the JS tracker, so
// this is the only way to see which AI systems are reading the site. Order
// matters: the first match wins. Pure (Edge-safe).

export type BotKind = "ai_search" | "ai_training" | "ai_user" | "search" | "other";

const BOTS: Array<[RegExp, string, BotKind]> = [
  // AI assistants fetching a page live for a user's question.
  [/ChatGPT-User/i, "ChatGPT-User", "ai_user"],
  [/Perplexity-User/i, "Perplexity-User", "ai_user"],
  [/Claude-User/i, "Claude-User", "ai_user"],
  [/MistralAI-User/i, "MistralAI-User", "ai_user"],
  // AI search indexes (what makes MJG citable in answers).
  [/OAI-SearchBot/i, "OAI-SearchBot", "ai_search"],
  [/PerplexityBot/i, "PerplexityBot", "ai_search"],
  [/Claude-SearchBot/i, "Claude-SearchBot", "ai_search"],
  [/YouBot/i, "YouBot", "ai_search"],
  [/DuckAssistBot/i, "DuckAssistBot", "ai_search"],
  // Model-training crawlers.
  [/GPTBot/i, "GPTBot", "ai_training"],
  [/ClaudeBot|anthropic-ai/i, "ClaudeBot", "ai_training"],
  [/Google-Extended/i, "Google-Extended", "ai_training"],
  [/Applebot-Extended/i, "Applebot-Extended", "ai_training"],
  [/CCBot/i, "CCBot", "ai_training"],
  [/Bytespider/i, "Bytespider", "ai_training"],
  [/meta-externalagent/i, "Meta-ExternalAgent", "ai_training"],
  [/Amazonbot/i, "Amazonbot", "ai_training"],
  [/cohere-ai/i, "Cohere", "ai_training"],
  // Classic search engines.
  [/Googlebot/i, "Googlebot", "search"],
  [/bingbot/i, "Bingbot", "search"],
  [/Applebot/i, "Applebot", "search"],
  [/DuckDuckBot/i, "DuckDuckBot", "search"],
  [/YandexBot/i, "YandexBot", "search"],
  [/Baiduspider/i, "Baiduspider", "search"],
];

export function detectBot(userAgent: string | null | undefined): { bot: string; kind: BotKind } | null {
  if (!userAgent) return null;
  for (const [re, bot, kind] of BOTS) if (re.test(userAgent)) return { bot, kind };
  return null;
}

/** Any automated client (used to drop bot traffic from human pageviews). */
export function looksAutomated(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return detectBot(userAgent) !== null || /bot|crawl|spider|slurp|headless|lighthouse|preview|fetch|curl|wget|python|axios|node-fetch/i.test(userAgent);
}
