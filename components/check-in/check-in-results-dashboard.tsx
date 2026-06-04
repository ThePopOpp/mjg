"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type CheckInRow = {
  id: string;
  participant_id: string;
  total_score: number;
  score_range_category: string;
  lowest_area_key: string;
  lowest_area_label: string;
  section_scores: Record<string, number> | null;
  reflections: Record<string, string> | null;
  created_at: string;
  participants?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    wave: string | null;
    participant_type: string | null;
  } | null;
};

export function CheckInResultsDashboard({ checkIns }: { checkIns: CheckInRow[] }) {
  const [search, setSearch] = useState("");
  const [wave, setWave] = useState("all");
  const [lowestArea, setLowestArea] = useState("all");
  const [scoreRange, setScoreRange] = useState("all");

  const options = useMemo(() => {
    return {
      waves: unique(checkIns.map((row) => row.participants?.wave).filter(Boolean) as string[]),
      lowestAreas: unique(checkIns.map((row) => row.lowest_area_label).filter(Boolean)),
      scoreRanges: unique(checkIns.map((row) => row.score_range_category).filter(Boolean)),
    };
  }, [checkIns]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return checkIns.filter((row) => {
      const participant = row.participants;
      const name = `${participant?.first_name ?? ""} ${participant?.last_name ?? ""}`.trim();
      const haystack = [
        name,
        participant?.email,
        participant?.wave,
        participant?.participant_type,
        row.lowest_area_label,
        row.score_range_category,
        row.total_score,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!needle || haystack.includes(needle)) &&
        (wave === "all" || participant?.wave === wave) &&
        (lowestArea === "all" || row.lowest_area_label === lowestArea) &&
        (scoreRange === "all" || row.score_range_category === scoreRange)
      );
    });
  }, [checkIns, search, wave, lowestArea, scoreRange]);

  const averageScore = filtered.length
    ? Math.round(filtered.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / filtered.length)
    : 0;
  const completedThisWeek = filtered.filter((row) => Date.now() - new Date(row.created_at).getTime() <= 7 * 24 * 60 * 60 * 1000).length;
  const lowestDistribution = getDistribution(filtered.map((row) => row.lowest_area_label));
  const scoreDistribution = getDistribution(filtered.map((row) => row.score_range_category));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Results" value={filtered.length} detail={`${checkIns.length} total Check-Ins`} />
        <SummaryCard title="Average score" value={averageScore || "-"} detail="Out of 125" />
        <SummaryCard title="Completed this week" value={completedThisWeek} detail="Recent pilot momentum" />
        <SummaryCard title="Most common lowest area" value={lowestDistribution[0]?.label ?? "-"} detail={`${lowestDistribution[0]?.count ?? 0} participants`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DistributionCard title="Lowest area distribution" items={lowestDistribution} total={filtered.length} />
        <DistributionCard title="Score range distribution" items={scoreDistribution} total={filtered.length} />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>Check-In results</CardTitle>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm font-medium">
              <span>Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search participant, email, score..."
                />
              </span>
            </label>
            <FilterSelect label="Wave" value={wave} onChange={setWave} options={options.waves} />
            <FilterSelect label="Lowest area" value={lowestArea} onChange={setLowestArea} options={options.lowestAreas} />
            <FilterSelect label="Score range" value={scoreRange} onChange={setScoreRange} options={options.scoreRanges} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Participant</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Section scores</TableHead>
                <TableHead>Lowest area</TableHead>
                <TableHead>Score range</TableHead>
                <TableHead>Reflection</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const participant = row.participants;
                const name = `${participant?.first_name ?? ""} ${participant?.last_name ?? ""}`.trim() || participant?.email || "Unknown";
                const reflection = firstReflection(row.reflections);

                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link className="font-medium text-primary hover:underline" href={`/dashboard/participants/${row.participant_id}`}>
                        {name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{participant?.email}</p>
                    </TableCell>
                    <TableCell>
                      <ScorePill score={row.total_score} />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-52 space-y-2">
                        {Object.entries(row.section_scores ?? {}).map(([key, value]) => (
                          <MiniScore key={key} label={formatValue(key)} value={Number(value)} />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{row.lowest_area_label}</TableCell>
                    <TableCell><Badge variant="secondary">{row.score_range_category}</Badge></TableCell>
                    <TableCell className="max-w-72">
                      <p className="line-clamp-3 text-sm text-muted-foreground">{reflection || "-"}</p>
                    </TableCell>
                    <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                );
              })}
              {!filtered.length ? <TableRow><TableCell colSpan={7}>No Check-In results match these filters.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({ title, value, detail }: { title: string; value: number | string; detail: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}

function DistributionCard({ title, items, total }: { title: string; items: { label: string; count: number }[]; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const percent = total ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
        {!items.length ? <p className="text-sm text-muted-foreground">No data yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function ScorePill({ score }: { score: number }) {
  return (
    <div className="min-w-28">
      <p className="font-semibold">{score} / 125</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, Math.round((score / 125) * 100)))}%` }} />
      </div>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)_2rem] items-center gap-2 text-xs">
      <span className="truncate text-muted-foreground">{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, Math.round((value / 25) * 100)))}%` }} />
      </div>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort();
}

function getDistribution(values: string[]) {
  const counts = values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function firstReflection(reflections: Record<string, string> | null) {
  if (!reflections) return "";
  return Object.values(reflections).find((value) => value?.trim()) ?? "";
}

function formatValue(value: string) {
  return value.replaceAll("_", " ");
}
