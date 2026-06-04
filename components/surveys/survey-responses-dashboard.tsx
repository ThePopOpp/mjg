"use client";

import Link from "next/link";
import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { GENERAL_SURVEY_FIELDS, PASTOR_ELDER_SURVEY_FIELDS } from "@/lib/pilot/constants";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type SurveyRow = {
  id: string;
  participant_id: string | null;
  survey_type: "general" | "pastor_elder";
  answers: Record<string, unknown> | null;
  anonymous_feedback_permission: boolean;
  story_interview_permission: boolean;
  follow_up_permission: boolean;
  created_at: string;
  participants?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    wave: string | null;
    source: string | null;
    participant_type: string | null;
  } | null;
};

const fieldLabels = [...GENERAL_SURVEY_FIELDS, ...PASTOR_ELDER_SURVEY_FIELDS].reduce<Record<string, string>>((acc, field) => {
  acc[field.name] = field.label;
  return acc;
}, {});

export function SurveyResponsesDashboard({ surveys }: { surveys: SurveyRow[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [wave, setWave] = useState("all");
  const [followUp, setFollowUp] = useState("all");
  const [story, setStory] = useState("all");
  const [innerCircle, setInnerCircle] = useState("all");
  const [churchInterest, setChurchInterest] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const options = useMemo(() => {
    const waves = new Set<string>();
    surveys.forEach((row) => {
      if (row.participants?.wave) waves.add(row.participants.wave);
      if (row.participants?.source) waves.add(row.participants.source);
    });
    return { waves: Array.from(waves).sort() };
  }, [surveys]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return surveys.filter((row) => {
      const participant = row.participants;
      const answers = row.answers ?? {};
      const name = `${participant?.first_name ?? ""} ${participant?.last_name ?? ""}`.trim();
      const haystack = [
        row.survey_type,
        name,
        participant?.email,
        participant?.wave,
        participant?.source,
        participant?.participant_type,
        ...Object.values(answers).flatMap((value) => (Array.isArray(value) ? value : [value])),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!needle || haystack.includes(needle)) &&
        (type === "all" || row.survey_type === type) &&
        (wave === "all" || participant?.wave === wave || participant?.source === wave) &&
        (followUp === "all" || boolFilter(row.follow_up_permission, followUp)) &&
        (story === "all" || boolFilter(row.story_interview_permission, story)) &&
        (innerCircle === "all" || answerIntent(answers.innerCircle) === innerCircle) &&
        (churchInterest === "all" || answerIntent(answers.churchUse) === churchInterest)
      );
    });
  }, [surveys, search, type, wave, followUp, story, innerCircle, churchInterest]);

  const generalCount = filtered.filter((row) => row.survey_type === "general").length;
  const pastorElderCount = filtered.filter((row) => row.survey_type === "pastor_elder").length;
  const followUpCount = filtered.filter((row) => row.follow_up_permission).length;
  const storyCount = filtered.filter((row) => row.story_interview_permission).length;
  const innerCircleInterestCount = filtered.filter((row) => answerIntent(row.answers?.innerCircle) === "yes").length;
  const churchInterestCount = filtered.filter((row) => answerIntent(row.answers?.churchUse) === "yes").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Survey responses" value={filtered.length} detail={`${generalCount} general, ${pastorElderCount} pastor/elder`} />
        <SummaryCard title="Follow-up ready" value={followUpCount} detail="Gave follow-up permission" />
        <SummaryCard title="Story/interview" value={storyCount} detail="Permission or possible permission" />
        <SummaryCard title="Interest signals" value={innerCircleInterestCount + churchInterestCount} detail={`${innerCircleInterestCount} Inner Circle, ${churchInterestCount} church`} />
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Survey responses</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {surveys.length}. Expand a row to review full answers.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="space-y-2 text-sm font-medium md:col-span-2">
              <span>Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search participant, email, answer text, interest..."
                />
              </span>
            </label>
            <FilterSelect label="Survey type" value={type} onChange={setType} options={[["general", "General"], ["pastor_elder", "Pastor/Elder"]]} />
            <FilterSelect label="Wave/source" value={wave} onChange={setWave} options={options.waves.map((item) => [item, formatValue(item)])} />
            <FilterSelect label="Follow-up" value={followUp} onChange={setFollowUp} options={[["yes", "Yes"], ["no", "No"]]} />
            <FilterSelect label="Story/interview" value={story} onChange={setStory} options={[["yes", "Yes"], ["no", "No"]]} />
            <FilterSelect label="Inner Circle interest" value={innerCircle} onChange={setInnerCircle} options={[["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]]} />
            <FilterSelect label="Church interest" value={churchInterest} onChange={setChurchInterest} options={[["yes", "Yes"], ["maybe", "Maybe"], ["no", "No"]]} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Type</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead>Wave/source</TableHead>
                <TableHead>Key signals</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => {
                const expanded = expandedId === row.id;
                const participant = row.participants;
                const answers = row.answers ?? {};
                const name = `${participant?.first_name ?? ""} ${participant?.last_name ?? ""}`.trim() || participant?.email || "Unknown";

                return (
                  <Fragment key={row.id}>
                    <TableRow className="cursor-pointer" onClick={() => setExpandedId(expanded ? null : row.id)}>
                      <TableCell>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                      </TableCell>
                      <TableCell><Badge variant="secondary">{row.survey_type === "pastor_elder" ? "Pastor/Elder" : "General"}</Badge></TableCell>
                      <TableCell>
                        {row.participant_id ? (
                          <Link className="font-medium text-primary hover:underline" href={`/dashboard/participants/${row.participant_id}`}>
                            {name}
                          </Link>
                        ) : (
                          <span className="font-medium">{name}</span>
                        )}
                        <p className="text-xs text-muted-foreground">{participant?.email ?? String(answers.email ?? "")}</p>
                      </TableCell>
                      <TableCell>{participant?.wave ?? participant?.source ?? "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <SignalBadge label="Inner Circle" value={answerIntent(answers.innerCircle)} />
                          <SignalBadge label="Church" value={answerIntent(answers.churchUse)} />
                          <SignalBadge label="Recommend" value={answerIntent(answers.recommend)} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <StatusBadge status={row.anonymous_feedback_permission ? "anonymous_yes" : "anonymous_no"} />
                          <StatusBadge status={row.follow_up_permission ? "follow_up_yes" : "follow_up_no"} />
                          <StatusBadge status={row.story_interview_permission ? "story_yes" : "story_no"} />
                        </div>
                      </TableCell>
                      <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                    {expanded ? (
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/30">
                          <SurveyAnswerGrid answers={answers} />
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
              {!filtered.length ? <TableRow><TableCell colSpan={7}>No survey responses match these filters.</TableCell></TableRow> : null}
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {options.map(([optionValue, label]) => (
            <SelectItem key={optionValue} value={optionValue}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function SignalBadge({ label, value }: { label: string; value: "yes" | "maybe" | "no" | "unknown" }) {
  if (value === "unknown") return null;
  return <Badge variant={value === "yes" ? "default" : value === "maybe" ? "secondary" : "outline"}>{label}: {value}</Badge>;
}

function SurveyAnswerGrid({ answers }: { answers: Record<string, unknown> }) {
  const entries = Object.entries(answers).filter(([, value]) => value !== "" && value !== null && value !== undefined);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-md border bg-background p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{fieldLabels[key] ?? formatValue(key)}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{formatAnswer(value)}</p>
        </div>
      ))}
      {!entries.length ? <p className="text-sm text-muted-foreground">No answers stored.</p> : null}
    </div>
  );
}

function answerIntent(value: unknown): "yes" | "maybe" | "no" | "unknown" {
  const normalized = String(Array.isArray(value) ? value.join(" ") : value ?? "").toLowerCase();
  if (normalized.includes("yes") || normalized.includes("possibly")) return "yes";
  if (normalized.includes("maybe") || normalized.includes("unsure")) return "maybe";
  if (normalized.includes("no") || normalized.includes("not yet")) return "no";
  return "unknown";
}

function boolFilter(value: boolean, filter: string) {
  return filter === "yes" ? value : !value;
}

function formatAnswer(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value) return JSON.stringify(value, null, 2);
  return String(value ?? "-");
}

function formatValue(value: string) {
  return value.replaceAll("_", " ");
}
