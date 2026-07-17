"use client";

import { useEffect, useState } from "react";
import { Download, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  detectInstallPlatform,
  INSTALL_GUIDES,
  SHARE_ICON_SVG,
  type InstallPlatform,
} from "@/lib/pwa/install-guide";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// "Install app". Uses the browser's native prompt where one exists (Chrome, Edge,
// Android). On iOS and macOS Safari there is no such prompt — Apple offers no
// programmatic install — so it opens a guide instead. See lib/pwa/install-guide.ts.
export function InstallAppButton({
  label = "Install app",
  responsiveLabel = true,
  variant = "outline",
  size = "sm",
  fullWidth = false,
  caption,
  className,
}: {
  label?: string;
  responsiveLabel?: boolean;
  variant?: "outline" | "default" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  fullWidth?: boolean;
  caption?: string;
  className?: string;
} = {}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("desktop");

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) { setInstalled(true); return; }

    setPlatform(detectInstallPlatform({ userAgent: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints }));

    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); setShowHelp(false); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  // Already running as an installed app — nothing to offer.
  if (installed) return null;

  const guide = INSTALL_GUIDES[platform];

  async function onClick() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    setShowHelp(true);
  }

  return (
    <>
      <div className={cn(fullWidth && "w-full")}>
        <Button onClick={onClick} variant={variant} size={size} className={cn("gap-1.5", fullWidth && "w-full", className)}>
          <Download className="h-4 w-4" />
          <span className={responsiveLabel ? "hidden sm:inline" : undefined}>{label}</span>
        </Button>
        {caption ? <p className="mt-2 text-center text-xs text-muted-foreground">{caption}</p> : null}
      </div>

      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{guide.title}</DialogTitle>
            <DialogDescription>
              It installs like a normal app — its own icon and window, and it works offline. No app store needed.
            </DialogDescription>
          </DialogHeader>

          {guide.blocked ? (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-800 dark:text-amber-300">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{guide.blocked}</span>
            </div>
          ) : null}

          <ol className="space-y-3">
            {guide.steps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-6">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">
                  {step}
                  {/* Show the Share glyph beside the step that names it — people scan
                      for the shape, not the word. */}
                  {i === 0 && /Share button/.test(step) ? (
                    <span
                      className="ml-1.5 inline-flex h-6 w-6 translate-y-1.5 items-center justify-center rounded-md border border-border bg-muted p-1 text-foreground"
                      dangerouslySetInnerHTML={{ __html: SHARE_ICON_SVG }}
                    />
                  ) : null}
                </span>
              </li>
            ))}
          </ol>

          {guide.note ? <p className="text-xs leading-5 text-muted-foreground">{guide.note}</p> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
