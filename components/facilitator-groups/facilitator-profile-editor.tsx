"use client";

import { useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { groupApi } from "./api";

export type FacilitatorProfileView = {
  slug: string;
  displayName: string;
  bio: string | null;
  photoUrl: string | null;
  churchOrg: string | null;
  city: string | null;
  state: string | null;
  isPublic: boolean;
};

export function FacilitatorProfileEditor({
  initial, fallbackName, actionToken, onSaved, ownerId,
}: {
  ownerId?: string | null;
  initial: FacilitatorProfileView | null;
  fallbackName: string;
  actionToken: string | null;
  onSaved: (p: FacilitatorProfileView) => void;
}) {
  const [f, setF] = useState({
    displayName: initial?.displayName ?? fallbackName,
    bio: initial?.bio ?? "",
    photoUrl: initial?.photoUrl ?? "",
    churchOrg: initial?.churchOrg ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    isPublic: initial?.isPublic ?? true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      const { profile } = await groupApi<{ profile: FacilitatorProfileView }>("/api/facilitator/profile", "POST", { profile: f, profileId: ownerId ?? undefined }, actionToken);
      onSaved(profile);
      setMsg({ ok: true, text: "Saved." });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground">
        This is what people see when they click your name on a group listing. Your email and phone are never shown — people reach you through MJG messages.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label>Name shown publicly</Label><Input value={f.displayName} onChange={(e) => setF({ ...f, displayName: e.target.value })} maxLength={80} /></div>
        <div className="space-y-1.5"><Label>Church or organization</Label><Input value={f.churchOrg} onChange={(e) => setF({ ...f, churchOrg: e.target.value })} /></div>
      </div>
      <div className="space-y-1.5">
        <Label>About you</Label>
        <Textarea rows={5} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="A few sentences: who you are, why you lead, what your group is like." maxLength={2000} />
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <div className="space-y-1.5"><Label>City</Label><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
        <div className="space-y-1.5"><Label>State</Label><Input value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} maxLength={2} /></div>
      </div>
      <div className="space-y-1.5">
        <Label>Photo URL</Label>
        <Input value={f.photoUrl} onChange={(e) => setF({ ...f, photoUrl: e.target.value })} placeholder="https://… (optional — your profile photo is used otherwise)" />
      </div>
      <label className="flex items-center gap-3">
        <Switch checked={f.isPublic} onCheckedChange={(v) => setF({ ...f, isPublic: v })} />
        <span className="text-sm text-foreground">Show my profile page publicly</span>
      </label>
      {msg ? <p className={`text-sm ${msg.ok ? "text-primary" : "text-destructive"}`}>{msg.text}</p> : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={busy || !f.displayName.trim()}><Save className="mr-2 h-4 w-4" /> {busy ? "Saving…" : "Save profile"}</Button>
        {initial?.slug && f.isPublic ? (
          <a href={`/facilitators/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View my public profile <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
