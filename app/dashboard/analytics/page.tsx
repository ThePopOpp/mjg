import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, BookMarked, CheckCircle2, CreditCard, Eye, MapPinned, Sparkles, UserPlus, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarList, TrendChart } from "@/components/analytics/charts";
import { CHANNEL_LABELS } from "@/lib/analytics/channels";
import { RANGES, getBots, getOverview, getTraffic, windowFor, type Kpi, type RangeKey } from "@/lib/analytics/queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics — MJG" };

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "traffic", label: "Traffic" },
  { key: "crawlers", label: "AI & crawlers" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const BOT_KIND_LABELS: Record<string, string> = {
  ai_user: "AI answering a user",
  ai_search: "AI search index",
  ai_training: "AI training",
  search: "Search engine",
  other: "Other",
};

const channelLabel = (c: string) => CHANNEL_LABELS[c] ?? c;
const pct = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");

function Delta({ current, previous }: Kpi) {
  if (previous === 0 && current === 0) return <span className="text-xs text-muted-foreground">No change</span>;
  if (previous === 0) return <span className="text-xs text-muted-foreground">New this period</span>;
  const change = Math.round(((current - previous) / previous) * 100);
  const Icon = change >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {change >= 0 ? "+" : ""}
      {change}% vs previous
    </span>
  );
}

function Stat({ label, kpi, icon: Icon, detail }: { label: string; kpi: Kpi; icon: LucideIcon; detail?: string }) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{kpi.current.toLocaleString()}</p>
          <p className="mt-1">
            <Delta {...kpi} />
          </p>
          {detail ? <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p> : null}
        </div>
        <div className="rounded-md bg-secondary p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Panel({ title, description, children, className }: { title: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams?: Promise<{ tab?: string; range?: string }> }) {
  const params = (await searchParams) ?? {};
  const tab: TabKey = TABS.some((t) => t.key === params.tab) ? (params.tab as TabKey) : "overview";
  const range: RangeKey = params.range && params.range in RANGES ? (params.range as RangeKey) : "30d";
  const href = (next: { tab?: string; range?: string }) => `/dashboard/analytics?tab=${next.tab ?? tab}&range=${next.range ?? range}`;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Analytics"
        description="How people find michaeljgauthier.com, and which visits turn into sign-ups, Check-Ins, group requests and purchases. Visits are counted without cookies; staff browsers aren't counted."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap gap-1 rounded-lg border bg-card p-1" aria-label="Analytics sections">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={href({ tab: t.key })}
              className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition-colors", tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              aria-current={tab === t.key ? "page" : undefined}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <nav className="flex gap-1 rounded-lg border bg-card p-1" aria-label="Date range">
          {(Object.keys(RANGES) as RangeKey[]).map((r) => (
            <Link
              key={r}
              href={href({ range: r })}
              className={cn("rounded-md px-2.5 py-1.5 text-sm font-medium tabular-nums transition-colors", range === r ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground")}
              aria-current={range === r ? "true" : undefined}
            >
              {r === "365d" ? "12m" : r}
            </Link>
          ))}
        </nav>
      </div>

      {tab === "overview" && <OverviewTab range={range} />}
      {tab === "traffic" && <TrafficTab range={range} />}
      {tab === "crawlers" && <CrawlersTab range={range} />}

      <p className="text-xs text-muted-foreground">
        Pilot and cohort numbers (waves, Check-In scores, surveys) stay on{" "}
        <Link href="/dashboard/reports" className="font-medium text-primary hover:underline">Reports</Link>. Google Search Console, Bing and AI-answer
        visibility arrive in the next phases.
      </p>
    </div>
  );
}

async function OverviewTab({ range }: { range: RangeKey }) {
  const w = windowFor(range);
  const d = await getOverview(w);
  const visitors: Kpi = { current: d.traffic.visitors, previous: d.prevTraffic.visitors };
  const sessions: Kpi = { current: d.traffic.sessions, previous: d.prevTraffic.sessions };
  const totalChannelSessions = d.channels.reduce((s, c) => s + c.sessions, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Visitors" kpi={visitors} icon={UsersRound} detail={`${d.traffic.pageviews.toLocaleString()} page views · counted per day`} />
        <Stat label="Visits" kpi={sessions} icon={Eye} detail={`${pct(d.traffic.bouncedSessions, d.traffic.sessions)} saw just one page`} />
        <Stat label="New accounts" kpi={d.signups} icon={UserPlus} detail={`${d.attributedSignups} with a known source · ${pct(d.signups.current, d.traffic.sessions)} of visits`} />
        <Stat label="Check-Ins completed" kpi={d.checkins} icon={CheckCircle2} />
        <Stat label="Group requests" kpi={d.groupRequests} icon={MapPinned} />
        <Stat label="Paid orders" kpi={d.purchases} icon={CreditCard} />
        <Stat label="Book waitlist" kpi={d.waitlist} icon={BookMarked} />
        <Stat label="Visits from AI assistants" kpi={d.aiVisits} icon={Sparkles} detail="ChatGPT, Perplexity, Claude, Gemini, Copilot…" />
      </div>

      <Panel title="Visitors per day" description={`Last ${w.days} days, America/Phoenix time.`}>
        <TrendChart points={d.series.map((s) => ({ day: s.day, value: s.visitors }))} days={w.days} label="Visitors" />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Where visits come from" description="Each visit is classified by how it started: referrer, UTM tags or landing page.">
          <BarList
            valueLabel="visits"
            items={d.channels.map((c) => ({ key: c.key, label: channelLabel(c.key), value: c.sessions, detail: pct(c.sessions, totalChannelSessions) }))}
            empty="No visits recorded yet. Data starts the day this ships."
          />
        </Panel>
        <Panel title="Landing pages that start sign-ups" description="The first page a new account ever visited.">
          <BarList valueLabel="sign-ups" items={d.landing.map((l) => ({ key: l.path, value: l.signups }))} empty="No attributed sign-ups yet." />
        </Panel>
      </div>

      <Panel
        title="What each channel leads to"
        description="People who created an account in this period, grouped by the channel of their first visit, and what they've done since."
      >
        {d.funnel.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First channel</TableHead>
                  <TableHead className="text-right">Accounts</TableHead>
                  <TableHead className="text-right">Check-In</TableHead>
                  <TableHead className="text-right">Group request</TableHead>
                  <TableHead className="text-right">Paid order</TableHead>
                  <TableHead className="text-right">Book waitlist</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {d.funnel.map((r) => (
                  <TableRow key={r.channel}>
                    <TableCell className="font-medium">{channelLabel(r.channel)}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.signups}</TableCell>
                    {[r.checkins, r.groupRequests, r.purchases, r.waitlist].map((v, i) => (
                      <TableCell key={i} className="text-right tabular-nums">
                        {v} <span className="text-xs text-muted-foreground">({pct(v, r.signups)})</span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No attributed accounts yet. Every account created from /register from now on records its source.
          </p>
        )}
      </Panel>
    </div>
  );
}

async function TrafficTab({ range }: { range: RangeKey }) {
  const w = windowFor(range);
  const t = await getTraffic(w);
  const toBars = (rows: { key: string; sessions: number; pageviews: number }[], by: "sessions" | "pageviews" = "sessions") =>
    rows.map((r) => ({ key: r.key, value: r[by] }));

  return (
    <div className="space-y-6">
      <Panel title="Page views per day" description={`Last ${w.days} days.`}>
        <TrendChart points={t.series.map((s) => ({ day: s.day, value: s.pageviews }))} days={w.days} label="Page views" />
      </Panel>
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Top pages" description="By page views.">
          <BarList valueLabel="page views" items={toBars(t.pages, "pageviews")} />
        </Panel>
        <Panel title="Landing pages" description="Where visits start.">
          <BarList valueLabel="visits" items={toBars(t.entries)} />
        </Panel>
        <Panel title="Sources" description="Google, ChatGPT, Facebook, a UTM source…">
          <BarList valueLabel="visits" items={toBars(t.sources).map((b) => ({ ...b, label: b.key === "(none)" ? "Direct / unknown" : b.key }))} />
        </Panel>
        <Panel title="Referring sites">
          <BarList valueLabel="visits" items={toBars(t.referrers)} empty="No outside referrers yet." />
        </Panel>
        <Panel title="Campaigns" description="From utm_campaign tags on your links.">
          <BarList valueLabel="visits" items={toBars(t.campaigns)} empty="No tagged campaigns yet. Add ?utm_campaign=… to links in emails and posts." />
        </Panel>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Panel title="Devices">
            <BarList valueLabel="visits" items={toBars(t.devices)} />
          </Panel>
          <Panel title="Countries">
            <BarList valueLabel="visits" items={toBars(t.countries)} empty="Country isn't available from the current host." />
          </Panel>
        </div>
      </div>
    </div>
  );
}

async function CrawlersTab({ range }: { range: RangeKey }) {
  const w = windowFor(range);
  const [b, traffic] = await Promise.all([getBots(w), getTraffic(w)]);
  const aiSources = traffic.sources.filter((s) => ["chatgpt", "perplexity", "claude", "gemini", "copilot", "you", "phind", "meta_ai", "grok", "deepseek", "poe", "mistral"].includes(s.key));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Visits from AI assistants" description="People who clicked through from an AI answer.">
          <BarList valueLabel="visits" items={aiSources.map((s) => ({ key: s.key, value: s.sessions }))} empty="No AI-referred visits yet." />
        </Panel>
        <Panel title="Most-crawled pages" description="All crawlers, AI and search.">
          <BarList valueLabel="hits" items={b.pages.map((p) => ({ key: p.path, value: p.hits, detail: `${p.bots} bot${p.bots === 1 ? "" : "s"}` }))} empty="No crawler visits logged yet." />
        </Panel>
      </div>
      <Panel title="Crawlers" description="Which bots read the site. AI search and AI-user bots are what make MJG show up and get cited in AI answers.">
        {b.bots.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bot</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead className="text-right">Hits</TableHead>
                  <TableHead className="text-right">Pages</TableHead>
                  <TableHead className="text-right">Last seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {b.bots.map((r) => (
                  <TableRow key={r.bot}>
                    <TableCell className="font-medium">{r.bot}</TableCell>
                    <TableCell className="text-muted-foreground">{BOT_KIND_LABELS[r.botKind] ?? r.botKind}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.hits.toLocaleString()}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.pages}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(r.lastSeen).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Phoenix" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">No crawler visits logged yet.</p>
        )}
      </Panel>
    </div>
  );
}
