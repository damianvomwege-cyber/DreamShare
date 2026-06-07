"use client";

import { useEffect, useSyncExternalStore } from "react";

type ThemePreference = "light" | "dark";

const THEME_KEY = "dreamshare-theme";
const THEME_EVENT = "dreamshare-theme-change";
const THEME_BACKGROUNDS: Record<ThemePreference, string> = {
  dark: "#05070d",
  light: "#f3f6fb",
};

function systemTheme(): ThemePreference {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function storedTheme(): ThemePreference {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(THEME_KEY);
  return stored === "dark" || stored === "light" ? stored : systemTheme();
}

function applyTheme(theme: ThemePreference) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.backgroundColor = THEME_BACKGROUNDS[theme];
  root.style.colorScheme = theme;
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const notify = () => {
    applyTheme(storedTheme());
    callback();
  };

  window.addEventListener("storage", notify);
  window.addEventListener(THEME_EVENT, notify);
  media.addEventListener("change", notify);

  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(THEME_EVENT, notify);
    media.removeEventListener("change", notify);
  };
}

export function ThemeController() {
  const theme = useThemePreference();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return null;
}

export function useThemePreference() {
  return useSyncExternalStore(
    subscribe,
    storedTheme,
    (): ThemePreference => "light",
  );
}

export function setThemePreference(theme: ThemePreference) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_KEY, theme);
  document.cookie = `${THEME_KEY}=${theme}; Max-Age=31536000; Path=/; SameSite=Lax`;
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}
