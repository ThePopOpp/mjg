"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// A page can mount more than one of these — the Steward member shell renders a
// desktop header and a phone header, only one of which is visible at a time. So
// the current theme is read from the document rather than kept per-instance, and
// a change is broadcast so every mounted toggle re-reads it. Without that, the
// hidden instance keeps stale state and its next click toggles the wrong way.

const THEME_EVENT = "mjg:theme-change";

function readTheme(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredTheme;
    applyTheme(initialTheme);

    const sync = () => setThemeState(readTheme());
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);

  function applyTheme(nextTheme: "light" | "dark") {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
    setThemeState(nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  }

  return (
    <Button
      aria-label="Toggle light/dark mode"
      className="rounded-full"
      onClick={() => applyTheme(readTheme() === "dark" ? "light" : "dark")}
      size="icon"
      type="button"
      variant="outline"
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
