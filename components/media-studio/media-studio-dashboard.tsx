"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Copy, Download, FileAudio, FileText, ImageIcon, LayoutGrid, LayoutList, LinkIcon, Mic,
  Pause, Pencil, Play, RotateCcw, Save, Square, Table, Upload, Video, X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { SendToClaudeButton } from "@/components/dev-requests/send-to-claude-button";
import { AskStewardButton } from "@/components/ai-agent/ask-steward-button";
import { ListenOrderPanel } from "@/components/media-studio/listen-order-panel";
import { cn } from "@/lib/utils";

type AssetType = "audio" | "video" | "photo" | "document";
type ViewMode = "card" | "list" | "table";
type SubTab = "studio" | "files";
type UploadedFile = { url: string; bucket: string; path: string; mimeType: string; fileSize: number };

const mediaTypes: { value: AssetType; label: string; icon: React.ElementType }[] = [
  { value: "audio", label: "Audio", icon: Mic },
  { value: "video", label: "Video", icon: Video },
  { value: "photo", label: "Photos", icon: ImageIcon },
  { value: "document", label: "Resources", icon: FileText },
];

const resourceTypes = [
  { value: "feature_request", label: "Feature request" },
  { value: "reference", label: "Reference / documentation" },
  { value: "design", label: "Design / asset" },
  { value: "other", label: "Other" },
];

function typeLabelFor(active: AssetType) {
  return active === "audio" ? "Audio" : active === "video" ? "Video" : active === "photo" ? "Photo" : "Resource";
}

function typeIconFor(active: AssetType) {
  return active === "audio" ? Mic : active === "video" ? Video : active === "document" ? FileText : ImageIcon;
}

const displayTargets = [
  { key: "frontend_home", label: "Frontend home" },
  { key: "frontend_resources", label: "Resources page" },
  { key: "frontend_listen", label: "Listen page" },
  { key: "user_dashboard_notifications", label: "User dashboard notifications" },
  { key: "user_dashboard_audio", label: "User dashboard audio files" },
  { key: "selected_users", label: "Selected users later" },
];

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

type ShareableAdmin = { id: string; name: string; email: string };

export function MediaStudioDashboard({
  actionToken,
  assets,
  superAdmins = [],
  isSuperAdmin = false,
}: {
  actionToken: string;
  assets: any[];
  superAdmins?: ShareableAdmin[];
  isSuperAdmin?: boolean;
}) {
  const dashboardActionToken = useDashboardActionToken();
  const effectiveActionToken = actionToken || dashboardActionToken;
  const [active, setActive] = useState<AssetType>("audio");
  const [subTab, setSubTab] = useState<SubTab>("studio");
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [playerAsset, setPlayerAsset] = useState<any | null>(null);
  const editSeq = useRef(0);
  const [audioEditTrigger, setAudioEditTrigger] = useState<{ asset: any; seq: number } | null>(null);
  const [documentEditTrigger, setDocumentEditTrigger] = useState<{ asset: any; seq: number } | null>(null);

  const visibleAssets = useMemo(() => assets.filter((a) => a.asset_type === active), [active, assets]);

  function switchMediaType(tab: AssetType) {
    setActive(tab);
    setSubTab("studio");
  }

  function handleEditAudio(asset: any) {
    editSeq.current += 1;
    setAudioEditTrigger({ asset, seq: editSeq.current });
    setSubTab("studio");
  }

  function handleEditDocument(asset: any) {
    editSeq.current += 1;
    setDocumentEditTrigger({ asset, seq: editSeq.current });
    setSubTab("studio");
  }

  const typeLabel = typeLabelFor(active);

  return (
    <div className="space-y-4">
      {/* Main media type tabs */}
      <div className="flex flex-wrap gap-2 rounded-md border bg-card p-1">
        {mediaTypes.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              type="button"
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                active === tab.value && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
              onClick={() => switchMediaType(tab.value)}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Studio / Files sub-tabs */}
      <div className="flex w-fit items-center gap-1 rounded-lg border bg-muted p-1">
        {(["studio", "files"] as SubTab[]).map((s) => (
          <button
            key={s}
            type="button"
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              subTab === s
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => setSubTab(s)}
          >
            {s === "studio" ? `${typeLabel} Studio` : `${typeLabel} Files`}
            {s === "files" && visibleAssets.length > 0 && (
              <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-xs leading-none text-primary">
                {visibleAssets.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Studio content */}
      {subTab === "studio" && active === "audio" && (
        <>
          <AudioStudio
            actionToken={effectiveActionToken}
            editTrigger={audioEditTrigger}
            onPlay={setPlayerAsset}
          />
          <ListenOrderPanel assets={visibleAssets} actionToken={effectiveActionToken} />
        </>
      )}
      {subTab === "studio" && active === "document" && (
        <ResourceStudio
          actionToken={effectiveActionToken}
          editTrigger={documentEditTrigger}
          superAdmins={superAdmins}
          isSuperAdmin={isSuperAdmin}
        />
      )}
      {subTab === "studio" && (active === "video" || active === "photo") && (
        <VideoPhotoStudio active={active} actionToken={effectiveActionToken} />
      )}

      {/* Files content */}
      {subTab === "files" && (
        <MediaLibrary
          active={active}
          assets={visibleAssets}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPlay={active === "audio" ? setPlayerAsset : undefined}
          onEdit={active === "audio" ? handleEditAudio : active === "document" ? handleEditDocument : undefined}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      <AudioPlayerSheet asset={playerAsset} onClose={() => setPlayerAsset(null)} />
    </div>
  );
}

// ─── Audio Studio ────────────────────────────────────────────────────────────

function AudioStudio({
  actionToken,
  editTrigger,
  onPlay,
}: {
  actionToken: string;
  editTrigger: { asset: any; seq: number } | null;
  onPlay: (asset: any) => void;
}) {
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
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  const currentAudioUrl = uploadedAudio?.url || audioUrl || audioPreviewUrl;
  const currentThumbnail = uploadedThumbnail?.url || thumbnailUrl;
  const publishAt = buildPublishAt(publishDate, publishHour, publishMinute, publishPeriod);

  function editAsset(asset: any) {
    const at = asset.metadata?.publish_at ? new Date(asset.metadata.publish_at) : null;
    const hasAt = Boolean(at && !Number.isNaN(at.getTime()));
    const hr = hasAt ? at!.getHours() : 8;
    const displayHr = hr % 12 || 12;
    setEditingAsset(asset);
    setTitle(asset.title ?? "");
    setDescription(asset.description ?? "");
    setAudioUrl(asset.file_url ?? "");
    setThumbnailUrl(asset.metadata?.thumbnail_url ?? "");
    setStatus(asset.status ?? "draft");
    setVisibility(asset.visibility ?? "private");
    setTargets(Array.isArray(asset.metadata?.display_targets) && asset.metadata.display_targets.length ? asset.metadata.display_targets : ["frontend_resources"]);
    setPublishDate(hasAt ? `${String(at!.getMonth() + 1).padStart(2, "0")}/${String(at!.getDate()).padStart(2, "0")}/${at!.getFullYear()}` : "");
    setPublishHour(String(displayHr).padStart(2, "0"));
    setPublishMinute(hasAt ? String(at!.getMinutes()).padStart(2, "0") : "00");
    setPublishPeriod(hr >= 12 ? "PM" : "AM");
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

  // Keep a stable ref so the useEffect below always calls the latest version.
  const editAssetRef = useRef(editAsset);
  editAssetRef.current = editAsset;

  // When the parent requests an edit (user clicked Edit in Files tab), populate the form.
  useEffect(() => {
    if (editTrigger?.asset) editAssetRef.current(editTrigger.asset);
  }, [editTrigger?.seq]); // eslint-disable-line react-hooks/exhaustive-deps

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
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.current.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
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
      if (!actionToken) throw new Error("Dashboard action token is missing. Refresh the page, sign in again, and try saving.");
      let audio = uploadedAudio;
      if (!audio && recordedBlob) {
        const file = new File([recordedBlob], `${title || "audio-recording"}.webm`, { type: recordedBlob.type || "audio/webm" });
        audio = await uploadFile(file, "audio", actionToken);
        setUploadedAudio(audio);
      }
      const resolvedAudioUrl = audio?.url || audioUrl.trim();
      if (!resolvedAudioUrl) throw new Error("Record, upload, or add an audio file URL first.");
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
            // saveMediaAsset REPLACES metadata wholesale, so spread the existing
            // object first — otherwise editing a track here silently wipes the
            // sort_order set by the Listen-page ordering panel.
            ...(editingAsset?.metadata ?? {}),
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

  function toggleTarget(key: string) {
    setTargets((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingAsset ? "Edit audio track" : "Audio recorder"}</CardTitle>
        <CardDescription>
          {editingAsset
            ? `Editing ${editingAsset.title}. Save to update the existing audio card.`
            : "Record or upload an audio track, add its card details, and choose where it should appear."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]"
          onSubmit={(e) => { e.preventDefault(); saveAudioAsset(status); }}
        >
          <div className="space-y-5">
            {/* Recorder controls */}
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
                  <input className="sr-only" type="file" accept="audio/*" onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])} />
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

            {/* Form fields */}
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Audio title</span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Created for More reflection" />
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
                    onChange={(e) => { setAudioUrl(e.target.value); setUploadedAudio(null); setAudioFileName(""); setAudioPreviewUrl(""); }}
                    placeholder="https://..."
                  />
                </div>
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium">Short description</span>
                <textarea
                  className="min-h-[96px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={description}
                  onChange={(e) => setDescription(limitWords(e.target.value, 50))}
                  placeholder="50 words max. The card preview will show up to three lines."
                />
                <span className="text-xs text-muted-foreground">{wordCount(description)}/50 words</span>
              </label>
              <div className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium">Publish schedule</span>
                <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px_110px]">
                  <Input value={publishDate} onChange={(e) => setPublishDate(e.target.value)} placeholder="MM/DD/YYYY" />
                  <Select value={publishHour} onValueChange={setPublishHour}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{hours.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={publishMinute} onValueChange={setPublishMinute}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{minutes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
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
                <Input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium">Upload thumbnail</span>
                <span className="flex min-h-24 cursor-pointer items-center justify-center rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center transition-colors hover:bg-muted/50">
                  <span className="flex flex-col items-center gap-2 text-sm">
                    <ImageIcon className="h-6 w-6 text-primary" />
                    <span className="font-medium">{thumbnailFileName || "Choose thumbnail image"}</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF</span>
                  </span>
                  <input className="sr-only" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleThumbnailUpload(e.target.files[0])} />
                </span>
              </label>
            </div>

            {/* Visibility + display targets */}
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
                {displayTargets.map((t) => (
                  <label key={t.key} className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-sm">
                    <span>{t.label}</span>
                    <Switch checked={targets.includes(t.key)} onCheckedChange={() => toggleTarget(t.key)} />
                  </label>
                ))}
              </div>
            </div>

            {message ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
            {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              {editingAsset ? (
                <Button type="button" variant="ghost" disabled={saving} onClick={resetForm}>Cancel edit</Button>
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

          {/* Card preview */}
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
              onPlay={() => onPlay({
                title: title || "Audio track title",
                description,
                file_url: currentAudioUrl,
                metadata: { thumbnail_url: currentThumbnail },
              })}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Video / Photo Studio ─────────────────────────────────────────────────────

function VideoPhotoStudio({ active, actionToken }: { active: "video" | "photo"; actionToken: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");
  const [visibility, setVisibility] = useState("private");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const response = await fetch("/api/admin/media-assets", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
      body: JSON.stringify({ actionToken, title, assetType: active, sourceType: embedUrl ? "embed" : "external_url", fileUrl, embedUrl, description, status, visibility }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) { setError(data.error ?? "Media save failed."); return; }
    setTitle(""); setFileUrl(""); setEmbedUrl(""); setDescription("");
    setMessage("Media asset saved.");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{active === "video" ? "Video" : "Photo"} Studio</CardTitle>
        <CardDescription>Add URLs now. Uploads and publishing targets can follow the audio workflow in the next pass.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
          <label className="space-y-2">
            <span className="text-sm font-medium">Title</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
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
            <Input value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="https://..." />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Embed URL</span>
            <Input value={embedUrl} onChange={(e) => setEmbedUrl(e.target.value)} placeholder="https://..." />
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
            <textarea className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
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
  );
}

// ─── Resource (document) Studio ───────────────────────────────────────────────

function ResourceStudio({
  actionToken,
  editTrigger,
  superAdmins,
  isSuperAdmin,
}: {
  actionToken: string;
  editTrigger: { asset: any; seq: number } | null;
  superAdmins: ShareableAdmin[];
  isSuperAdmin: boolean;
}) {
  const router = useRouter();
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState("feature_request");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("published");
  const [visibility, setVisibility] = useState("private");
  const [targets, setTargets] = useState<string[]>([]);
  const [shareWith, setShareWith] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  const currentUrl = uploaded?.url || fileUrl.trim();

  function editAsset(asset: any) {
    setEditingAsset(asset);
    setTitle(asset.title ?? "");
    setResourceType(asset.metadata?.resource_type ?? "other");
    setDescription(asset.description ?? "");
    setFileUrl(asset.file_url ?? "");
    setStatus(asset.status ?? "published");
    setVisibility(asset.visibility ?? "private");
    setTargets(Array.isArray(asset.metadata?.display_targets) ? asset.metadata.display_targets : []);
    setShareWith(Array.isArray(asset.metadata?.shared_with) ? asset.metadata.shared_with : []);
    setUploaded(null);
    setFileName(asset.metadata?.original_filename ?? "");
    setMessage("Editing resource. Save to update the existing card.");
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const editAssetRef = useRef(editAsset);
  editAssetRef.current = editAsset;

  useEffect(() => {
    if (editTrigger?.asset) editAssetRef.current(editTrigger.asset);
  }, [editTrigger?.seq]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const upload = await uploadFile(file, "document", actionToken);
      setUploaded(upload);
      setFileName(file.name);
      setFileUrl("");
      if (!title) setTitle(file.name.replace(/\.[a-z0-9]+$/i, ""));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function toggleTarget(key: string) {
    setTargets((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function toggleShareWith(id: string) {
    setShareWith((prev) => (prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]));
  }

  function resetForm() {
    setEditingAsset(null);
    setUploaded(null);
    setFileName("");
    setFileUrl("");
    setTitle("");
    setResourceType("feature_request");
    setDescription("");
    setStatus("published");
    setVisibility("private");
    setTargets([]);
    setShareWith([]);
  }

  async function save(nextStatus = status) {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      if (!actionToken) throw new Error("Dashboard action token is missing. Refresh the page, sign in again, and try saving.");
      if (!currentUrl) throw new Error("Upload a file or add a file URL first.");
      // Only notify Super Admins who weren't already on this resource, so
      // editing an existing resource doesn't re-ping everyone.
      const previouslyShared: string[] = Array.isArray(editingAsset?.metadata?.shared_with) ? editingAsset.metadata.shared_with : [];
      const notifyRecipientIds = isSuperAdmin ? shareWith.filter((id) => !previouslyShared.includes(id)) : [];
      const response = await fetch("/api/admin/media-assets", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-mjg-action-token": actionToken },
        body: JSON.stringify({
          actionToken,
          id: editingAsset?.id,
          notifyRecipientIds,
          title,
          assetType: "document",
          sourceType: uploaded ? "upload" : editingAsset?.source_type || "external_url",
          fileUrl: currentUrl,
          storageBucket: uploaded?.bucket ?? editingAsset?.storage_bucket,
          storagePath: uploaded?.path ?? editingAsset?.storage_path,
          mimeType: uploaded?.mimeType ?? editingAsset?.mime_type,
          fileSize: uploaded?.fileSize ?? editingAsset?.file_size,
          description,
          status: nextStatus,
          visibility,
          metadata: {
            resource_type: resourceType,
            original_filename: fileName || editingAsset?.metadata?.original_filename || null,
            display_targets: targets,
            shared_with: isSuperAdmin ? shareWith : editingAsset?.metadata?.shared_with ?? [],
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Resource save failed.");
      resetForm();
      setMessage(editingAsset ? "Resource updated." : nextStatus === "draft" ? "Resource saved as draft." : "Resource saved.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Resource save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingAsset ? "Edit resource" : "Add a resource"}</CardTitle>
        <CardDescription>
          Upload a PDF, image, or document (feature requests, references, assets), add its details, and choose who can see it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]"
          onSubmit={(e) => { e.preventDefault(); save(status); }}
        >
          <div className="space-y-5">
            {/* Upload */}
            <label className="space-y-2 block">
              <span className="text-sm font-medium">Upload file</span>
              <span className="flex min-h-28 cursor-pointer items-center justify-center rounded-md border border-dashed bg-muted/30 px-4 py-6 text-center transition-colors hover:bg-muted/50">
                <span className="flex flex-col items-center gap-2 text-sm">
                  <Upload className="h-6 w-6 text-primary" />
                  <span className="font-medium">{uploading ? "Uploading..." : fileName || "Choose a file to upload"}</span>
                  <span className="text-xs text-muted-foreground">PDF, JPEG, PNG, Word, text, or other document types</span>
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md,.csv,.rtf,.ppt,.pptx,.xls,.xlsx,image/*,application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </span>
              {currentUrl ? (
                <span className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                  <FileText className="h-4 w-4" />
                  {fileName || currentUrl}
                </span>
              ) : null}
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Title</span>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Resources tab feature request" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Resource type</span>
                <Select value={resourceType} onValueChange={setResourceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium">File URL</span>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={fileUrl}
                    onChange={(e) => { setFileUrl(e.target.value); setUploaded(null); }}
                    placeholder="https://... (optional — use instead of uploading)"
                  />
                </div>
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium">Description / notes</span>
                <textarea
                  className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the resource. For feature requests, add as much detail as you like — this is read alongside the file."
                />
              </label>
            </div>

            {/* Visibility + sharing */}
            <div className="rounded-md border p-4">
              <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
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
                  <span className="text-sm font-medium">Visibility</span>
                  <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private (team only)</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
              </div>
              <p className="mt-4 text-sm font-medium">Share on</p>
              <p className="mt-1 text-xs text-muted-foreground">Choose where this resource can appear once published.</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {displayTargets.map((t) => (
                  <label key={t.key} className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-sm">
                    <span>{t.label}</span>
                    <Switch checked={targets.includes(t.key)} onCheckedChange={() => toggleTarget(t.key)} />
                  </label>
                ))}
              </div>

              {isSuperAdmin ? (
                <div className="mt-5 border-t pt-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">Share with & notify Super Admins</p>
                    <Badge variant="secondary">Super Admin</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Selected Super Admins are notified in the dashboard when this resource is saved.
                  </p>
                  {superAdmins.length ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {superAdmins.map((admin) => (
                        <label key={admin.id} className="flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-sm">
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{admin.name}</span>
                            <span className="block truncate text-xs text-muted-foreground">{admin.email}</span>
                          </span>
                          <Switch checked={shareWith.includes(admin.id)} onCheckedChange={() => toggleShareWith(admin.id)} />
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">No other active Super Admins to share with yet.</p>
                  )}
                </div>
              ) : null}
            </div>

            {message ? <p className="rounded-md bg-primary/10 p-3 text-sm text-primary">{message}</p> : null}
            {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-wrap gap-3">
              {editingAsset ? (
                <Button type="button" variant="ghost" disabled={saving} onClick={resetForm}>Cancel edit</Button>
              ) : null}
              <Button type="button" variant="outline" disabled={saving || uploading || !title || !currentUrl} onClick={() => save("draft")}>
                <Save className="h-4 w-4" />
                Save as draft
              </Button>
              <Button type="submit" disabled={saving || uploading || !title || !currentUrl}>
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : editingAsset ? "Update resource" : "Save resource"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Resource card preview</p>
            <ResourceCard
              asset={{
                title: title || "Resource title",
                description: description || "Description / notes",
                file_url: currentUrl,
                status,
                visibility,
                metadata: { resource_type: resourceType, original_filename: fileName, display_targets: targets },
              }}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Media Library (card / list / table) ─────────────────────────────────────

function MediaLibrary({
  active,
  assets,
  viewMode,
  onViewModeChange,
  onPlay,
  onEdit,
  isSuperAdmin = false,
}: {
  active: AssetType;
  assets: any[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPlay?: (asset: any) => void;
  onEdit?: (asset: any) => void;
  isSuperAdmin?: boolean;
}) {
  const typeLabel = typeLabelFor(active);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{typeLabel} library</CardTitle>
            <CardDescription>Each asset has a unique URL and an embed reference for dashboard or frontend use.</CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-md border bg-background p-1">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "card" ? "default" : "ghost"}
              className="h-8 px-2.5"
              onClick={() => onViewModeChange("card")}
              title="Card view"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Cards</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              className="h-8 px-2.5"
              onClick={() => onViewModeChange("list")}
              title="List view"
            >
              <LayoutList className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">List</span>
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              className="h-8 px-2.5"
              onClick={() => onViewModeChange("table")}
              title="Table view"
            >
              <Table className="h-4 w-4" />
              <span className="ml-1.5 hidden sm:inline">Table</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!assets.length ? (
          <p className="text-sm text-muted-foreground">
            No {typeLabel.toLowerCase()} files yet. Create one in the {typeLabel} Studio tab.
          </p>
        ) : viewMode === "card" ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assets.map((asset) =>
              active === "audio" ? (
                <AudioCard
                  key={asset.id}
                  asset={asset}
                  onPlay={() => onPlay?.(asset)}
                  onEdit={onEdit ? () => onEdit(asset) : undefined}
                />
              ) : active === "document" ? (
                <ResourceCard
                  key={asset.id}
                  asset={asset}
                  onEdit={onEdit ? () => onEdit(asset) : undefined}
                  isSuperAdmin={isSuperAdmin}
                />
              ) : (
                <GenericMediaCard key={asset.id} asset={asset} />
              ),
            )}
          </div>
        ) : viewMode === "list" ? (
          <div className="divide-y">
            {assets.map((asset) => (
              <AssetListRow
                key={asset.id}
                active={active}
                asset={asset}
                onPlay={onPlay ? () => onPlay(asset) : undefined}
                onEdit={onEdit ? () => onEdit(asset) : undefined}
              />
            ))}
          </div>
        ) : (
          <AssetTable active={active} assets={assets} onPlay={onPlay} onEdit={onEdit} />
        )}
      </CardContent>
    </Card>
  );
}

// ─── List row ─────────────────────────────────────────────────────────────────

function AssetListRow({
  active,
  asset,
  onPlay,
  onEdit,
}: {
  active: AssetType;
  asset: any;
  onPlay?: () => void;
  onEdit?: () => void;
}) {
  const thumbnail = asset.metadata?.thumbnail_url;
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {(() => { const Icon = typeIconFor(active); return <Icon className="h-5 w-5" />; })()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{asset.title}</p>
        <p className="truncate text-sm text-muted-foreground">{asset.description || asset.file_url || "No description."}</p>
      </div>
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <Badge variant="secondary">{asset.status}</Badge>
        <Badge variant="outline">{asset.visibility}</Badge>
      </div>
      <div className="flex shrink-0 gap-1">
        {onPlay ? (
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onPlay} disabled={!asset.file_url} title="Play">
            <Play className="h-4 w-4" />
          </Button>
        ) : null}
        {onEdit ? (
          <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit} title="Edit">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null}
        {asset.slug ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            title="Copy embed"
            onClick={() => navigator.clipboard?.writeText(`<iframe src="/media/${asset.slug}" title="${asset.title}"></iframe>`)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// ─── Table view ───────────────────────────────────────────────────────────────

function AssetTable({
  active,
  assets,
  onPlay,
  onEdit,
}: {
  active: AssetType;
  assets: any[];
  onPlay?: (asset: any) => void;
  onEdit?: (asset: any) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Title</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Status</th>
            <th className="pb-3 pr-4 font-medium text-muted-foreground">Visibility</th>
            {active === "audio" && <th className="pb-3 pr-4 font-medium text-muted-foreground">Scheduled</th>}
            <th className="pb-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {assets.map((asset) => (
            <tr key={asset.id} className="hover:bg-muted/30">
              <td className="py-3 pr-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded bg-muted">
                    {asset.metadata?.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={asset.metadata.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        {(() => { const Icon = typeIconFor(active); return <Icon className="h-4 w-4" />; })()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium">{asset.title}</p>
                    {asset.description ? <p className="truncate text-xs text-muted-foreground max-w-xs">{asset.description}</p> : null}
                  </div>
                </div>
              </td>
              <td className="py-3 pr-4"><Badge variant="secondary">{asset.status}</Badge></td>
              <td className="py-3 pr-4"><Badge variant="outline">{asset.visibility}</Badge></td>
              {active === "audio" && (
                <td className="py-3 pr-4 text-muted-foreground">
                  {asset.metadata?.publish_at ? formatDate(asset.metadata.publish_at) : "—"}
                </td>
              )}
              <td className="py-3 text-right">
                <div className="flex justify-end gap-1">
                  {onPlay ? (
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onPlay(asset)} disabled={!asset.file_url} title="Play">
                      <Play className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {onEdit ? (
                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(asset)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {asset.slug ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title="Copy embed"
                      onClick={() => navigator.clipboard?.writeText(`<iframe src="/media/${asset.slug}" title="${asset.title}"></iframe>`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Audio card ───────────────────────────────────────────────────────────────

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

// ─── Generic video/photo card ─────────────────────────────────────────────────

function GenericMediaCard({ asset }: { asset: any }) {
  return (
    <div className="grid gap-3 rounded-md border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-semibold">{asset.title}</p>
        <Badge variant="secondary">{asset.status}</Badge>
        <Badge variant="outline">{asset.visibility}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{asset.description || asset.file_url || asset.embed_url || "No description."}</p>
      {asset.slug ? <p className="rounded-md bg-muted p-2 font-mono text-xs">/media/{asset.slug}</p> : null}
      {asset.slug ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigator.clipboard?.writeText(`<iframe src="/media/${asset.slug}" title="${asset.title}"></iframe>`)}
        >
          <Copy className="h-4 w-4" />
          Copy embed
        </Button>
      ) : null}
    </div>
  );
}

// ─── Resource (document) card ─────────────────────────────────────────────────

function ResourceCard({ asset, onEdit, isSuperAdmin = false }: { asset: any; onEdit?: () => void; isSuperAdmin?: boolean }) {
  const resourceType = resourceTypes.find((r) => r.value === asset.metadata?.resource_type);
  const resourceTypeLabel = resourceType?.label ?? "resource";
  const targets = Array.isArray(asset.metadata?.display_targets) ? asset.metadata.display_targets : [];
  const sharedCount = Array.isArray(asset.metadata?.shared_with) ? asset.metadata.shared_with.length : 0;
  const fileLabel = asset.metadata?.original_filename || asset.file_url;
  const stewardContext = [
    `A team member submitted this resource in Media Studio for review.`,
    `Title: ${asset.title}`,
    `Type: ${resourceTypeLabel}`,
    asset.description ? `Notes: ${asset.description}` : null,
    asset.file_url ? `File: ${asset.file_url}` : null,
  ].filter(Boolean).join("\n");
  return (
    <div className="flex flex-col gap-3 rounded-md border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">{asset.title}</h3>
          {fileLabel ? <p className="truncate text-xs text-muted-foreground">{fileLabel}</p> : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {resourceType ? <Badge variant="secondary">{resourceType.label}</Badge> : null}
        <Badge variant="secondary">{asset.status || "draft"}</Badge>
        <Badge variant="outline">{asset.visibility || "private"}</Badge>
      </div>
      {asset.description ? (
        <p
          className="text-sm text-muted-foreground"
          style={{ display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}
        >
          {asset.description}
        </p>
      ) : null}
      {targets.length ? <p className="text-xs text-muted-foreground">Shared on: {targets.join(", ")}</p> : null}
      {sharedCount ? <p className="text-xs text-muted-foreground">Notified {sharedCount} Super Admin{sharedCount === 1 ? "" : "s"}</p> : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-1">
        {asset.file_url ? (
          <a
            href={asset.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Open file
          </a>
        ) : null}
        {onEdit ? (
          <Button type="button" size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        ) : null}
        {asset.file_url ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            title="Copy file URL"
            onClick={() => navigator.clipboard?.writeText(asset.file_url)}
          >
            <Copy className="h-4 w-4" />
            Copy link
          </Button>
        ) : null}
      </div>
      {isSuperAdmin && asset.id ? (
        <div className="flex flex-wrap gap-2 border-t pt-3">
          <SendToClaudeButton
            payload={{
              sourceType: "media_resource",
              sourceId: asset.id,
              title: asset.title,
              body: asset.description || null,
              fileUrl: asset.file_url || null,
              requestKind: asset.metadata?.resource_type || "resource",
            }}
          />
          <AskStewardButton
            subtitle="Media Studio resource"
            extraContext={stewardContext}
            suggestions={[
              "Summarize this resource and what it's asking for.",
              "If this is a feature request, outline how you'd implement it.",
              "Add this to the dev request queue and mark it in progress.",
            ]}
            emptyTitle="Triage this resource"
            emptyHint="I can read the attached resource details, summarize a feature request, and manage the dev request queue."
          />
        </div>
      ) : null}
    </div>
  );
}

// ─── Audio player sheet ───────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function uploadFile(file: File, intent: "audio" | "thumbnail" | "document", actionToken: string): Promise<UploadedFile> {
  if (!actionToken) throw new Error("Dashboard action token is missing. Refresh the page, sign in again, and try uploading.");
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
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function limitWords(value: string, max: number) {
  const words = value.trimStart().split(/\s+/).filter(Boolean);
  return words.length <= max ? value : words.slice(0, max).join(" ");
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
