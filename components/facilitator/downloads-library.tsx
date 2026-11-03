"use client";

import { Headphones, BookOpen, Video, Download, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaItem } from "@/lib/facilitator/content";

/** A 6-Week Challenge video, trimmed to what a library card needs (from challenge_videos). */
export type LibraryVideo = {
  slug: string;
  badge: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string | null;
  thumbnailDark: string | null;
  durationLabel: string | null;
  available: boolean;
};

function duration(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Empty({ label }: { label: string }) {
  return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{label}</CardContent></Card>;
}

export function DownloadsLibrary({ audio, ebooks, videos, challengeVideos = [] }: { audio: MediaItem[]; ebooks: MediaItem[]; videos: MediaItem[]; challengeVideos?: LibraryVideo[] }) {
  return (
    <Tabs defaultValue="audio">
      <TabsList>
        <TabsTrigger value="audio"><Headphones className="mr-2 h-4 w-4" /> Audio Books</TabsTrigger>
        <TabsTrigger value="ebooks"><BookOpen className="mr-2 h-4 w-4" /> E-Books</TabsTrigger>
        <TabsTrigger value="videos"><Video className="mr-2 h-4 w-4" /> Video Library</TabsTrigger>
      </TabsList>

      <TabsContent value="audio" className="mt-4">
        {!audio.length ? <Empty label="No audiobooks published yet." /> : (
          <div className="space-y-3">
            {audio.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      {a.description ? <p className="text-sm text-muted-foreground">{a.description}</p> : null}
                    </div>
                    {duration(a.duration_seconds) ? <span className="shrink-0 text-xs text-muted-foreground">{duration(a.duration_seconds)}</span> : null}
                  </div>
                  {a.file_url ? <audio controls preload="none" src={a.file_url} className="w-full" /> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="ebooks" className="mt-4">
        {!ebooks.length ? <Empty label="No e-books published yet." /> : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ebooks.map((b) => (
              <Card key={b.id}>
                <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                  <div>
                    <p className="font-medium">{b.title}</p>
                    {b.description ? <p className="mt-1 text-sm text-muted-foreground">{b.description}</p> : null}
                  </div>
                  {b.file_url ? (
                    <a href={b.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Download className="h-4 w-4" /> Download
                    </a>
                  ) : <span className="text-xs text-muted-foreground">No file</span>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="videos" className="mt-4">
        {!videos.length && !challengeVideos.length ? <Empty label="No videos published yet." /> : null}
        {challengeVideos.length ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">The 6-Week Challenge</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {challengeVideos.map((v) => (
                <a
                  key={v.slug}
                  href={`/6-week-challenge/videos/${v.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border bg-card shadow-sm transition hover:border-[#b88a4a]/60 hover:shadow"
                >
                  <div className="relative aspect-video bg-muted">
                    {v.thumbnailUrl ? (
                      <>
                        <img src={v.thumbnailUrl} alt="" className={v.thumbnailDark ? "h-full w-full object-cover dark:hidden" : "h-full w-full object-cover"} loading="lazy" />
                        {v.thumbnailDark ? <img src={v.thumbnailDark} alt="" className="hidden h-full w-full object-cover dark:block" loading="lazy" /> : null}
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center"><Video className="h-8 w-8 text-muted-foreground" /></div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-0.5 text-xs font-semibold text-white">{v.badge}</span>
                    {v.durationLabel ? <span className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">{v.durationLabel}</span> : null}
                  </div>
                  <div className="space-y-1 p-4">
                    <p className="font-medium">{v.title}</p>
                    {v.subtitle ? <p className="text-sm text-muted-foreground">{v.subtitle}</p> : null}
                    <p className="inline-flex items-center gap-2 pt-1 text-sm font-medium text-primary group-hover:underline">
                      <Play className="h-4 w-4" /> {v.available ? "Watch" : "Coming soon"}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ) : null}
        {videos.length ? (
          <div className={challengeVideos.length ? "mt-6 space-y-3" : "space-y-3"}>
          {challengeVideos.length ? <h3 className="text-sm font-semibold text-muted-foreground">More videos</h3> : null}
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((v) => {
              const href = v.embed_url || v.file_url || `/media/${v.slug}`;
              return (
                <Card key={v.id}>
                  <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{v.title}</p>
                      {v.description ? <p className="mt-1 text-sm text-muted-foreground">{v.description}</p> : null}
                    </div>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Play className="h-4 w-4" /> Watch
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          </div>
        ) : null}
      </TabsContent>
    </Tabs>
  );
}
