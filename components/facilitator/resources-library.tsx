"use client";

import { useState } from "react";
import { FileText, Headphones, Video, FileType2, LayoutGrid, LayoutList, Download, Play } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MediaItem, NewsPost } from "@/lib/facilitator/content";

type Layout = "grid" | "list";

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }) : "";
}
function duration(sec: number | null) {
  if (!sec) return null;
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}
function Empty({ label }: { label: string }) {
  return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{label}</CardContent></Card>;
}

function ViewToggle({ layout, onChange }: { layout: Layout; onChange: (l: Layout) => void }) {
  return (
    <div className="inline-flex rounded-md border bg-card p-0.5">
      {([["grid", LayoutGrid], ["list", LayoutList]] as const).map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn("rounded px-2.5 py-1.5 transition-colors", layout === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          aria-label={`${key} view`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function ResourcesLibrary({ posts, audio, video, documents }: { posts: NewsPost[]; audio: MediaItem[]; video: MediaItem[]; documents: MediaItem[] }) {
  const [layout, setLayout] = useState<Layout>("grid");

  return (
    <Tabs defaultValue="blog">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="blog"><FileText className="mr-2 h-4 w-4" /> Blog Posts</TabsTrigger>
          <TabsTrigger value="audio"><Headphones className="mr-2 h-4 w-4" /> Audio</TabsTrigger>
          <TabsTrigger value="video"><Video className="mr-2 h-4 w-4" /> Video</TabsTrigger>
          <TabsTrigger value="documents"><FileType2 className="mr-2 h-4 w-4" /> Documents</TabsTrigger>
        </TabsList>
        <ViewToggle layout={layout} onChange={setLayout} />
      </div>

      <TabsContent value="blog" className="mt-4">
        {!posts.length ? <Empty label="No posts published yet." /> : <BlogView posts={posts} layout={layout} />}
      </TabsContent>
      <TabsContent value="audio" className="mt-4">
        {!audio.length ? <Empty label="No audio published yet." /> : <AudioView items={audio} layout={layout} />}
      </TabsContent>
      <TabsContent value="video" className="mt-4">
        {!video.length ? <Empty label="No videos published yet." /> : <MediaLinkView items={video} layout={layout} kind="video" />}
      </TabsContent>
      <TabsContent value="documents" className="mt-4">
        {!documents.length ? <Empty label="No documents published yet." /> : <MediaLinkView items={documents} layout={layout} kind="document" />}
      </TabsContent>
    </Tabs>
  );
}

function BlogView({ posts, layout }: { posts: NewsPost[]; layout: Layout }) {
  if (layout === "list") {
    return (
      <div className="space-y-2">
        {posts.map((p) => (
          <a key={p.id} href={`/resources/${p.slug}`} target="_blank" rel="noopener noreferrer">
            <Card className="transition-colors hover:border-primary/50"><CardContent className="flex items-center justify-between gap-3 p-3">
              <div><p className="font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.category ?? "Resource"} · {fmtDate(p.publish_at ?? p.created_at)}</p></div>
            </CardContent></Card>
          </a>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((p) => (
        <a key={p.id} href={`/resources/${p.slug}`} target="_blank" rel="noopener noreferrer">
          <Card className="h-full overflow-hidden transition-colors hover:border-primary/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.featured_image_url ? <img src={p.featured_image_url} alt="" className="h-40 w-full object-cover" /> : null}
            <CardContent className="space-y-1.5 p-4">
              <p className="text-xs text-muted-foreground">{p.category ?? "Resource"} · {fmtDate(p.publish_at ?? p.created_at)}</p>
              <p className="font-semibold leading-tight">{p.title}</p>
              {p.excerpt ? <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p> : null}
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}

function AudioView({ items, layout }: { items: MediaItem[]; layout: Layout }) {
  return (
    <div className={cn(layout === "grid" ? "grid gap-3 md:grid-cols-2" : "space-y-3")}>
      {items.map((a) => (
        <Card key={a.id}><CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div><p className="font-medium">{a.title}</p>{a.description ? <p className="text-sm text-muted-foreground">{a.description}</p> : null}</div>
            {duration(a.duration_seconds) ? <span className="shrink-0 text-xs text-muted-foreground">{duration(a.duration_seconds)}</span> : null}
          </div>
          {a.file_url ? <audio controls preload="none" src={a.file_url} className="w-full" /> : null}
        </CardContent></Card>
      ))}
    </div>
  );
}

function MediaLinkView({ items, layout, kind }: { items: MediaItem[]; layout: Layout; kind: "video" | "document" }) {
  return (
    <div className={cn(layout === "grid" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3" : "space-y-2")}>
      {items.map((m) => {
        const href = kind === "video" ? (m.embed_url || m.file_url || `/media/${m.slug}`) : m.file_url || `/media/${m.slug}`;
        const Icon = kind === "video" ? Play : Download;
        const cta = kind === "video" ? "Watch" : "Download";
        return (
          <Card key={m.id}><CardContent className={cn("gap-3 p-4", layout === "grid" ? "flex h-full flex-col justify-between" : "flex items-center justify-between")}>
            <div><p className="font-medium">{m.title}</p>{m.description ? <p className="mt-1 text-sm text-muted-foreground">{m.description}</p> : null}</div>
            {href ? <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary hover:underline"><Icon className="h-4 w-4" /> {cta}</a> : <span className="text-xs text-muted-foreground">No file</span>}
          </CardContent></Card>
        );
      })}
    </div>
  );
}
