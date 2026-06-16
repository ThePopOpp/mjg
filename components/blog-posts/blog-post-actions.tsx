"use client";

import { useEffect, useRef, useState } from "react";
import { Archive, Eye, EyeOff, MailPlus, Pencil, Rocket, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  } catch {
    return {};
  }
}

export function BlogPostImageActions({ slug, title }: { slug: string; title: string }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shareOpen) return;
    function handleClick(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [shareOpen]);

  function shareUrl() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/resources/${slug}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  function shareOn(platform: string) {
    const url = encodeURIComponent(shareUrl());
    const text = encodeURIComponent(title);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      sms: `sms:?body=${text}%20${url}`,
      email: `mailto:?subject=${text}&body=${text}%0A%0A${url}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer");
  }

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2" ref={shareRef}>
      <Button size="sm" variant="secondary" asChild className="bg-background/90 shadow-sm backdrop-blur hover:bg-background">
        <a href={`/resources/${slug}`} target="_blank" rel="noopener noreferrer">
          <Eye className="h-4 w-4" />
          View
        </a>
      </Button>
      <div className="relative">
        <Button size="sm" variant="secondary" onClick={() => setShareOpen((o) => !o)} className="w-full bg-background/90 shadow-sm backdrop-blur hover:bg-background">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        {shareOpen && (
          <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-md border bg-card p-1 shadow-md">
            <button className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={copyLink}>
              {copied ? "Copied!" : "Copy link"}
            </button>
            <button className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => shareOn("twitter")}>Share on X</button>
            <button className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => shareOn("facebook")}>Share on Facebook</button>
            <button className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => shareOn("linkedin")}>Share on LinkedIn</button>
            <button className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => shareOn("sms")}>Send via SMS</button>
            <button className="w-full rounded px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => shareOn("email")}>Share via Email</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function BlogPostActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string) {
    setLoading(action);
    setMessage(null);
    setError(null);

    const authHeaders = await getAuthHeaders();
    const response = await fetch(`/api/admin/blog-posts/${postId}/actions`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", ...authHeaders },
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
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/blog-posts/${postId}`}>
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </Button>
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
          Email Blog
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
