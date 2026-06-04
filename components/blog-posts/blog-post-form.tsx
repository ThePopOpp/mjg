"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BlogPostFormProps = {
  post?: any;
  categories: any[];
};

const statuses = ["draft", "scheduled", "published", "hidden", "archived"] as const;

export function BlogPostForm({ post, categories }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "Michael J. Gauthier");
  const [category, setCategory] = useState(post?.category?.name ?? categories[0]?.name ?? "Stewardship Blueprint");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [publishAt, setPublishAt] = useState(toDateTimeLocal(post?.publish_at));
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(post?.video_url ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).map((link: any) => link.blog_post_tags?.name).filter(Boolean).join(", "));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(post?.content_html ?? "");
  const [galleryUrls, setGalleryUrls] = useState((post?.gallery_urls ?? []).join("\n"));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const renderedSlug = useMemo(() => slug || slugify(title), [slug, title]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/admin/blog-posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: post?.id,
        title,
        slug: renderedSlug,
        authorName,
        category,
        status,
        publishAt: publishAt ? new Date(publishAt).toISOString() : null,
        featuredImageUrl,
        videoUrl,
        tags: tags.split(",").map((tag: string) => tag.trim()).filter(Boolean),
        excerpt,
        contentHtml,
        galleryUrls: galleryUrls.split(/\n+/).map((url: string) => url.trim()).filter(Boolean),
      }),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Blog post save failed.");
      return;
    }

    setMessage("Blog post saved.");
    router.refresh();
    if (!post?.id) router.push(`/dashboard/blog-posts/${data.post.id}`);
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>{post?.id ? "Edit post" : "Create post"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Title</span>
            <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Slug</span>
            <Input value={renderedSlug} onChange={(event) => setSlug(event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Author</span>
            <Input value={authorName} onChange={(event) => setAuthorName(event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Publish date</span>
            <Input type="datetime-local" value={publishAt} onChange={(event) => setPublishAt(event.target.value)} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Category</span>
            <Input list="blog-categories" value={category} onChange={(event) => setCategory(event.target.value)} />
            <datalist id="blog-categories">
              {categories.map((item) => <option key={item.id} value={item.name} />)}
            </datalist>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statuses.map((item) => <SelectItem key={item} value={item}>{labelize(item)}</SelectItem>)}
              </SelectContent>
            </Select>
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium">Tags</span>
            <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Faith, stewardship, Created for More" />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium">Featured image URL</span>
            <Input value={featuredImageUrl} onChange={(event) => setFeaturedImageUrl(event.target.value)} placeholder="https://..." />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium">Video URL</span>
            <Input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://..." />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium">Image gallery URLs</span>
            <textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={galleryUrls} onChange={(event) => setGalleryUrls(event.target.value)} placeholder="One image URL per line" />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium">Excerpt</span>
            <textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium">WYSIWYG / HTML editor</span>
            <textarea className="min-h-96 w-full rounded-md border bg-background p-3 font-mono text-sm" value={contentHtml} onChange={(event) => setContentHtml(event.target.value)} placeholder="<p>Write or paste your post content here...</p>" />
          </label>
        </CardContent>
      </Card>

      {message ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

      <Button disabled={saving || !title} type="submit">
        <Save className="h-4 w-4" />
        {saving ? "Saving..." : "Save post"}
      </Button>
    </form>
  );
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
