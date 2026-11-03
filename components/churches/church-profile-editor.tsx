"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { useChurchApi } from "@/components/churches/church-ui";
import type { Church, ChurchPhoto } from "@/lib/churches/repository";

// Church Profile editor: details, contact, address, the admin's own position, logo and photos.
// Images upload first (POST /api/churches/<id>/media) and are saved with the profile.

const MAX_PHOTOS = 12;

type Form = {
  name: string;
  denomination: string;
  description: string;
  website: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  title: string;
};

export function ChurchProfileEditor({ church, title }: { church: Church; title: string | null }) {
  const api = useChurchApi();
  const token = useDashboardActionToken();
  const router = useRouter();
  const [form, setForm] = useState<Form>({
    name: church.name,
    denomination: church.denomination ?? "",
    description: church.description ?? "",
    website: church.website ?? "",
    email: church.email ?? "",
    phone: church.phone ?? "",
    addressLine1: church.addressLine1 ?? "",
    addressLine2: church.addressLine2 ?? "",
    city: church.city ?? "",
    state: church.state ?? "",
    postalCode: church.postalCode ?? "",
    title: title ?? "",
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(church.logoUrl);
  const [photos, setPhotos] = useState<ChurchPhoto[]>(church.photos);
  const [uploading, setUploading] = useState<"logo" | "photo" | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const logoInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function upload(file: File, kind: "logo" | "photo") {
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    const res = await fetch(`/api/churches/${church.id}/media`, { method: "POST", body, headers: token ? { "x-mjg-action-token": token } : {} });
    const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
    if (!res.ok || !data?.url) throw new Error(data?.error ?? "Upload failed.");
    return data.url;
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading("logo");
    setMessage(null);
    try {
      setLogoUrl(await upload(file, "logo"));
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setUploading(null);
    }
  }

  async function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
    e.target.value = "";
    if (!files.length) return;
    setUploading("photo");
    setMessage(null);
    try {
      for (const file of files) {
        const url = await upload(file, "photo");
        setPhotos((p) => [...p, { url, caption: null }]);
      }
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Upload failed." });
    } finally {
      setUploading(null);
    }
  }

  function move(i: number, by: number) {
    setPhotos((p) => {
      const next = [...p];
      const j = i + by;
      if (j < 0 || j >= next.length) return p;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api<{ church: Church }>(`/api/churches/${church.id}/profile`, "PATCH", { ...form, logoUrl, photos });
      setMessage({ kind: "ok", text: "Church profile saved." });
      if (res?.church?.slug && res.church.slug !== church.slug) router.refresh();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Couldn't save." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">About the church</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Church name" className="sm:col-span-2"><Input value={form.name} onChange={set("name")} maxLength={160} /></Field>
              <Field label="Denomination or network"><Input value={form.denomination} onChange={set("denomination")} placeholder="Optional" maxLength={120} /></Field>
              <Field label="Your position (title)"><Input value={form.title} onChange={set("title")} placeholder="e.g. Lead Pastor, Groups Director" maxLength={120} /></Field>
              <Field label="About" className="sm:col-span-2">
                <Textarea value={form.description} onChange={set("description")} rows={5} maxLength={4000} placeholder="A few sentences about your church and its groups." />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Website" className="sm:col-span-2"><Input value={form.website} onChange={set("website")} placeholder="yourchurch.org" inputMode="url" /></Field>
              <Field label="Email address"><Input value={form.email} onChange={set("email")} type="email" placeholder="hello@yourchurch.org" /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={set("phone")} type="tel" maxLength={40} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Address</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-6">
              <Field label="Street address" className="sm:col-span-6"><Input value={form.addressLine1} onChange={set("addressLine1")} maxLength={200} /></Field>
              <Field label="Suite, building (optional)" className="sm:col-span-6"><Input value={form.addressLine2} onChange={set("addressLine2")} maxLength={200} /></Field>
              <Field label="City" className="sm:col-span-3"><Input value={form.city} onChange={set("city")} maxLength={100} /></Field>
              <Field label="State" className="sm:col-span-1"><Input value={form.state} onChange={set("state")} maxLength={2} placeholder="AZ" className="uppercase" /></Field>
              <Field label="ZIP" className="sm:col-span-2"><Input value={form.postalCode} onChange={set("postalCode")} maxLength={20} inputMode="numeric" /></Field>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Logo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                {logoUrl ? <img src={logoUrl} alt="Church logo" className="h-full w-full object-contain p-3" /> : <span className="text-sm text-muted-foreground">No logo yet</span>}
              </div>
              <input ref={logoInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={onLogo} />
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => logoInput.current?.click()} disabled={!!uploading}>
                  {uploading === "logo" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
                  {logoUrl ? "Replace" : "Upload"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setLogoUrl(null)} disabled={!logoUrl || !!uploading}>
                  <Trash2 className="mr-1.5 h-4 w-4" />Remove
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Public page</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-pretty">Your church page shows this profile and every official group your approved facilitators list.</p>
              <a href={`/churches/${church.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-[#8a6532] hover:underline dark:text-[#e2ca9a]">
                View church page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Photos <span className="font-normal text-muted-foreground">({photos.length}/{MAX_PHOTOS})</span></CardTitle>
          <input ref={photoInput} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={onPhotos} />
          <Button type="button" variant="outline" size="sm" onClick={() => photoInput.current?.click()} disabled={!!uploading || photos.length >= MAX_PHOTOS}>
            {uploading === "photo" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-1.5 h-4 w-4" />}
            Add photos
          </Button>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add photos of your building, services or groups. The first photo leads your church page.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((p, i) => (
                <div key={p.url} className="overflow-hidden rounded-lg border bg-card">
                  <div className="aspect-[4/3] bg-muted"><img src={p.url} alt={p.caption ?? `Photo ${i + 1}`} className="h-full w-full object-cover" /></div>
                  <div className="space-y-2 p-3">
                    <Input
                      value={p.caption ?? ""}
                      onChange={(e) => setPhotos((all) => all.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)))}
                      placeholder="Caption (optional)"
                      maxLength={200}
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Move earlier" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Move later" onClick={() => move(i, 1)} disabled={i === photos.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" className="ml-auto h-8 w-8" aria-label="Remove photo" onClick={() => setPhotos((all) => all.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="sticky bottom-20 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur lg:bottom-4">
        <Button onClick={save} disabled={saving || !!uploading} className="min-w-40">
          {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
          Save church profile
        </Button>
        {message ? <p className={message.kind === "ok" ? "text-sm text-muted-foreground" : "text-sm text-destructive"}>{message.text}</p> : null}
      </div>
    </div>
  );
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
