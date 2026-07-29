"use client";

import { useRef, useState } from "react";
import { Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function fileName(url: string) {
  try { return decodeURIComponent(url.split("/").pop() || url).slice(0, 44); } catch { return url.slice(0, 44); }
}

/** Upload-first media field. The URL input shows only when `showUrl` is true (a single
 * toggle lifted to the parent controls all fields). Value in/out is a URL. */
export function MediaUploadField({
  label,
  url,
  setUrl,
  accept,
  upload,
  setBusy,
  setError,
  showUrl,
}: {
  label: string;
  url: string;
  setUrl: (v: string) => void;
  accept: string;
  upload: (f: File) => Promise<string>;
  setBusy: (b: boolean) => void;
  setError: (e: string | null) => void;
  showUrl: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const isImage = /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(url);

  async function onPick(f: File) {
    setUploading(true);
    setBusy(true);
    setError(null);
    try { setUrl(await upload(f)); } catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); } finally { setUploading(false); setBusy(false); }
  }

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
      <Button type="button" variant="outline" className="w-full" onClick={() => ref.current?.click()} disabled={uploading}>
        <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
      </Button>
      {url ? (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="min-w-0 flex-1 truncate">{fileName(url)}</span>
          <button type="button" onClick={() => setUrl("")} aria-label="Clear" className="hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No file</p>
      )}
      {isImage && url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-16 rounded border object-cover" />
      ) : null}
      {showUrl ? <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /> : null}
    </div>
  );
}
