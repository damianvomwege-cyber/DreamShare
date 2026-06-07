import type { MetadataRoute } from "next";

import { APP_NAME, MOOD_LABELS } from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";
import { absoluteUrl, normalizeUsername, profilePath } from "@/lib/utils";

const SITEMAP_DREAM_LIMIT = 2000;
const SITEMAP_PROFILE_LIMIT = 1000;

export function truncateForSeo(value: string, maxLength = 155) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;

  return `${clean.slice(0, maxLength - 1).trimEnd()}...`;
}

export function defaultSeoDescription() {
  return "DreamShare is a social dream journal for posting dreams, reacting to dream stories, following dreamers, and exploring trending sleep worlds.";
}

export function defaultOgImage() {
  return "/opengraph-image";
}

export async function getPublicDreamSeo(id: string) {
  try {
    return await getPrisma().dream.findFirst({
      where: {
        id,
        status: "PUBLISHED",
        visibility: "PUBLIC",
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        tags: true,
        mood: true,
        likeCount: true,
        commentCount: true,
        shareCount: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    console.warn("[dreamshare:seo-dream] database unavailable.", error);
    return null;
  }
}

export async function getPublicProfileSeo(username: string) {
  const normalizedUsername = normalizeUsername(username);
  if (!normalizedUsername) return null;

  try {
    const profile = await getPrisma().user.findUnique({
      where: { username: normalizedUsername },
      select: {
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        privateProfile: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            dreams: {
              where: {
                status: "PUBLISHED",
                visibility: "PUBLIC",
              },
            },
            followers: true,
          },
        },
      },
    });

    if (!profile || profile.status !== "ACTIVE" || profile.privateProfile) {
      return null;
    }

    return profile;
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;
    console.warn("[dreamshare:seo-profile] database unavailable.", error);
    return null;
  }
}

function staticSitemapEntries(now: Date): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/explore"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/trending"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
  ];

  return entries;
}

export async function getDreamShareSitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries = staticSitemapEntries(now);

  try {
    const prisma = getPrisma();
    const [dreams, profiles] = await Promise.all([
      prisma.dream.findMany({
        where: {
          status: "PUBLISHED",
          visibility: "PUBLIC",
        },
        orderBy: { updatedAt: "desc" },
        take: SITEMAP_DREAM_LIMIT,
        select: {
          id: true,
          updatedAt: true,
        },
      }),
      prisma.user.findMany({
        where: {
          status: "ACTIVE",
          privateProfile: false,
        },
        orderBy: { updatedAt: "desc" },
        take: SITEMAP_PROFILE_LIMIT,
        select: {
          username: true,
          updatedAt: true,
        },
      }),
    ]);

    entries.push(
      ...dreams.map((dream) => ({
        url: absoluteUrl(`/dream/${dream.id}`),
        lastModified: dream.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...profiles.map((profile) => ({
        url: absoluteUrl(profilePath(profile.username)),
        lastModified: profile.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );
  } catch (error) {
    console.warn("[dreamshare:sitemap] database unavailable; using static sitemap.", error);
  }

  return entries;
}

export function dreamSeoKeywords(input: {
  tags: string[];
  category: { name: string };
  mood: keyof typeof MOOD_LABELS;
}) {
  return Array.from(
    new Set([
      ...input.tags,
      input.category.name,
      MOOD_LABELS[input.mood],
      "dream story",
      "dream journal",
      APP_NAME,
    ]),
  );
}
