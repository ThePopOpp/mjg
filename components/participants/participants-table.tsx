"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ParticipantRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  wave: string | null;
  source: string | null;
  participant_type: string | null;
  check_in_status: string | null;
  survey_status: string | null;
  inner_circle_status: string | null;
  journey_status: string | null;
  check_in_total_score: number | null;
  lowest_scoring_area: string | null;
  participant_tags?: { tags?: { id: string; name: string; category: string | null } | null }[];
};

export function ParticipantsTable({ participants }: { participants: ParticipantRow[] }) {
  const [search, setSearch] = useState("");
  const [wave, setWave] = useState("all");
  const [type, setType] = useState("all");
  const [checkIn, setCheckIn] = useState("all");
  const [survey, setSurvey] = useState("all");
  const [lowestArea, setLowestArea] = useState("all");
  const [tag, setTag] = useState("all");

  const options = useMemo(() => {
    const waves = new Set<string>();
    const types = new Set<string>();
    const checkIns = new Set<string>();
    const surveys = new Set<string>();
    const lowestAreas = new Set<string>();
    const tags = new Set<string>();

    participants.forEach((row) => {
      if (row.wave) waves.add(row.wave);
      if (row.source) waves.add(row.source);
      if (row.participant_type) types.add(row.participant_type);
      if (row.check_in_status) checkIns.add(row.check_in_status);
      if (row.survey_status) surveys.add(row.survey_status);
      if (row.lowest_scoring_area) lowestAreas.add(row.lowest_scoring_area);
      row.participant_tags?.forEach((tagRow) => {
        if (tagRow.tags?.name) tags.add(tagRow.tags.name);
      });
    });

    return {
      waves: Array.from(waves).sort(),
      types: Array.from(types).sort(),
      checkIns: Array.from(checkIns).sort(),
      surveys: Array.from(surveys).sort(),
      lowestAreas: Array.from(lowestAreas).sort(),
      tags: Array.from(tags).sort(),
    };
  }, [participants]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return participants.filter((row) => {
      const tagNames = row.participant_tags?.map((tagRow) => tagRow.tags?.name ?? "").filter(Boolean) ?? [];
      const haystack = [
        row.first_name,
        row.last_name,
        row.email,
        row.phone,
        row.wave,
        row.source,
        row.participant_type,
        row.check_in_status,
        row.survey_status,
        row.inner_circle_status,
        row.journey_status,
        row.lowest_scoring_area,
        ...tagNames,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!needle || haystack.includes(needle)) &&
        (wave === "all" || row.wave === wave || row.source === wave) &&
        (type === "all" || row.participant_type === type) &&
        (checkIn === "all" || row.check_in_status === checkIn) &&
        (survey === "all" || row.survey_status === survey) &&
        (lowestArea === "all" || row.lowest_scoring_area === lowestArea) &&
        (tag === "all" || tagNames.includes(tag))
      );
    });
  }, [participants, search, wave, type, checkIn, survey, lowestArea, tag]);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Participant CRM</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length} of {participants.length} records.
            </p>
          </div>
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
                placeholder="Search name, email, phone, wave, tag, status..."
              />
            </span>
          </label>
          <FilterSelect label="Wave/source" value={wave} onChange={setWave} options={options.waves} />
          <FilterSelect label="Tag" value={tag} onChange={setTag} options={options.tags} />
          <FilterSelect label="Participant type" value={type} onChange={setType} options={options.types} />
          <FilterSelect label="Check-In" value={checkIn} onChange={setCheckIn} options={options.checkIns} />
          <FilterSelect label="Survey" value={survey} onChange={setSurvey} options={options.surveys} />
          <FilterSelect label="Lowest area" value={lowestArea} onChange={setLowestArea} options={options.lowestAreas} />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Wave/source</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Check-In</TableHead>
              <TableHead>Survey</TableHead>
              <TableHead>Inner Circle</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => {
              const name = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || row.email || "Unknown";
              const tags = row.participant_tags?.map((tagRow) => tagRow.tags).filter(Boolean) ?? [];

              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell>{row.email ?? "-"}</TableCell>
                  <TableCell>{row.wave ?? row.source ?? "-"}</TableCell>
                  <TableCell>{formatValue(row.participant_type)}</TableCell>
                  <TableCell><StatusBadge status={row.check_in_status ?? "not_started"} /></TableCell>
                  <TableCell><StatusBadge status={row.survey_status ?? "not_sent"} /></TableCell>
                  <TableCell><StatusBadge status={row.inner_circle_status ?? "not_invited"} /></TableCell>
                  <TableCell>
                    <div className="flex max-w-80 flex-wrap gap-1">
                      {tags.slice(0, 3).map((tagRow) => (
                        <Badge key={tagRow!.id} variant="secondary">{tagRow!.name}</Badge>
                      ))}
                      {tags.length > 3 ? <Badge variant="outline">+{tags.length - 3}</Badge> : null}
                      {!tags.length ? <span className="text-sm text-muted-foreground">-</span> : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link className="text-sm font-medium text-primary hover:underline" href={`/dashboard/participants/${row.id}`}>
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {!filtered.length ? (
              <TableRow><TableCell colSpan={9}>No participants match these filters.</TableCell></TableRow>
            ) : null}
          </TableBody>
        </Table>
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
            <SelectItem key={option} value={option}>
              {formatValue(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function formatValue(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "-";
}
