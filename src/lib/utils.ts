import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function timeAgo(date: Date | string) {
  return `${formatDistanceToNowStrict(new Date(date), { addSuffix: true })}`;
}

export function profilePath(username: string) {
  return `/profile/${encodeURIComponent(username)}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeTags(tags: string | string[]) {
  const values = Array.isArray(tags) ? tags : tags.split(",");

  return Array.from(
    new Set(
      values
        .map((tag) => tag.trim().toLowerCase().replace(/^#/, ""))
        .filter((tag) => tag.length > 1)
        .slice(0, 8),
    ),
  );
}

export function absoluteUrl(path = "/") {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    "http://localhost:3000";

  const normalizedBase = baseUrl.startsWith("http")
    ? baseUrl
    : `https://${baseUrl}`;

  return new URL(path, normalizedBase).toString();
}
