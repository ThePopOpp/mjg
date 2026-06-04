"use client";

import { FormEvent, useMemo, useState } from "react";
import { Copy, ImageIcon, Mic, Save, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type AssetType = "audio" | "video" | "photo";

const tabs: { value: AssetType; label: string; icon: any }[] = [
  { value: "audio", label: "Audio", icon: Mic },
  { value: "video", label: "Video", icon: Video },
  { value: "photo", label: "Photos", icon: ImageIcon },
];

export function MediaStudioDashboard({ assets }: { assets: any[] }) {
  const router = useRouter();
  const [active, setActive] = useState<AssetType>("audio");
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("private");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const visibleAssets = useMemo(() => assets.filter((asset) => asset.asset_type === active), [active, assets]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/media-assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        assetType: active,
        sourceType: embedUrl ? "embed" : "external_url",
        fileUrl,
        embedUrl,
        description,
        status,
        visibility,
      }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setError(data.error ?? "Media save failed.");
      return;
    }

    setTitle("");
    setFileUrl("");
    setEmbedUrl("");
    setDescription("");
    setMessage("Media asset saved.");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-md border bg-card p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                active === tab.value && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
              onClick={() => setActive(tab.value)}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{active === "audio" ? "Audio" : active === "video" ? "Video" : "Photo"} asset</CardTitle>
          <CardDescription>
            Add URLs now. Uploads, in-browser recording, Supabase Storage, and gallery publishing targets are scaffolded for the next pass.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
            <label className="space-y-2">
              <span className="text-sm font-medium">Title</span>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Status</span>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="hidden">Hidden</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">File URL</span>
              <Input value={fileUrl} onChange={(event) => setFileUrl(event.target.value)} placeholder="https://..." />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Embed URL</span>
              <Input value={embedUrl} onChange={(event) => setEmbedUrl(event.target.value)} placeholder="https://..." />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Visibility</span>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 lg:col-span-2">
              <span className="text-sm font-medium">Description</span>
              <textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <div className="lg:col-span-2">
              {message ? <p className="mb-3 rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
              {error ? <p className="mb-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
              <Button disabled={saving || !title} type="submit">
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save media asset"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tabs.find((tab) => tab.value === active)?.label} library</CardTitle>
          <CardDescription>Each asset has a unique URL and an embed reference for dashboard or frontend use.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {visibleAssets.map((asset) => (
            <div key={asset.id} className="grid gap-3 rounded-md border p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{asset.title}</p>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{asset.status}</span>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{asset.visibility}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{asset.description || asset.file_url || asset.embed_url || "No description."}</p>
                <p className="mt-2 rounded-md bg-muted p-2 font-mono text-xs">/media/{asset.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard?.writeText(`<iframe src="/media/${asset.slug}" title="${asset.title}"></iframe>`)}
                >
                  <Copy className="h-4 w-4" />
                  Copy embed
                </Button>
              </div>
            </div>
          ))}
          {!visibleAssets.length ? <p className="text-sm text-muted-foreground">No {active} assets yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
