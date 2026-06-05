"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  MousePointerClick,
  PanelTop,
  Rows3,
  Save,
  Square,
  Type,
  Upload,
  Video,
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/browser";

type BlogPostFormProps = {
  post?: any;
  categories: any[];
};

const statuses = ["draft", "scheduled", "published", "hidden", "archived"] as const;
const hours = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
type UploadedFile = { url: string; bucket: string; path: string; mimeType: string; fileSize: number };

export function BlogPostForm({ post, categories }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [authorName, setAuthorName] = useState(post?.author_name ?? "Michael J. Gauthier");
  const [category, setCategory] = useState(post?.category?.name ?? categories[0]?.name ?? "Stewardship Blueprint");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const initialPublish = splitPublishDate(post?.publish_at);
  const [publishDate, setPublishDate] = useState(initialPublish.date);
  const [publishHour, setPublishHour] = useState(initialPublish.hour);
  const [publishMinute, setPublishMinute] = useState(initialPublish.minute);
  const [publishPeriod, setPublishPeriod] = useState(initialPublish.period);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image_url ?? "");
  const [videoUrl, setVideoUrl] = useState(post?.video_url ?? "");
  const [tags, setTags] = useState((post?.tags ?? []).map((link: any) => link.blog_post_tags?.name).filter(Boolean).join(", "));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [contentHtml, setContentHtml] = useState(post?.content_html ?? "");
  const [galleryUrls, setGalleryUrls] = useState((post?.gallery_urls ?? []).join("\n"));
  const [featuredImageFile, setFeaturedImageFile] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<"simple" | "html" | "wysiwyg">("simple");
  const [fontSize, setFontSize] = useState("18");
  const [textColor, setTextColor] = useState("#0f1f1a");
  const [buttonColor, setButtonColor] = useState("#2f6848");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const renderedSlug = useMemo(() => slug || slugify(title), [slug, title]);
  const publishAt = buildPublishAt(publishDate, publishHour, publishMinute, publishPeriod);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const authHeaders = await getAuthHeaders();
    const response = await fetch("/api/admin/blog-posts", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({
        id: post?.id,
        title,
        slug: renderedSlug,
        authorName,
        category,
        status,
        publishAt: publishAt || null,
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

  function insertSnippet(snippet: string) {
    setContentHtml((current: string) => `${current}${current ? "\n" : ""}${snippet}`);
  }

  function insertImageSnippet() {
    const url = window.prompt("Image URL");
    if (!url) return;
    insertSnippet(`<figure style="margin:24px 0;"><img src="${escapeAttribute(url)}" alt="" style="display:block;width:100%;height:auto;border-radius:8px;" /></figure>`);
  }

  function insertLinkSnippet() {
    const url = window.prompt("Link URL");
    if (!url) return;
    const text = window.prompt("Link text") || "Read more";
    insertSnippet(`<a href="${escapeAttribute(url)}" style="color:#2f6848;text-decoration:underline;">${escapeHtml(text)}</a>`);
  }

  function insertButtonSnippet() {
    const url = window.prompt("Button URL");
    if (!url) return;
    const text = window.prompt("Button text") || "Learn more";
    insertSnippet(`<p style="margin:28px 0;"><a href="${escapeAttribute(url)}" style="display:inline-block;background:${buttonColor};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700;">${escapeHtml(text)}</a></p>`);
  }

  function execEditor(command: string, value?: string) {
    document.execCommand(command, false, value);
    const editor = document.getElementById("blog-wysiwyg-editor");
    if (editor) setContentHtml(editor.innerHTML);
  }

  async function uploadFeaturedImage(file: File) {
    setUploading("featured");
    setError(null);
    try {
      const upload = await uploadBlogFile(file, "thumbnail");
      setFeaturedImageUrl(upload.url);
      setFeaturedImageFile(file.name);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Featured image upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function uploadGalleryImages(files: FileList) {
    setUploading("gallery");
    setError(null);
    try {
      const uploads: UploadedFile[] = [];
      for (const file of Array.from(files)) {
        uploads.push(await uploadBlogFile(file, "thumbnail"));
      }
      setGalleryUrls((current: string) => [
        ...current.split(/\n+/).map((url: string) => url.trim()).filter(Boolean),
        ...uploads.map((upload) => upload.url),
      ].join("\n"));
      setGalleryFiles((current: string[]) => [...current, ...Array.from(files).map((file) => file.name)]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Gallery upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function uploadVideo(file: File) {
    setUploading("video");
    setError(null);
    try {
      const upload = await uploadBlogFile(file, "video");
      setVideoUrl(upload.url);
      setVideoFile(file.name);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Video upload failed.");
    } finally {
      setUploading(null);
    }
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
            <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px_110px]">
              <BrandedDatePicker value={publishDate} onChange={setPublishDate} />
              <Select value={publishHour} onValueChange={setPublishHour}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{hours.map((hour) => <SelectItem key={hour} value={hour}>{hour}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={publishMinute} onValueChange={setPublishMinute}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{minutes.map((minute) => <SelectItem key={minute} value={minute}>{minute}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={publishPeriod} onValueChange={setPublishPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Category</span>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
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
          <div className="grid gap-4 lg:col-span-2 lg:grid-cols-3">
            <UploadField
              accept="image/*"
              busy={uploading === "featured"}
              description={featuredImageFile || featuredImageUrl || "Upload the main image for this post."}
              icon={<ImageIcon className="h-6 w-6 text-primary" />}
              label="Featured image"
              onChange={(files) => files?.[0] && uploadFeaturedImage(files[0])}
            />
            <UploadField
              accept="image/*"
              busy={uploading === "gallery"}
              description={galleryFiles.length ? `${galleryFiles.length} gallery image(s) selected` : "Upload one or more gallery images."}
              icon={<ImageIcon className="h-6 w-6 text-primary" />}
              label="Image gallery"
              multiple
              onChange={(files) => files && uploadGalleryImages(files)}
            />
            <UploadField
              accept="video/*"
              busy={uploading === "video"}
              description={videoFile || videoUrl || "Upload a video file for this post."}
              icon={<Video className="h-6 w-6 text-primary" />}
              label="Video"
              onChange={(files) => files?.[0] && uploadVideo(files[0])}
            />
          </div>
          <Accordion type="single" collapsible className="lg:col-span-2">
            <AccordionItem value="url-fallbacks" className="rounded-md border bg-background px-4">
              <AccordionTrigger className="hover:no-underline">Advanced URL fallbacks</AccordionTrigger>
              <AccordionContent className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Featured image URL</span>
                  <Input value={featuredImageUrl} onChange={(event) => setFeaturedImageUrl(event.target.value)} placeholder="https://..." />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Video URL</span>
                  <Input value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} placeholder="https://..." />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-medium">Image gallery URLs</span>
                  <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={galleryUrls} onChange={(event) => setGalleryUrls(event.target.value)} placeholder="One image URL per line" />
                </label>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-sm font-medium">Excerpt</span>
            <textarea className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
          </label>
          <div className="space-y-3 lg:col-span-2">
            <div>
              <span className="text-sm font-medium">Post content editor</span>
              <p className="text-xs text-muted-foreground">Use Simple Builder for styled blocks, Advanced HTML for full control, or WYSIWYG for direct editing.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant={editorMode === "simple" ? "default" : "outline"} onClick={() => setEditorMode("simple")}>Simple Builder</Button>
              <Button type="button" variant={editorMode === "html" ? "default" : "outline"} onClick={() => setEditorMode("html")}>Advanced HTML</Button>
              <Button type="button" variant={editorMode === "wysiwyg" ? "default" : "outline"} onClick={() => setEditorMode("wysiwyg")}>WYSIWYG</Button>
            </div>

            {editorMode === "simple" ? (
              <div className="space-y-4 rounded-md border bg-card p-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="space-y-2 text-sm font-medium">
                    <span>Font size</span>
                    <Input type="number" min="12" max="72" value={fontSize} onChange={(event) => setFontSize(event.target.value)} />
                  </label>
                  <ColorField label="Text color" value={textColor} onChange={setTextColor} />
                  <ColorField label="Button color" value={buttonColor} onChange={setButtonColor} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <SnippetButton icon={<Rows3 className="h-4 w-4" />} label="Row" onClick={() => insertSnippet(blogBlocks.row)} />
                  <SnippetButton icon={<PanelTop className="h-4 w-4" />} label="2 Columns" onClick={() => insertSnippet(blogBlocks.columns)} />
                  <SnippetButton icon={<Type className="h-4 w-4" />} label="Text" onClick={() => insertSnippet(`<p style="font-size:${fontSize}px;line-height:1.7;color:${textColor};margin:0 0 20px;">Write your paragraph here.</p>`)} />
                  <SnippetButton icon={<Bold className="h-4 w-4" />} label="Bold Text" onClick={() => insertSnippet(`<p style="font-size:${fontSize}px;line-height:1.7;color:${textColor};font-weight:700;margin:0 0 20px;">Bold paragraph text.</p>`)} />
                  <SnippetButton icon={<Italic className="h-4 w-4" />} label="Italic Text" onClick={() => insertSnippet(`<p style="font-size:${fontSize}px;line-height:1.7;color:${textColor};font-style:italic;margin:0 0 20px;">Italic paragraph text.</p>`)} />
                  <SnippetButton icon={<AlignLeft className="h-4 w-4" />} label="Left" onClick={() => insertSnippet(alignedText("left", fontSize, textColor))} />
                  <SnippetButton icon={<AlignCenter className="h-4 w-4" />} label="Center" onClick={() => insertSnippet(alignedText("center", fontSize, textColor))} />
                  <SnippetButton icon={<AlignRight className="h-4 w-4" />} label="Right" onClick={() => insertSnippet(alignedText("right", fontSize, textColor))} />
                  <SnippetButton icon={<ImageIcon className="h-4 w-4" />} label="Image" onClick={insertImageSnippet} />
                  <SnippetButton icon={<LinkIcon className="h-4 w-4" />} label="Link" onClick={insertLinkSnippet} />
                  <SnippetButton icon={<MousePointerClick className="h-4 w-4" />} label="Button" onClick={insertButtonSnippet} />
                  <SnippetButton icon={<Square className="h-4 w-4" />} label="Divider" onClick={() => insertSnippet(blogBlocks.divider)} />
                </div>
                <textarea className="min-h-[24rem] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm" value={contentHtml} onChange={(event) => setContentHtml(event.target.value)} placeholder="<p>Build your post content here...</p>" />
              </div>
            ) : null}

            {editorMode === "html" ? (
              <textarea className="min-h-[36rem] w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm" value={contentHtml} onChange={(event) => setContentHtml(event.target.value)} placeholder="<p>Write or paste your post content here...</p>" />
            ) : null}

            {editorMode === "wysiwyg" ? (
              <div className="space-y-3 rounded-md border bg-card p-4">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => execEditor("bold")}><Bold className="h-4 w-4" />Bold</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => execEditor("italic")}><Italic className="h-4 w-4" />Italic</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => execEditor("justifyLeft")}><AlignLeft className="h-4 w-4" />Left</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => execEditor("justifyCenter")}><AlignCenter className="h-4 w-4" />Center</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => execEditor("justifyRight")}><AlignRight className="h-4 w-4" />Right</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => execEditor("foreColor", textColor)}>Apply color</Button>
                  <Button type="button" size="sm" variant="outline" onClick={insertLinkSnippet}><LinkIcon className="h-4 w-4" />Add link</Button>
                  <Button type="button" size="sm" variant="outline" onClick={insertImageSnippet}><ImageIcon className="h-4 w-4" />Add image</Button>
                </div>
                <div
                  id="blog-wysiwyg-editor"
                  className="min-h-[28rem] rounded-md border border-input bg-background px-4 py-3 text-base leading-7 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  contentEditable
                  dangerouslySetInnerHTML={{ __html: contentHtml || "<p>Write your post here...</p>" }}
                  onInput={(event) => setContentHtml(event.currentTarget.innerHTML)}
                  suppressContentEditableWarning
                />
              </div>
            ) : null}
          </div>
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

function splitPublishDate(value?: string | null) {
  if (!value) return { date: "", hour: "08", minute: "00", period: "AM" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", hour: "08", minute: "00", period: "AM" };
  const hour = date.getHours();
  return {
    date: `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`,
    hour: String(hour % 12 || 12).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
    period: hour >= 12 ? "PM" : "AM",
  };
}

function buildPublishAt(date: string, hour: string, minute: string, period: string) {
  if (!date.trim()) return "";
  const match = date.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return "";

  const [, month, day, year] = match;
  let hour24 = Number(hour);
  if (period === "PM" && hour24 < 12) hour24 += 12;
  if (period === "AM" && hour24 === 12) hour24 = 0;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day), hour24, Number(minute));
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function BrandedDatePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const initial = parseDateValue(value) ?? new Date();
  const [open, setOpen] = useState(false);
  const [monthDate, setMonthDate] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const selected = parseDateValue(value);
  const days = getCalendarDays(monthDate);

  function moveMonth(delta: number) {
    setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  function choose(date: Date) {
    onChange(formatDateValue(date));
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        onClick={() => setOpen((current) => !current)}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || "MM/DD/YYYY"}</span>
        <CalendarDays className="h-4 w-4 text-muted-foreground" />
      </button>
      {open ? (
        <div className="absolute z-40 mt-2 w-[310px] rounded-md border bg-popover p-3 text-popover-foreground shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <Button type="button" variant="ghost" size="icon" onClick={() => moveMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold">{monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
            <Button type="button" variant="ghost" size="icon" onClick={() => moveMonth(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === monthDate.getMonth();
              const isSelected = selected ? formatDateValue(day) === formatDateValue(selected) : false;
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={[
                    "h-9 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                    inMonth ? "text-foreground" : "text-muted-foreground/50",
                    isSelected ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : "",
                  ].join(" ")}
                  onClick={() => choose(day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between">
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")}>Clear</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => choose(new Date())}>Today</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UploadField({
  accept,
  busy,
  description,
  icon,
  label,
  multiple,
  onChange,
}: {
  accept: string;
  busy: boolean;
  description: string;
  icon: React.ReactNode;
  label: string;
  multiple?: boolean;
  onChange: (files: FileList | null) => void;
}) {
  return (
    <label className="flex min-h-40 cursor-pointer flex-col justify-between rounded-md border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50">
      <span className="flex items-center gap-2 text-sm font-semibold">{icon}{label}</span>
      <span className="mt-4 line-clamp-2 text-sm text-muted-foreground">{busy ? "Uploading..." : description}</span>
      <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs font-medium">
        <Upload className="h-4 w-4" />
        Choose file
      </span>
      <input className="sr-only" type="file" accept={accept} multiple={multiple} onChange={(event) => onChange(event.target.files)} />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <div className="flex gap-2">
        <Input className="h-9 w-12 p-1" type="color" value={value} onChange={(event) => onChange(event.target.value)} />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function SnippetButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Button size="sm" type="button" variant="outline" onClick={onClick}>
      {icon}
      {label}
    </Button>
  );
}

async function uploadBlogFile(file: File, intent: "thumbnail" | "video"): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("intent", intent);
  const authHeaders = await getAuthHeaders();
  const response = await fetch("/api/admin/media-assets/upload", {
    method: "POST",
    credentials: "include",
    headers: authHeaders,
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Upload failed.");
  return data;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  } catch {
    return {};
  }
}

function alignedText(alignment: "left" | "center" | "right", fontSize: string, color: string) {
  return `<p style="font-size:${fontSize}px;line-height:1.7;color:${color};text-align:${alignment};margin:0 0 20px;">Aligned paragraph text.</p>`;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;" }[char] ?? char));
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

const blogBlocks = {
  row: `<section style="margin:0 0 28px;">
  <p style="font-size:18px;line-height:1.7;margin:0;">Add row content here.</p>
</section>`,
  columns: `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:0 0 28px;">
  <div><p style="font-size:18px;line-height:1.7;margin:0;">Left column content.</p></div>
  <div><p style="font-size:18px;line-height:1.7;margin:0;">Right column content.</p></div>
</div>`,
  divider: `<hr style="border:none;border-top:1px solid #ddd8cc;margin:32px 0;" />`,
};

function parseDateValue(value: string) {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, month, day, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateValue(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}/${date.getFullYear()}`;
}

function getCalendarDays(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
