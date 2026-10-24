"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

// The same contract as every other toggle in the app (app/layout.tsx boot
// script, components/ui/theme-toggle): data-theme + the .dark class on <html>,
// remembered in localStorage.theme, announced with mjg:theme-change so other
// toggles on the page stay in sync.

type Theme = "light" | "dark";

function current(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function MarketingThemeToggle({ full, className }: { full?: boolean; className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(current());
    const sync = () => setTheme(current());
    window.addEventListener("mjg:theme-change", sync);
    return () => window.removeEventListener("mjg:theme-change", sync);
  }, []);

  function apply(next: Theme) {
    document.documentElement.dataset.theme = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem("theme", next);
    } catch {
      /* storage blocked — the toggle still applies for this page view */
    }
    window.dispatchEvent(new CustomEvent("mjg:theme-change", { detail: next }));
    setTheme(next);
  }

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={() => apply(theme === "dark" ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 bg-muted text-foreground transition-colors hover:bg-muted/70",
        full ? "h-12 w-full rounded-lg text-sm font-medium" : "h-10 w-10 rounded-xl",
        className,
      )}
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      {full ? <span>{label}</span> : null}
    </button>
  );
}
