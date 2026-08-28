"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, LayoutList, Table as TableIcon, CalendarDays, Play, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChallengeVideoPlayer } from "@/components/six-week-challenge/video-player";
import type { ChallengeVideo } from "@/lib/six-week-challenge/videos";
import { cn } from "@/lib/utils";

type View = "cards" | "list" | "table" | "calendar";

const LIBRARY_PATH = "/6-week-challenge/videos";
const hasVideo = (v: ChallengeVideo) => Boolean(v.youtubeId || v.driveId || v.videoUrl);
const pagePath = (v: ChallengeVideo) => `${LIBRARY_PATH}/${v.slug}`;

// A calendar/agenda "when" label derived from each video's place in the course.
function whenLabel(v: ChallengeVideo): string {
  if (v.badge === "Invitation") return "Before we begin";
  if (v.badge === "Homework") return "Pre-work";
  if (v.badge === "Closing") return "After Week 6";
  return v.badge; // "Week 1" … "Week 6"
}

const VIEWS: { key: View; label: string; icon: typeof LayoutGrid }[] = [
  { key: "cards", label: "Cards", icon: LayoutGrid },
  { key: "list", label: "List", icon: LayoutList },
  { key: "table", label: "Table", icon: TableIcon },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
];

export function ChallengeVideoLibrary({ videos }: { videos: ChallengeVideo[] }) {
  const [view, setView] = useState<View>("cards");
  const [active, setActive] = useState<ChallengeVideo | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>6-Week Challenge videos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Play any video here, or open its public page. These power the{" "}
                <Link href={LIBRARY_PATH} target="_blank" className="font-medium text-primary hover:underline">
                  frontend video library <ExternalLink className="inline h-3 w-3" />
                </Link>.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
              {VIEWS.map((v) => {
                const Icon = v.icon;
                return (
                  <Button
                    key={v.key}
                    size="sm"
                    variant={view === v.key ? "default" : "ghost"}
                    onClick={() => setView(v.key)}
                    title={`${v.label} view`}
                    className="h-8 px-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="ml-1.5 hidden sm:inline">{v.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "cards" ? (
            <CardsView videos={videos} />
          ) : view === "list" ? (
            <ListView videos={videos} onPlay={setActive} />
          ) : view === "table" ? (
            <TableView videos={videos} onPlay={setActive} />
          ) : (
            <CalendarView videos={videos} onPlay={setActive} />
          )}
        </CardContent>
      </Card>

      {/* In-dashboard player for List / Table / Calendar "Play" */}
      <Dialog open={Boolean(active)} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="sm:max-w-3xl">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle>{active.badge} · {active.title}</DialogTitle>
              </DialogHeader>
              <ChallengeVideoPlayer {...active} embedDirect title={active.title} badge={active.badge} />
              <div className="flex justify-end">
                <Link href={pagePath(active)} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                  Open public page <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatusPill({ v }: { v: ChallengeVideo }) {
  return hasVideo(v) ? (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Ready</span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Coming soon</span>
  );
}

function PageLink({ v, className }: { v: ChallengeVideo; className?: string }) {
  return (
    <Link href={pagePath(v)} target="_blank" className={cn("inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline", className)}>
      Open page <ExternalLink className="h-3.5 w-3.5" />
    </Link>
  );
}

// ─── Cards: inline branded player (facade → plays in place) ─────────────────────
function CardsView({ videos }: { videos: ChallengeVideo[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {videos.map((v) => (
        <div key={v.slug} className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-card p-2">
          {/* embedDirect disabled so the grid shows branded posters and only loads a player on click */}
          <ChallengeVideoPlayer {...v} embedDirect={false} title={v.title} badge={v.badge} />
          <div className="flex items-start justify-between gap-2 px-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">{v.badge}</p>
              <p className="truncate font-semibold">{v.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{v.subtitle}</p>
            </div>
            <StatusPill v={v} />
          </div>
          <div className="flex items-center justify-between px-1 pb-1">
            <PageLink v={v} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── List ───────────────────────────────────────────────────────────────────────
function ListView({ videos, onPlay }: { videos: ChallengeVideo[]; onPlay: (v: ChallengeVideo) => void }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border">
      {videos.map((v) => (
        <div key={v.slug} className="flex items-center gap-3 p-3">
          <button
            type="button"
            onClick={() => onPlay(v)}
            disabled={!hasVideo(v)}
            title={hasVideo(v) ? `Play ${v.title}` : "Coming soon"}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              hasVideo(v) ? "bg-primary text-primary-foreground hover:opacity-90" : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{v.badge}</p>
            <p className="truncate font-medium">{v.title}</p>
            <p className="truncate text-xs text-muted-foreground">{v.subtitle}</p>
          </div>
          <StatusPill v={v} />
          <PageLink v={v} className="hidden sm:inline-flex" />
        </div>
      ))}
    </div>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────────
function TableView({ videos, onPlay }: { videos: ChallengeVideo[]; onPlay: (v: ChallengeVideo) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/30 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-2">Slot</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Frontend page</th>
            <th className="px-4 py-2 text-right">Play</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {videos.map((v) => (
            <tr key={v.slug}>
              <td className="whitespace-nowrap px-4 py-2 font-medium">{v.badge}</td>
              <td className="px-4 py-2">
                <span className="font-medium">{v.title}</span>
                <span className="block text-xs text-muted-foreground">{v.subtitle}</span>
              </td>
              <td className="px-4 py-2"><StatusPill v={v} /></td>
              <td className="whitespace-nowrap px-4 py-2"><PageLink v={v} /></td>
              <td className="whitespace-nowrap px-4 py-2 text-right">
                <Button size="sm" variant="outline" disabled={!hasVideo(v)} onClick={() => onPlay(v)} className="gap-1.5">
                  <Play className="h-3.5 w-3.5" /> Play
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Calendar (course agenda: each video by its place in the 6 weeks) ────────────
function CalendarView({ videos, onPlay }: { videos: ChallengeVideo[]; onPlay: (v: ChallengeVideo) => void }) {
  return (
    <div className="space-y-2">
      {videos.map((v) => (
        <div key={v.slug} className="flex items-center gap-4 rounded-xl border border-border bg-card p-3">
          <div className="flex w-28 shrink-0 flex-col items-center justify-center rounded-lg bg-muted px-2 py-3 text-center">
            <CalendarDays className="mb-1 h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-foreground">{whenLabel(v)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{v.title}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">{v.subtitle}</p>
          </div>
          <StatusPill v={v} />
          <div className="hidden items-center gap-2 sm:flex">
            <Button size="sm" variant="outline" disabled={!hasVideo(v)} onClick={() => onPlay(v)} className="gap-1.5">
              <Play className="h-3.5 w-3.5" /> Play
            </Button>
            <PageLink v={v} />
          </div>
        </div>
      ))}
    </div>
  );
}
