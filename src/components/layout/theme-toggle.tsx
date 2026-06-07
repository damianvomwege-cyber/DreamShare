"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  setThemePreference,
  useThemePreference,
} from "@/components/layout/theme-provider";

export function ThemeToggle() {
  const theme = useThemePreference();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      sound="toggle"
      aria-label="Toggle theme"
      title="Toggle theme"
      suppressHydrationWarning
      onClick={() => setThemePreference(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun className="size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
