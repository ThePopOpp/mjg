"use client";

import { Headphones, BookOpen, Video, Download } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaItem } from "@/lib/facilitator/content";

function duration(sec: number | null) {
  if (!sec) return null;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function Empty({ label }: { label: string }) {
  return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{label}</CardContent></Card>;
}

// Video Library here is for downloadable video FILES only, and the tab only appears when there
// is one. Watch-only videos (the 6-Week Challenge set) live in Resources → Video.
export function DownloadsLibrary({ audio, ebooks, videos: allVideos }: { audio: MediaItem[]; ebooks: MediaItem[]; videos: MediaItem[] }) {
  const videos = allVideos.filter((v) => v.file_url);
  return (
    <Tabs defaultValue="audio">
      <TabsList>
        <TabsTrigger value="audio"><Headphones className="mr-2 h-4 w-4" /> Audio Books</TabsTrigger>
        <TabsTrigger value="ebooks"><BookOpen className="mr-2 h-4 w-4" /> E-Books</TabsTrigger>
        {videos.length ? <TabsTrigger value="videos"><Video className="mr-2 h-4 w-4" /> Video Library</TabsTrigger> : null}
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

      {videos.length ? (
      <TabsContent value="videos" className="mt-4">
        {(
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((v) => {
              const href = v.file_url as string;
              return (
                <Card key={v.id}>
                  <CardContent className="flex h-full flex-col justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{v.title}</p>
                      {v.description ? <p className="mt-1 text-sm text-muted-foreground">{v.description}</p> : null}
                    </div>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                      <Download className="h-4 w-4" /> Download
                    </a>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
      ) : null}
    </Tabs>
  );
}
