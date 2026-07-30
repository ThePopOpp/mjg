"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, LayoutList, Table as TableIcon, CalendarDays, ChevronLeft, ChevronRight, Tags, ImageOff } from "lucide-react";
import { BlogPostActions, BlogPostImageActions } from "@/components/blog-posts/blog-post-actions";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  featured_image_url: string | null;
  author_name: string | null;
  category_name: string | null;
  tags: { id: string; name: string }[];
  date: string | null;
};

type View = "cards" | "list" | "table" | "calendar";
const VIEWS: { key: View; icon: typeof LayoutGrid; label: string }[] = [
  { key: "cards", icon: LayoutGrid, label: "Cards" },
  { key: "list", icon: LayoutList, label: "List" },
  { key: "table", icon: TableIcon, label: "Table" },
  { key: "calendar", icon: CalendarDays, label: "Calendar" },
];

/** Featured-image thumbnail used by the list/table/calendar views. */
function Thumb({ url, className }: { url: string | null; className?: string }) {
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt="" className={cn("shrink-0 rounded object-cover", className)} />;
  }
  return <div className={cn("flex shrink-0 items-center justify-center rounded bg-muted text-muted-foreground", className)}><ImageOff className="h-4 w-4" /></div>;
}

export function BlogPostViews({ posts }: { posts: BlogPostRow[] }) {
  const [view, setView] = useState<View>("cards");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="inline-flex rounded-md border bg-card p-0.5">
          {VIEWS.map(({ key, icon: Icon, label }) => (
            <button key={key} type="button" onClick={() => setView(key)} aria-label={`${label} view`} title={`${label} view`}
              className={cn("rounded px-2.5 py-1.5 transition-colors", view === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      {view === "cards" ? <CardsView posts={posts} /> : null}
      {view === "list" ? <ListView posts={posts} /> : null}
      {view === "table" ? <TableView posts={posts} /> : null}
      {view === "calendar" ? <CalendarView posts={posts} /> : null}
    </div>
  );
}

function CardsView({ posts }: { posts: BlogPostRow[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden">
          <div className="relative aspect-[16/7] bg-muted">
            <Thumb url={post.featured_image_url} className="h-full w-full rounded-none" />
            <BlogPostImageActions slug={post.slug} title={post.title} />
          </div>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl"><Link className="hover:underline" href={`/dashboard/blog-posts/${post.id}`}>{post.title}</Link></CardTitle>
                <CardDescription>/resources/{post.slug} - {post.author_name ?? "Michael J. Gauthier"}</CardDescription>
              </div>
              <StatusBadge status={post.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground" style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, overflow: "hidden" }}>{post.excerpt || "No excerpt yet."}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {post.category_name ? <span className="rounded-md bg-muted px-2 py-1">{post.category_name}</span> : null}
              {post.tags.map((tag) => <span key={tag.id} className="rounded-md bg-muted px-2 py-1"><Tags className="mr-1 inline h-3 w-3" />{tag.name}</span>)}
            </div>
            <BlogPostActions postId={post.id} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ListView({ posts }: { posts: BlogPostRow[] }) {
  return (
    <Card>
      <CardContent className="divide-y p-0">
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-4 p-3">
            <Link href={`/dashboard/blog-posts/${post.id}`} className="shrink-0"><Thumb url={post.featured_image_url} className="h-14 w-24" /></Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/blog-posts/${post.id}`} className="truncate font-medium hover:underline">{post.title}</Link>
                <StatusBadge status={post.status} />
              </div>
              <p className="truncate text-xs text-muted-foreground">/resources/{post.slug}{post.category_name ? ` · ${post.category_name}` : ""}{post.date ? ` · ${new Date(post.date).toLocaleDateString()}` : ""}</p>
            </div>
            <div className="shrink-0"><BlogPostActions postId={post.id} /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TableView({ posts }: { posts: BlogPostRow[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow><TableHead className="w-24">Image</TableHead><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell><Link href={`/dashboard/blog-posts/${post.id}`}><Thumb url={post.featured_image_url} className="h-10 w-16" /></Link></TableCell>
                <TableCell className="font-medium"><Link href={`/dashboard/blog-posts/${post.id}`} className="hover:underline">{post.title}</Link></TableCell>
                <TableCell>{post.category_name ?? "-"}</TableCell>
                <TableCell><StatusBadge status={post.status} /></TableCell>
                <TableCell>{post.date ? new Date(post.date).toLocaleDateString() : "-"}</TableCell>
                <TableCell className="text-right"><BlogPostActions postId={post.id} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CalendarView({ posts }: { posts: BlogPostRow[] }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() }; });
  const byDay = useMemo(() => {
    const map = new Map<string, BlogPostRow[]>();
    for (const p of posts) {
      if (!p.date) continue;
      const dt = new Date(p.date);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return map;
  }, [posts]);
  const first = new Date(cursor.y, cursor.m, 1);
  const start = new Date(first); start.setDate(1 - first.getDay());
  const cells = Array.from({ length: 42 }, (_, k) => { const x = new Date(start); x.setDate(start.getDate() + k); return x; });
  const todayKey = (() => { const t = new Date(); return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`; })();
  const shift = (delta: number) => setCursor((c) => { const m = c.m + delta; return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }; });
  return (
    <Card><CardContent className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{first.toLocaleDateString([], { month: "long", year: "numeric" })}</h3>
        <div className="flex gap-1">
          <button type="button" onClick={() => shift(-1)} className="rounded border p-1 hover:bg-accent"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => shift(1)} className="rounded border p-1 hover:bg-accent"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d) => {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const items = byDay.get(key) ?? [];
          const inMonth = d.getMonth() === cursor.m;
          return (
            <div key={key} className={cn("min-h-[92px] rounded border p-1", inMonth ? "bg-background" : "bg-muted/30 text-muted-foreground/60", key === todayKey && "ring-1 ring-primary")}>
              <div className="text-xs">{d.getDate()}</div>
              <div className="mt-0.5 space-y-1">
                {items.slice(0, 2).map((post) => (
                  <Link key={post.id} href={`/dashboard/blog-posts/${post.id}`} className="flex items-center gap-1 rounded bg-primary/10 p-0.5 hover:bg-primary/20" title={post.title}>
                    <Thumb url={post.featured_image_url} className="h-6 w-8" />
                    <span className="truncate text-[11px] text-primary">{post.title}</span>
                  </Link>
                ))}
                {items.length > 2 ? <div className="px-1 text-[10px] text-muted-foreground">+{items.length - 2} more</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </CardContent></Card>
  );
}
