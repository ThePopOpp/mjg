"use client";

import { FileText, Headphones } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaItem, NewsPost } from "@/lib/facilitator/content";

function fmt(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
}

function Empty({ label }: { label: string }) {
  return <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">{label}</CardContent></Card>;
}

export function NewsFeed({ posts, audio }: { posts: NewsPost[]; audio: MediaItem[] }) {
  return (
    <Tabs defaultValue="blog">
      <TabsList>
        <TabsTrigger value="blog"><FileText className="mr-2 h-4 w-4" /> Blog Posts</TabsTrigger>
        <TabsTrigger value="audio"><Headphones className="mr-2 h-4 w-4" /> Audio</TabsTrigger>
      </TabsList>

      <TabsContent value="blog" className="mt-4">
        {!posts.length ? <Empty label="No posts published yet." /> : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((p) => (
              <a key={p.id} href={`/resources/${p.slug}`} target="_blank" rel="noopener noreferrer">
                <Card className="h-full overflow-hidden transition-colors hover:border-primary/50">
                  {p.featured_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.featured_image_url} alt="" className="h-40 w-full object-cover" />
                  ) : null}
                  <CardContent className="space-y-1.5 p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{p.category ?? "Resource"}</span>
                      <span aria-hidden>·</span>
                      <span>{fmt(p.publish_at ?? p.created_at)}</span>
                    </div>
                    <p className="font-semibold leading-tight">{p.title}</p>
                    {p.excerpt ? <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p> : null}
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="audio" className="mt-4">
        {!audio.length ? <Empty label="No audio published yet." /> : (
          <div className="space-y-3">
            {audio.map((a) => (
              <Card key={a.id}>
                <CardContent className="space-y-2 p-4">
                  <p className="font-medium">{a.title}</p>
                  {a.description ? <p className="text-sm text-muted-foreground">{a.description}</p> : null}
                  {a.file_url ? <audio controls preload="none" src={a.file_url} className="w-full" /> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
