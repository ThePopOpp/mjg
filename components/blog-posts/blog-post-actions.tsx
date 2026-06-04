"use client";

import { useState } from "react";
import { Archive, EyeOff, MailPlus, Rocket, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BlogPostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string) {
    setLoading(action);
    setMessage(null);
    setError(null);

    const response = await fetch(`/api/admin/blog-posts/${postId}/actions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    setLoading(null);

    if (!response.ok) {
      setError(data.error ?? "Action failed.");
      return;
    }

    setMessage(action === "convert_to_email" ? "Email template created/updated." : "Post updated.");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => run("published")} disabled={Boolean(loading)}>
          <Rocket className="h-4 w-4" />
          Deploy
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("hidden")} disabled={Boolean(loading)}>
          <EyeOff className="h-4 w-4" />
          Hide
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("archived")} disabled={Boolean(loading)}>
          <Archive className="h-4 w-4" />
          Archive
        </Button>
        <Button size="sm" variant="outline" onClick={() => run("convert_to_email")} disabled={Boolean(loading)}>
          <MailPlus className="h-4 w-4" />
          Blog to email
        </Button>
        <Button size="sm" variant="destructive" onClick={() => run("deleted")} disabled={Boolean(loading)}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
