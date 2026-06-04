"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredTheme;
    setTheme(initialTheme);
  }, []);

  function setTheme(nextTheme: "light" | "dark") {
    document.documentElement.dataset.theme = nextTheme;
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("theme", nextTheme);
    setThemeState(nextTheme);
  }

  return (
    <Button
      aria-label="Toggle light/dark mode"
      className="rounded-full"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      size="icon"
      type="button"
      variant="outline"
    >
      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
