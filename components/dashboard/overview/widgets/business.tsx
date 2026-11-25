"use client";

import { BarChart3, DollarSign, Globe, LineChart, Receipt, Share2, Target, UserPlus } from "lucide-react";
import { BarList, TrendChart } from "@/components/analytics/charts";
import { useWidgetData } from "../use-widget-data";
import { Empty, ListRow, Load, Pill, Sparkline, WidgetCard, fmtMoney, relTime } from "./kit";

type Series = { day: string; value: number }[];

type Revenue = {
  series: Series;
  total30: number;
  total90: number;
  forecast30: number;
  currency: string;
  recent: { id: string; offer_key: string; amount_minor: number; currency: string; status: string; paid_at: string | null; created_at: string }[];
};

export function RevenueWidget() {
  const state = useWidgetData<Revenue>("revenue", undefined, 300_000);
  return (
    <WidgetCard icon={DollarSign} title="Revenue & Forecast" href="/dashboard/stripe">
      <Load state={state}>
        {(d) => (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Last 30 days", fmtMoney(d.total30, d.currency)],
                ["Last 90 days", fmtMoney(d.total90, d.currency)],
                ["Next 30 (est.)", fmtMoney(d.forecast30, d.currency)],
              ].map(([label, value], i) => (
                <div key={label} className={i === 2 ? "rounded-xl border border-dashed border-[#b88a4a]/60 p-2.5" : "rounded-xl bg-muted/50 p-2.5"}>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="text-lg font-semibold tabular-nums">{value}</p>
                </div>
              ))}
            </div>
            <TrendChart points={d.series} days={90} label="Revenue" />
            <p className="text-[11px] text-muted-foreground">The estimate projects the last 90 days&apos; trend forward. It is a guide, not a forecast of record.</p>
          </div>
        )}
      </Load>
    </WidgetCard>
  );
}

export function OrdersWidget() {
  const state = useWidgetData<Revenue>("revenue", undefined, 300_000);
  return (
    <WidgetCard icon={Receipt} title="Recent Orders" href="/dashboard/stripe">
      <Load state={state}>
        {(d) =>
          d.recent.length ? (
            <ul className="space-y-0.5">
              {d.recent.map((o) => (
                <ListRow
                  key={o.id}
                  title={o.offer_key.replace(/[_-]/g, " ")}
                  subtitle={relTime(o.paid_at ?? o.created_at)}
                  meta={
                    <span className="flex items-center gap-2">
                      <span className="font-medium tabular-nums text-foreground">{fmtMoney((o.amount_minor ?? 0) / 100, o.currency)}</span>
                      <Pill tone={o.status === "paid" ? "gold" : o.status.includes("refund") ? "warn" : "neutral"}>{o.status.replace(/_/g, " ")}</Pill>
                    </span>
                  }
                />
              ))}
            </ul>
          ) : (
            <Empty>No orders in the last 90 days.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

const STAGES = ["new", "researched", "contacted", "replied", "qualified", "converted", "disqualified"];
type Leads = { stages: Record<string, number>; recent: { id: string; first_name: string | null; last_name: string | null; company: string | null; church: string | null; lead_stage: string | null; lead_segment: string | null; created_at: string }[] };

export function LeadsPipelineWidget() {
  const state = useWidgetData<Leads>("leads", undefined, 300_000);
  return (
    <WidgetCard icon={Target} title="Leads Pipeline" href="/dashboard/contacts/leads">
      <Load state={state}>
        {(d) => {
          const total = STAGES.reduce((s, k) => s + (d.stages[k] ?? 0), 0);
          return total ? (
            <div className="space-y-3">
              {/* Funnel strip: one segment per stage, widths by share. */}
              <div className="flex h-3 overflow-hidden rounded-full bg-muted" aria-hidden>
                {STAGES.filter((k) => k !== "disqualified").map((k, i) => (
                  <span key={k} style={{ width: `${((d.stages[k] ?? 0) / total) * 100}%`, opacity: 1 - i * 0.12 }} className="h-full bg-[#b88a4a]" />
                ))}
              </div>
              <BarList items={STAGES.map((k) => ({ key: k, label: k[0].toUpperCase() + k.slice(1), value: d.stages[k] ?? 0 }))} valueLabel="leads" />
            </div>
          ) : (
            <Empty>No leads yet.</Empty>
          );
        }}
      </Load>
    </WidgetCard>
  );
}

export function RecentLeadsWidget() {
  const state = useWidgetData<Leads>("leads", undefined, 300_000);
  return (
    <WidgetCard icon={UserPlus} title="Newest Leads" href="/dashboard/contacts/leads">
      <Load state={state}>
        {(d) =>
          d.recent.length ? (
            <ul className="space-y-0.5">
              {d.recent.map((l) => (
                <ListRow
                  key={l.id}
                  href="/dashboard/contacts/leads"
                  title={[l.first_name, l.last_name].filter(Boolean).join(" ") || l.church || l.company || "Lead"}
                  subtitle={[l.church || l.company, l.lead_segment].filter(Boolean).join(" · ")}
                  meta={<Pill tone="gold">{l.lead_stage ?? "new"}</Pill>}
                />
              ))}
            </ul>
          ) : (
            <Empty>No leads yet.</Empty>
          )
        }
      </Load>
    </WidgetCard>
  );
}

type Traffic = { series: Series; pages: { key: string; value: number }[]; sources: { key: string; value: number }[] };

export function TrafficWidget() {
  const state = useWidgetData<Traffic>("traffic", undefined, 600_000);
  return (
    <WidgetCard icon={LineChart} title="Website Traffic · 30 days" href="/dashboard/analytics">
      <Load state={state}>
        {(d) => (
          <div>
            <p className="mb-1 text-2xl font-semibold tabular-nums">
              {d.series.reduce((s, p) => s + p.value, 0).toLocaleString()} <span className="text-sm font-normal text-muted-foreground">visitor-days</span>
            </p>
            <TrendChart points={d.series} days={30} label="Visitors" />
          </div>
        )}
      </Load>
    </WidgetCard>
  );
}

export function TopPagesWidget() {
  const state = useWidgetData<Traffic>("traffic", undefined, 600_000);
  return (
    <WidgetCard icon={Globe} title="Top Pages" href="/dashboard/analytics">
      <Load state={state}>{(d) => <BarList items={d.pages} valueLabel="views" empty="No visits recorded yet." />}</Load>
    </WidgetCard>
  );
}

export function SourcesWidget() {
  const state = useWidgetData<Traffic>("traffic", undefined, 600_000);
  return (
    <WidgetCard icon={Share2} title="Traffic Sources" href="/dashboard/analytics">
      <Load state={state}>{(d) => <BarList items={d.sources} valueLabel="sessions" empty="No visits recorded yet." />}</Load>
    </WidgetCard>
  );
}

export function SignupsWidget() {
  const state = useWidgetData<{ series: Series; total: number; forecast14: number }>("signups", undefined, 600_000);
  return (
    <WidgetCard icon={BarChart3} title="Sign-ups · 60 days" href="/dashboard/user-management">
      <Load state={state}>
        {(d) => (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <p className="text-2xl font-semibold tabular-nums">{d.total}</p>
              <p className="text-right text-xs text-muted-foreground">
                Next 14 days (est.) <span className="block text-base font-semibold tabular-nums text-foreground">{Math.round(d.forecast14)}</span>
              </p>
            </div>
            <Sparkline values={d.series.map((p) => p.value)} className="h-16" label="Sign-ups per day" />
          </div>
        )}
      </Load>
    </WidgetCard>
  );
}
