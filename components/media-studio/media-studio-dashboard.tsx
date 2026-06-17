"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Copy, FileAudio, ImageIcon, LinkIcon, Mic, Pause, Pencil, Play, RotateCcw, Save, Square, Upload, Video, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { cn } from "@/lib/utils";

type AssetType = "audio" | "video" | "photo";
type UploadedFile = { url: string; bucket: string; path: string; mimeType: string; fileSize: number };

const tabs: { value: AssetType; label: string; icon: any }[] = [
  { value: "audio", label: "Audio", icon: Mic },
  { value: "video", label: "Video", icon: Video },
  { value: "photo", label: "Photos", icon: ImageIcon },
];

const displayTargets = [
  { key: "frontend_home", label: "Frontend home" },
  { key: "frontend_resources", label: "Resources page" },
  { key: "user_dashboard_notifications", label: "User dashboard notifications" },
  { key: "user_dashboard_audio", label: "User dashboard audio files" },
  { key: "selected_users", label: "Selected users later" },
];

const hours = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));

export function MediaStudioDashboard({ actionToken, assets }: { actionToken: string; assets: any[] }) {
  const router = useRouter();
  const dashboardActionToken = useDashboardActionToken();
  const effectiveActionToken = actionToken || dashboardActionToken;
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
    if (!effectiveActionToken) {
      setError("Dashboard action token is missing. Refresh the page, sign in again, and try saving.");
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/admin/media-assets", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": effectiveActionToken },
      body: JSON.stringify({
        actionToken: effectiveActionToken,
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

      {active === "audio" ? (
        <AudioStudio actionToken={effectiveActionToken} assets={visibleAssets} />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{active === "video" ? "Video" : "Photo"} asset</CardTitle>
              <CardDescription>Add URLs now. Uploads and publishing targets can follow the audio workflow in the next pass.</CardDescription>
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
          <MediaLibrary active={active} assets={visibleAssets} />
        </>
      )}
    </div>
  );
}

function AudioStudio({ actionToken, assets }: { actionToken: string; assets: any[] }) {
  const router = useRouter();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const previewAudio = useRef<HTMLAudioElement | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [uploadedAudio, setUploadedAudio] = useState<UploadedFile | null>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<UploadedFile | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [thumbnailFileName, setThumbnailFileName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("private");
  const [publishDate, setPublishDate] = useState("");
  const [publishHour, setPublishHour] = useState("08");
  const [publishMinute, setPublishMinute] = useState("00");
  const [publishPeriod, setPublishPeriod] = useState("AM");
  const [targets, setTargets] = useState<string[]>(["frontend_resources"]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerAsset, setPlayerAsset] = useState<any | null>(null);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  const currentAudioUrl = uploadedAudio?.url || audioUrl || audioPreviewUrl;
  const currentThumbnail = uploadedThumbnail?.url || thumbnailUrl;
  const publishAt = buildPublishAt(publishDate, publishHour, publishMinute, publishPeriod);

  async function startRecording() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("This browser does not support in-browser audio recording.");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks.current = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorder.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks.current, { type: recorder.mimeType || "audio/webm" });
      setRecordedBlob(blob);
      setUploadedAudio(null);
      setAudioPreviewUrl(URL.createObjectURL(blob));
    };
    recorder.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorder.current?.stop();
    setRecording(false);
  }

  function resetRecording() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl("");
    setRecordedBlob(null);
    setUploadedAudio(null);
    setAudioFileName("");
  }

  async function handleAudioUpload(file: File) {
    setError(null);
    const upload = await uploadFile(file, "audio", actionToken);
    setUploadedAudio(upload);
    setAudioFileName(file.name);
    setAudioUrl("");
    setRecordedBlob(null);
    setAudioPreviewUrl(upload.url);
  }

  async function handleThumbnailUpload(file: File) {
    setError(null);
    const upload = await uploadFile(file, "thumbnail", actionToken);
    setUploadedThumbnail(upload);
    setThumbnailFileName(file.name);
  }

  async function saveAudioAsset(nextStatus = status) {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      if (!actionToken) {
        throw new Error("Dashboard action token is missing. Refresh the page, sign in again, and try saving.");
      }

      let audio = uploadedAudio;
      if (!audio && recordedBlob) {
        const file = new File([recordedBlob], `${title || "audio-recording"}.webm`, { type: recordedBlob.type || "audio/webm" });
        audio = await uploadFile(file, "audio", actionToken);
        setUploadedAudio(audio);
      }

      const resolvedAudioUrl = audio?.url || audioUrl.trim();
      if (!resolvedAudioUrl) {
        throw new Error("Record, upload, or add an audio file URL first.");
      }
      const resolvedSourceType = recordedBlob ? "recording" : audio ? "upload" : editingAsset?.source_type || "external_url";

      const response = await fetch("/api/admin/media-assets", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({
          actionToken,
          id: editingAsset?.id,
          title,
          assetType: "audio",
          sourceType: resolvedSourceType,
          fileUrl: resolvedAudioUrl,
          storageBucket: audio?.bucket ?? editingAsset?.storage_bucket,
          storagePath: audio?.path ?? editingAsset?.storage_path,
          mimeType: audio?.mimeType ?? editingAsset?.mime_type,
          fileSize: audio?.fileSize ?? editingAsset?.file_size,
          description,
          status: nextStatus,
          visibility,
          metadata: {
            thumbnail_url: currentThumbnail || null,
            publish_at: publishAt || null,
            display_targets: targets,
            card_style: "stewardship_audio_card",
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Audio save failed.");

      resetForm();
      setMessage(editingAsset ? "Audio track updated." : nextStatus === "draft" ? "Audio track saved as draft." : "Audio track saved.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Audio save failed.");
    } finally {
      setSaving(false);
    }
  }

  function toggleTarget(target: string) {
    setTargets((current) => (current.includes(target) ? current.filter((item) => item !== target) : [...current, target]));
  }

  function resetForm() {
    setEditingAsset(null);
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setThumbnailUrl("");
    setPublishDate("");
    setPublishHour("08");
    setPublishMinute("00");
    setPublishPeriod("AM");
    setStatus("draft");
    setVisibility("private");
    setTargets(["frontend_resources"]);
    setUploadedAudio(null);
    setUploadedThumbnail(null);
    setAudioFileName("");
    setThumbnailFileName("");
    resetRecording();
  }

  function editAsset(asset: any) {
    const publishAt = asset.metadata?.publish_at ? new Date(asset.metadata.publish_at) : null;
    const hasPublishAt = Boolean(publishAt && !Number.isNaN(publishAt.getTime()));
    const publishHourValue = hasPublishAt ? publishAt!.getHours() : 8;
    const displayHour = publishHourValue % 12 || 12;
    setEditingAsset(asset);
    setTitle(asset.title ?? "");
    setDescription(asset.description ?? "");
    setAudioUrl(asset.file_url ?? "");
    setThumbnailUrl(asset.metadata?.thumbnail_url ?? "");
    setStatus(asset.status ?? "draft");
    setVisibility(asset.visibility ?? "private");
    setTargets(Array.isArray(asset.metadata?.display_targets) && asset.metadata.display_targets.length ? asset.metadata.display_targets : ["frontend_resources"]);
    setPublishDate(hasPublishAt ? `${String(publishAt!.getMonth() + 1).padStart(2, "0")}/${String(publishAt!.getDate()).padStart(2, "0")}/${publishAt!.getFullYear()}` : "");
    setPublishHour(String(displayHour).padStart(2, "0"));
    setPublishMinute(hasPublishAt ? String(publishAt!.getMinutes()).padStart(2, "0") : "00");
    setPublishPeriod(publishHourValue >= 12 ? "PM" : "AM");
    setUploadedAudio(null);
    setUploadedThumbnail(null);
    setAudioFileName("");
    setThumbnailFileName("");
    setRecordedBlob(null);
    setAudioPreviewUrl("");
    setMessage("Editing audio track. Save to update the existing card.");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{editingAsset ? "Edit audio track" : "Audio recorder"}</CardTitle>
          <CardDescription>
            {editingAsset ? `Editing ${editingAsset.title}. Save to update the existing audio card.` : "Record or upload an audio track, add its card details, and choose where it should appear."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]" onSubmit={(event) => { event.preventDefault(); saveAudioAsset(status); }}>
            <div className="space-y-5">
              <div className="rounded-md border bg-muted/30 p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button type="button" onClick={recording ? stopRecording : startRecording} variant={recording ? "destructive" : "default"}>
                    {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {recording ? "Stop recording" : "Start recording"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetRecording} disabled={!currentAudioUrl}>
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm font-medium shadow-sm">
                    <Upload className="h-4 w-4" />
                    Upload audio
                    <input className="sr-only" type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && handleAudioUpload(event.target.files[0])} />
                  </label>
                  {recording ? <Badge variant="secondary">Recording</Badge> : null}
                </div>
                {audioFileName ? (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                    <FileAudio className="h-4 w-4" />
                    {audioFileName}
                  </p>
                ) : null}
                {currentAudioUrl ? (
                  <audio ref={previewAudio} className="mt-4 w-full" controls src={currentAudioUrl}>
                    <track kind="captions" />
                  </audio>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No audio recorded or uploaded yet.</p>
                )}
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Audio title</span>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Created for More reflection" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Status</span>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium">Audio file URL</span>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      value={audioUrl}
                      onChange={(event) => {
                        setAudioUrl(event.target.value);
                        setUploadedAudio(null);
                        setAudioFileName("");
                        setAudioPreviewUrl("");
                      }}
                      placeholder="https://..."
                    />
                  </div>
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium">Short description</span>
                  <textarea
                    className="min-h-[96px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={description}
                    onChange={(event) => setDescription(limitWords(event.target.value, 50))}
                    placeholder="50 words max. The card preview will show up to three lines."
                  />
                  <span className="text-xs text-muted-foreground">{wordCount(description)}/50 words</span>
                </label>
                <div className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium">Publish schedule</span>
                  <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px_110px]">
                    <Input value={publishDate} onChange={(event) => setPublishDate(event.target.value)} placeholder="MM/DD/YYYY" />
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
                </div>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium">Thumbnail URL</span>
                  <Input value={thumbnailUrl} onChange={(event) => setThumbnailUrl(event.target.value)} placeholder="https://..." />
                </label>
                <label className="space-y-2 lg:col-span-2">
                  <span className="text-sm font-medium">Upload thumbnail</span>
                  <span className="flex min-h-24 cursor-pointer items-center justify-center rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center transition-colors hover:bg-muted/50">
                    <span className="flex flex-col items-center gap-2 text-sm">
                      <ImageIcon className="h-6 w-6 text-primary" />
                      <span className="font-medium">{thumbnailFileName || "Choose thumbnail image"}</span>
                      <span className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF</span>
                    </span>
                    <input className="sr-only" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && handleThumbnailUpload(event.target.files[0])} />
                  </span>
                </label>
              </div>

              <div className="rounded-md border p-4">
                <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
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
                  <div>
                    <p className="text-sm font-medium">Display locations</p>
                    <p className="mt-1 text-xs text-muted-foreground">Choose where this audio card can appear after it is published.</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {displayTargets.map((target) => (
                    <label key={target.key} className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-sm">
                      <span>{target.label}</span>
                      <Switch checked={targets.includes(target.key)} onCheckedChange={() => toggleTarget(target.key)} />
                    </label>
                  ))}
                </div>
              </div>

              {message ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
              {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
              <div className="flex flex-wrap gap-3">
                {editingAsset ? (
                  <Button type="button" variant="ghost" disabled={saving} onClick={resetForm}>
                    Cancel edit
                  </Button>
                ) : null}
                <Button type="button" variant="outline" disabled={saving || !title || !currentAudioUrl} onClick={() => saveAudioAsset("draft")}>
                  <Save className="h-4 w-4" />
                  Save as draft
                </Button>
                <Button type="submit" disabled={saving || !title || !currentAudioUrl}>
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : editingAsset ? "Update audio track" : "Save audio track"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Audio card preview</p>
              <AudioCard
                asset={{
                  title: title || "Audio track title",
                  description: description || "Short description",
                  file_url: currentAudioUrl,
                  status,
                  visibility,
                  metadata: { thumbnail_url: currentThumbnail, publish_at: publishAt, display_targets: targets },
                }}
                onPlay={() =>
                  setPlayerAsset({
                    title: title || "Audio track title",
                    description,
                    file_url: currentAudioUrl,
                    metadata: { thumbnail_url: currentThumbnail },
                  })
                }
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <MediaLibrary active="audio" assets={assets} onPlay={setPlayerAsset} onEdit={editAsset} />
      <AudioPlayerSheet asset={playerAsset} onClose={() => setPlayerAsset(null)} />
    </>
  );
}

function MediaLibrary({ active, assets, onPlay, onEdit }: { active: AssetType; assets: any[]; onPlay?: (asset: any) => void; onEdit?: (asset: any) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{active === "audio" ? "Audio" : active === "video" ? "Video" : "Photo"} library</CardTitle>
        <CardDescription>Each asset has a unique URL and an embed reference for dashboard or frontend use.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) =>
          active === "audio" ? (
            <AudioCard key={asset.id} asset={asset} onPlay={() => onPlay?.(asset)} onEdit={onEdit ? () => onEdit(asset) : undefined} />
          ) : (
            <div key={asset.id} className="grid gap-3 rounded-md border p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{asset.title}</p>
                  <Badge variant="secondary">{asset.status}</Badge>
                  <Badge variant="outline">{asset.visibility}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{asset.description || asset.file_url || asset.embed_url || "No description."}</p>
                <p className="mt-2 rounded-md bg-muted p-2 font-mono text-xs">/media/{asset.slug}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard?.writeText(`<iframe src="/media/${asset.slug}" title="${asset.title}"></iframe>`)}
              >
                <Copy className="h-4 w-4" />
                Copy embed
              </Button>
            </div>
          ),
        )}
        {!assets.length ? <p className="text-sm text-muted-foreground">No {active} assets yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function AudioCard({ asset, onPlay, onEdit }: { asset: any; onPlay: () => void; onEdit?: () => void }) {
  const thumbnail = asset.metadata?.thumbnail_url;
  const targets = Array.isArray(asset.metadata?.display_targets) ? asset.metadata.display_targets : [];
  return (
    <div className="overflow-hidden rounded-md border bg-card shadow-sm">
      <div className="aspect-[16/9] bg-muted">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Mic className="h-10 w-10" />
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{asset.status || "draft"}</Badge>
          <Badge variant="outline">{asset.visibility || "private"}</Badge>
        </div>
        <div>
          <h3 className="font-semibold">{asset.title}</h3>
          <p
            className="mt-1 text-sm text-muted-foreground"
            style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {asset.description || "No description."}
          </p>
        </div>
        {asset.metadata?.publish_at ? <p className="text-xs text-muted-foreground">Scheduled: {formatDate(asset.metadata.publish_at)}</p> : null}
        {targets.length ? <p className="text-xs text-muted-foreground">Displays: {targets.join(", ")}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={onPlay} disabled={!asset.file_url}>
            <Play className="h-4 w-4" />
            Review audio
          </Button>
          {onEdit ? (
            <Button type="button" size="sm" variant="outline" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
          {asset.slug ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => navigator.clipboard?.writeText(`<iframe src="/media/${asset.slug}" title="${asset.title}"></iframe>`)}
            >
              <Copy className="h-4 w-4" />
              Embed
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AudioPlayerSheet({ asset, onClose }: { asset: any | null; onClose: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  if (!asset) return null;
  const thumbnail = asset.metadata?.thumbnail_url;

  function skip(seconds: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" type="button" onClick={onClose} aria-label="Close audio player" />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border bg-card p-4 shadow-2xl md:inset-x-auto md:right-6 md:w-[520px]">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <Mic className="h-7 w-7" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{asset.title}</p>
            <p className="text-sm text-muted-foreground">{asset.description}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <audio ref={audioRef} className="mt-4 w-full" controls src={asset.file_url}>
          <track kind="captions" />
        </audio>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => skip(-10)}>Rewind 10</Button>
          <Button type="button" variant="outline" size="sm" onClick={() => audioRef.current?.play()}>
            <Play className="h-4 w-4" />
            Play
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => audioRef.current?.pause()}>
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => audioRef.current && (audioRef.current.currentTime = 0)}>
            <Square className="h-4 w-4" />
            Stop
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => skip(10)}>Forward 10</Button>
        </div>
      </div>
    </div>
  );
}

async function uploadFile(file: File, intent: "audio" | "thumbnail", actionToken: string): Promise<UploadedFile> {
  if (!actionToken) {
    throw new Error("Dashboard action token is missing. Refresh the page, sign in again, and try uploading.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("intent", intent);
  formData.append("actionToken", actionToken);
  const response = await fetch("/api/admin/media-assets/upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "x-mjg-action-token": actionToken },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Upload failed.");
  return data;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function limitWords(value: string, maxWords: number) {
  const words = value.trimStart().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return value;
  return words.slice(0, maxWords).join(" ");
}

function buildPublishAt(date: string, hour: string, minute: string, period: string) {
  if (!date.trim()) return "";
  const match = date.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return `${date.trim()} ${hour}:${minute} ${period}`;

  const [, month, day, year] = match;
  let hour24 = Number(hour);
  if (period === "PM" && hour24 < 12) hour24 += 12;
  if (period === "AM" && hour24 === 12) hour24 = 0;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day), hour24, Number(minute));
  return Number.isNaN(parsed.getTime()) ? `${date.trim()} ${hour}:${minute} ${period}` : parsed.toISOString();
}
