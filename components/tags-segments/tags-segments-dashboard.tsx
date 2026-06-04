"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Tags } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

type TagRow = {
  id: string;
  name: string;
  category: string | null;
  participant_tags?: { participant_id: string }[];
};

type ParticipantRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  wave: string | null;
  source: string | null;
  participant_type: string | null;
  check_in_status: string | null;
  survey_status: string | null;
  inner_circle_status: string | null;
  participant_tags?: { tags?: { id: string; name: string; category: string | null } | null }[];
};

export function TagsSegmentsDashboard({ tags, participants }: { tags: TagRow[]; participants: ParticipantRow[] }) {
  const [search, setSearch] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [matchMode, setMatchMode] = useState<"all" | "any">("all");

  const filteredTags = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tags.filter((tag) => !needle || `${tag.name} ${tag.category ?? ""}`.toLowerCase().includes(needle));
  }, [tags, search]);

  const groupedTags = useMemo(() => {
    return filteredTags.reduce<Record<string, TagRow[]>>((groups, tag) => {
      const category = tag.category || "general";
      groups[category] = groups[category] || [];
      groups[category].push(tag);
      return groups;
    }, {});
  }, [filteredTags]);

  const matchingParticipants = useMemo(() => {
    if (!selectedTagIds.length) return participants;

    return participants.filter((participant) => {
      const participantTagIds = new Set(participant.participant_tags?.map((tagRow) => tagRow.tags?.id).filter(Boolean));
      return matchMode === "all"
        ? selectedTagIds.every((tagId) => participantTagIds.has(tagId))
        : selectedTagIds.some((tagId) => participantTagIds.has(tagId));
    });
  }, [participants, selectedTagIds, matchMode]);

  const unusedCount = tags.filter((tag) => !tag.participant_tags?.length).length;
  const activeCount = tags.length - unusedCount;
  const topTags = [...tags]
    .sort((a, b) => (b.participant_tags?.length ?? 0) - (a.participant_tags?.length ?? 0))
    .slice(0, 5);

  function toggleTag(tagId: string) {
    setSelectedTagIds((current) => (current.includes(tagId) ? current.filter((id) => id !== tagId) : [...current, tagId]));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total tags" value={tags.length} detail="Available segment labels" />
        <SummaryCard title="Active tags" value={activeCount} detail="Assigned to participants" />
        <SummaryCard title="Unused tags" value={unusedCount} detail="Available but not assigned" />
        <SummaryCard title="Segment preview" value={matchingParticipants.length} detail="Matching participants" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <Card>
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>Tag counts</CardTitle>
              <p className="text-sm text-muted-foreground">Grouped by category. Select tags to build a segment preview.</p>
            </div>
            <label className="space-y-2 text-sm font-medium">
              <span>Search tags</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tag name or category..." />
              </span>
            </label>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(groupedTags).map(([category, categoryTags]) => (
              <div key={category} className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{formatValue(category)}</p>
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {categoryTags.map((tag) => {
                    const selected = selectedTagIds.includes(tag.id);
                    const count = tag.participant_tags?.length ?? 0;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleTag(tag.id)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors",
                          selected ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        <span className="text-sm font-medium">{tag.name}</span>
                        <Badge variant={selected ? "secondary" : count ? "default" : "outline"}>{count}</Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!filteredTags.length ? <p className="text-sm text-muted-foreground">No tags match your search.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top segments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topTags.map((tag) => (
              <div key={tag.id} className="rounded-md border bg-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{tag.name}</p>
                    <p className="text-sm text-muted-foreground">{formatValue(tag.category ?? "general")}</p>
                  </div>
                  <span className="text-xl font-semibold">{tag.participant_tags?.length ?? 0}</span>
                </div>
              </div>
            ))}
            {!topTags.length ? <p className="text-sm text-muted-foreground">No tag segments yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Segment builder</CardTitle>
              <p className="text-sm text-muted-foreground">Preview participants by selected tags before sending emails or doing follow-up.</p>
            </div>
            <div className="w-full lg:w-56">
              <label className="space-y-2 text-sm font-medium">
                <span>Match mode</span>
                <Select value={matchMode} onValueChange={(value) => setMatchMode(value as "all" | "any")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Has all selected tags</SelectItem>
                    <SelectItem value="any">Has any selected tag</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTagIds.map((tagId) => {
              const tag = tags.find((item) => item.id === tagId);
              return tag ? (
                <Button key={tag.id} type="button" variant="secondary" size="sm" onClick={() => toggleTag(tag.id)}>
                  <Tags className="h-3.5 w-3.5" />
                  {tag.name}
                </Button>
              ) : null;
            })}
            {selectedTagIds.length ? (
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTagIds([])}>
                Clear selected tags
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Select one or more tags above to narrow the segment.</p>
            )}
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
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchingParticipants.map((participant) => {
                const name = `${participant.first_name ?? ""} ${participant.last_name ?? ""}`.trim() || participant.email || "Unknown";
                const participantTags = participant.participant_tags?.map((tagRow) => tagRow.tags).filter(Boolean) ?? [];
                return (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <Link className="font-medium text-primary hover:underline" href={`/dashboard/participants/${participant.id}`}>
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell>{participant.email ?? "-"}</TableCell>
                    <TableCell>{participant.wave ?? participant.source ?? "-"}</TableCell>
                    <TableCell>{formatValue(participant.participant_type ?? "-")}</TableCell>
                    <TableCell>{formatValue(participant.check_in_status ?? participant.survey_status ?? "-")}</TableCell>
                    <TableCell>
                      <div className="flex max-w-96 flex-wrap gap-1">
                        {participantTags.slice(0, 4).map((tag) => (
                          <Badge key={tag!.id} variant="secondary">{tag!.name}</Badge>
                        ))}
                        {participantTags.length > 4 ? <Badge variant="outline">+{participantTags.length - 4}</Badge> : null}
                        {!participantTags.length ? <span className="text-sm text-muted-foreground">-</span> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!matchingParticipants.length ? <TableRow><TableCell colSpan={6}>No participants match this segment.</TableCell></TableRow> : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suggested saved segments</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {["Wave 0 Follow-Up Ready", "Church Interest", "Lowest: Finances", "Inner Circle Candidates"].map((name) => (
            <div key={name} className="rounded-md border bg-background p-4">
              <p className="font-medium">{name}</p>
              <p className="mt-2 text-sm text-muted-foreground">Ready to formalize once saved segments are stored in Supabase.</p>
            </div>
          ))}
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

function formatValue(value: string) {
  return value.replaceAll("_", " ");
}
