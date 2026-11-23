import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ToolDef } from "./types";

// Prospecting tools for lead research: Google Places (find churches and
// ministries by area), Brave web search (people, podcasts, conferences), and a
// careful public-page reader (staff / contact pages). MJG holds the API keys,
// so agents never see them; every call is logged by the connector, and a
// rolling 24-hour cap (PROSPECT_DAILY_CAP, default 300 calls) bounds spend.
//
// Rules that keep this within each platform's terms:
//   • LinkedIn, Facebook, Instagram, X and TikTok pages are never fetched.
//   • robots.txt is honoured; only public http(s) pages on public IPs.
//   • Google Places results are for discovery: their content must not be saved.
//     Confirm details on the organization's own website and record those.

const PROSPECT_TOOL_NAMES = ["prospect_places_search", "prospect_web_search", "prospect_fetch_page"];
const USER_AGENT = "MJGProspector/1.0 (+https://michaeljgauthier.com/about)";
const BLOCKED_HOSTS = ["linkedin.com", "lnkd.in", "facebook.com", "fb.com", "instagram.com", "x.com", "twitter.com", "tiktok.com", "threads.net"];

async function checkProspectCap() {
  const cap = Number(process.env.PROSPECT_DAILY_CAP ?? 300);
  if (!Number.isFinite(cap) || cap <= 0) return;
  const { count, error } = await createSupabaseAdminClient()
    .from("mcp_tool_calls")
    .select("id", { count: "exact", head: true })
    .in("tool", PROSPECT_TOOL_NAMES)
    .gt("created_at", new Date(Date.now() - 24 * 3600_000).toISOString());
  if (error) return; // never block research on a counting failure
  if ((count ?? 0) >= cap) {
    throw new Error(`The daily prospecting limit (${cap} searches and page reads in 24 hours) has been reached. Try again tomorrow, or raise PROSPECT_DAILY_CAP.`);
  }
}

function requireKey(name: string, setupHint: string): string {
  const key = process.env[name]?.trim();
  if (!key) throw new Error(`${name} isn't set on the server yet. ${setupHint}`);
  return key;
}

// ── Google Places (New) Text Search ─────────────────────────────────────────

const placesSearch: ToolDef = {
  name: "prospect_places_search",
  title: "Find organizations by area (Google Places)",
  description:
    "Searches Google Places for organizations in an area, e.g. 'churches in Mesa, AZ', 'non-denominational church near Scottsdale', 'Christian bookstore Phoenix'. Returns name, address, website, phone, Maps link and place id, up to 20 per page (pass next_page_token for more). For DISCOVERY only: Google's terms don't allow saving Places content, so open each website with prospect_fetch_page and import the details published there.",
  domain: "prospect",
  risk: "read",
  minRole: "super_admin",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "What and where, e.g. 'churches in Gilbert, AZ'." },
      page_size: { type: "number", description: "1–20 (default 20)." },
      next_page_token: { type: "string" },
    },
    required: ["query"],
  },
  run: async (a: { query: string; page_size?: number; next_page_token?: string }) => {
    const key = requireKey("GOOGLE_PLACES_API_KEY", "Enable the Places API (New) in Google Cloud and add the key in Coolify.");
    await checkProspectCap();
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.primaryTypeDisplayName,places.businessStatus,nextPageToken",
      },
      body: JSON.stringify({
        textQuery: String(a.query).slice(0, 200),
        pageSize: Math.min(Math.max(Number(a.page_size) || 20, 1), 20),
        ...(a.next_page_token ? { pageToken: a.next_page_token } : {}),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as any;
    if (!res.ok) throw new Error(`Google Places: ${body?.error?.message ?? res.statusText}`);
    return {
      count: body.places?.length ?? 0,
      next_page_token: body.nextPageToken ?? null,
      note: "Discovery only: confirm and import details from each organization's own website.",
      places: (body.places ?? []).map((p: any) => ({
        place_id: p.id,
        name: p.displayName?.text ?? null,
        type: p.primaryTypeDisplayName?.text ?? null,
        address: p.formattedAddress ?? null,
        website: p.websiteUri ?? null,
        phone: p.nationalPhoneNumber ?? null,
        maps_url: p.googleMapsUri ?? null,
        status: p.businessStatus ?? null,
      })),
    };
  },
};

// ── Brave web search ────────────────────────────────────────────────────────

const webSearch: ToolDef = {
  name: "prospect_web_search",
  title: "Search the web for prospects (Brave)",
  description:
    "Web search for lead research: pastors and church staff pages, faith-and-finance podcasts that take guests, Christian conferences and speaker calls, ministries for partnerships. Supports operators like site: and quotes. Returns title, URL and snippet (up to 20). Search results may point at LinkedIn profiles; you may note the public headline shown in the result, but don't fetch those pages or record contact details from them.",
  domain: "prospect",
  risk: "read",
  minRole: "super_admin",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      count: { type: "number", description: "1–20 (default 10)." },
      offset: { type: "number", description: "Page offset, 0–9." },
      country: { type: "string", description: "Two-letter country, default US." },
    },
    required: ["query"],
  },
  run: async (a: { query: string; count?: number; offset?: number; country?: string }) => {
    const key = requireKey("BRAVE_SEARCH_API_KEY", "Create a key at api-dashboard.search.brave.com and add it in Coolify.");
    await checkProspectCap();
    const params = new URLSearchParams({
      q: String(a.query).slice(0, 400),
      count: String(Math.min(Math.max(Number(a.count) || 10, 1), 20)),
      offset: String(Math.min(Math.max(Number(a.offset) || 0, 0), 9)),
      country: /^[A-Za-z]{2}$/.test(a.country ?? "") ? a.country!.toUpperCase() : "US",
      safesearch: "moderate",
    });
    const res = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, {
      headers: { Accept: "application/json", "X-Subscription-Token": key },
      signal: AbortSignal.timeout(15_000),
    });
    const body = (await res.json().catch(() => ({}))) as any;
    if (!res.ok) throw new Error(`Brave Search: ${body?.error?.detail ?? res.statusText}`);
    const results = (body.web?.results ?? []).map((r: any) => ({
      title: r.title ?? null,
      url: r.url ?? null,
      snippet: String(r.description ?? "").replace(/<[^>]+>/g, "").slice(0, 400),
      age: r.age ?? null,
    }));
    return { count: results.length, results };
  },
};

// ── Public page reader ──────────────────────────────────────────────────────

function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const v = ip.toLowerCase();
  if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
  return v === "::1" || v === "::" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80");
}

async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That isn't a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only http(s) pages can be read.");
  if (url.port && !["80", "443"].includes(url.port)) throw new Error("Only standard web ports can be read.");
  if (url.username || url.password) throw new Error("URLs with credentials can't be read.");
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (BLOCKED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) {
    throw new Error(`${host} pages can't be read: that platform's terms don't allow automated access. Note what a search result shows instead.`);
  }
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("Only public websites can be read.");
  const addrs = isIP(url.hostname) ? [{ address: url.hostname }] : await lookup(url.hostname, { all: true }).catch(() => []);
  if (!addrs.length) throw new Error(`Couldn't find ${url.hostname}.`);
  if (addrs.some((a) => isPrivateAddress(a.address))) throw new Error("Only public websites can be read.");
  return url;
}

/** Minimal robots.txt check for our user agent (or *). Missing/unreadable robots means allowed. */
export function robotsAllows(robots: string, path: string, agent = "mjgprospector"): boolean {
  const groups: Array<{ agents: string[]; rules: Array<{ allow: boolean; pattern: string }> }> = [];
  let current: (typeof groups)[number] | null = null;
  let lastWasAgent = false;
  for (const line of robots.split(/\r?\n/)) {
    const [rawKey, ...rest] = line.replace(/#.*/, "").split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (!key) continue;
    if (key === "user-agent") {
      if (!current || !lastWasAgent) groups.push((current = { agents: [], rules: [] }));
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if ((key === "allow" || key === "disallow") && current) {
      if (value || key === "allow") current.rules.push({ allow: key === "allow", pattern: value });
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }
  const mine = groups.filter((g) => g.agents.some((a) => a !== "*" && agent.includes(a)));
  const rules = (mine.length ? mine : groups.filter((g) => g.agents.includes("*"))).flatMap((g) => g.rules);
  let best: { allow: boolean; len: number } | null = null;
  for (const r of rules) {
    if (!r.pattern) continue;
    const re = new RegExp(`^${r.pattern.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}`);
    if (re.test(path) && (!best || r.pattern.length > best.len || (r.pattern.length === best.len && r.allow))) {
      best = { allow: r.allow, len: r.pattern.length };
    }
  }
  return best ? best.allow : true;
}

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

export function extractPage(html: string, base: URL) {
  const title = decodeEntities(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "").slice(0, 200);
  const emails = new Set<string>();
  for (const m of html.matchAll(/mailto:([^"'?\s>]+)/gi)) emails.add(decodeURIComponent(m[1]).toLowerCase());
  const body = html
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const LINK_HINT = /(about|staff|team|leader|pastor|elder|contact|connect|ministr|speak|booking|guest|media|press|events?)/i;
  const links: Array<{ text: string; url: string }> = [];
  for (const m of body.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const href = new URL(decodeEntities(m[1]), base);
      const text = decodeEntities(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().slice(0, 80);
      if ((href.protocol === "https:" || href.protocol === "http:") && href.hostname === base.hostname && (LINK_HINT.test(href.pathname) || LINK_HINT.test(text))) {
        if (!links.some((l) => l.url === href.toString())) links.push({ text, url: href.toString() });
      }
    } catch {
      /* skip bad hrefs */
    }
    if (links.length >= 30) break;
  }
  const text = decodeEntities(
    body
      .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/tr|\/section|\/article)[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
  for (const m of text.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
    if (!/\.(png|jpe?g|gif|webp|svg)$/i.test(m[0])) emails.add(m[0].toLowerCase());
  }
  return { title, text: text.slice(0, 15_000), truncated: text.length > 15_000, emails: [...emails].slice(0, 25), links };
}

const fetchPage: ToolDef = {
  name: "prospect_fetch_page",
  title: "Read a public web page",
  description:
    "Reads a public web page (e.g. a church's staff, leadership or contact page; a podcast's 'be a guest' page) and returns its text, the email addresses published on it, and links to likely staff/about/contact pages on the same site. Honours robots.txt. LinkedIn, Facebook, Instagram, X and TikTok can't be read.",
  domain: "prospect",
  risk: "read",
  minRole: "super_admin",
  inputSchema: {
    type: "object",
    properties: { url: { type: "string", description: "Full http(s) URL." } },
    required: ["url"],
  },
  run: async (a: { url: string }) => {
    await checkProspectCap();
    let url = await assertPublicUrl(String(a.url).trim());

    const robotsRes = await fetch(new URL("/robots.txt", url), { headers: { "User-Agent": USER_AGENT }, redirect: "follow", signal: AbortSignal.timeout(8_000) }).catch(() => null);
    if (robotsRes?.ok) {
      const robots = (await robotsRes.text()).slice(0, 200_000);
      if (!robotsAllows(robots, url.pathname + url.search)) {
        return { url: url.toString(), blocked_by_robots: true, note: "This site's robots.txt asks automated readers not to open this page." };
      }
    }

    let res: Response | null = null;
    for (let hop = 0; hop < 4; hop++) {
      res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" },
        redirect: "manual",
        signal: AbortSignal.timeout(12_000),
      });
      const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
      if (!location) break;
      url = await assertPublicUrl(new URL(location, url).toString());
    }
    if (!res || !res.ok) throw new Error(`The page answered ${res?.status ?? "nothing"}.`);
    const type = res.headers.get("content-type") ?? "";
    if (!/html|text\/plain/i.test(type)) throw new Error(`That isn't a web page (${type || "unknown type"}).`);
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const decoder = new TextDecoder();
      while (html.length < 1_500_000) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
      await reader.cancel().catch(() => {});
    }
    return { url: url.toString(), ...extractPage(html, url) };
  },
};

export const PROSPECT_TOOLS: ToolDef[] = [placesSearch, webSearch, fetchPage];
