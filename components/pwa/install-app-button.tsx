"use client";

import { useEffect, useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// A clear "Install app" affordance. Uses the native install prompt when the
// browser offers one; otherwise shows step-by-step instructions per platform.
export function InstallAppButton({
  label = "Install app",
  responsiveLabel = true,
  variant = "outline",
  size = "sm",
  className,
}: {
  label?: string;
  responsiveLabel?: boolean;
  variant?: "outline" | "default" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
} = {}) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) { setInstalled(true); return; }

    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setPlatform("ios");
    else if (/Android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    const onBIP = (e: Event) => { e.preventDefault(); setDeferred(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setDeferred(null); setShowHelp(false); };
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!showHelp) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setShowHelp(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showHelp]);

  if (installed) return null;

  async function onClick() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    setShowHelp((s) => !s);
  }

  const steps =
    platform === "ios"
      ? ["Tap the Share button in Safari's toolbar.", "Scroll down and tap “Add to Home Screen.”", "Tap “Add” — the MJG app icon appears on your home screen."]
      : platform === "android"
      ? ["Tap the ⋮ menu in Chrome (top right).", "Tap “Install app” (or “Add to Home screen”).", "Confirm — the MJG app icon appears on your home screen."]
      : ["Look for the install icon in the address bar (a monitor/⊕ icon on the right).", "Or open the browser ⋮ menu → “Install Michael J. Gauthier…”.", "Confirm — the app opens in its own window with the MJG icon."];

  return (
    <div className="relative" ref={ref}>
      <Button onClick={onClick} variant={variant} size={size} className={cn("gap-1.5", className)}>
        <Download className="h-4 w-4" />
        <span className={responsiveLabel ? "hidden sm:inline" : undefined}>{label}</span>
      </Button>

      {showHelp && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Install the MJG app</p>
            <button onClick={() => setShowHelp(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
          </div>
          <ol className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm leading-6 text-muted-foreground">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-muted-foreground">It installs like a normal app — icon, own window, and offline support. No app store needed.</p>
        </div>
      )}
    </div>
  );
}
