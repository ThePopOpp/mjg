"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Trash2 } from "lucide-react";
import { useDashboardActionToken } from "@/components/layout/dashboard-action-token";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";

export function AvatarUploader({
  firstName,
  lastName,
  email,
  avatarUrl,
}: {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const actionToken = useDashboardActionToken();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/me/avatar", { method: "POST", headers: { "x-mjg-action-token": actionToken }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/me/avatar", { method: "DELETE", headers: { "x-mjg-action-token": actionToken } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to remove photo.");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <UserAvatar firstName={firstName} lastName={lastName} email={email} avatarUrl={avatarUrl} className="h-24 w-24 text-2xl" />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" /> {busy ? "Uploading…" : avatarUrl ? "Change photo" : "Upload photo"}
        </Button>
        {avatarUrl ? (
          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={remove} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">JPG or PNG, up to 8 MB. No photo shows your initials.</p>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
