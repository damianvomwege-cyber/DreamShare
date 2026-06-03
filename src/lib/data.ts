import { subDays } from "date-fns";

import type { Category, Prisma, Role } from "@/generated/prisma/client";
import { DREAM_CATEGORIES, ROLE_WEIGHT } from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/utils";

export const dreamCardInclude = {
  author: {
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
    },
  },
  category: true,
  reactions: {
    select: {
      type: true,
      userId: true,
    },
  },
  bookmarks: {
    select: {
      userId: true,
    },
  },
  _count: {
    select: {
      comments: true,
      reactions: true,
      bookmarks: true,
    },
  },
} satisfies Prisma.DreamInclude;

export type DreamCardData = Prisma.DreamGetPayload<{
  include: typeof dreamCardInclude;
}>;

const isDevelopment = process.env.NODE_ENV === "development";

const fallbackCategories: Category[] = DREAM_CATEGORIES.map((category, index) => ({
  id: `local-${category.slug}`,
  name: category.name,
  slug: category.slug,
  description: category.description,
  color: category.color,
  icon: category.icon,
  createdAt: new Date(0 + index),
  updatedAt: new Date(0 + index),
}));

function handleDevelopmentFallback(error: unknown, label: string) {
  if (!isDevelopment) throw error;

  console.warn(
    `[dreamshare:${label}] database unavailable; rendering local preview data.`,
    error,
  );
}

export async function getCategories() {
  try {
    const prisma = getPrisma();
    const count = await prisma.category.count();

    if (count === 0) {
      await prisma.$transaction(
        DREAM_CATEGORIES.map((category) =>
          prisma.category.upsert({
            where: { slug: category.slug },
            update: category,
            create: category,
          }),
        ),
      );
    }

    return getPrisma().category.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    handleDevelopmentFallback(error, "categories");
    return fallbackCategories;
  }
}

export async function getDreamFeed(input: {
  q?: string;
  category?: string;
  tag?: string;
  sort?: "new" | "liked" | "trending";
  take?: number;
}) {
  const where: Prisma.DreamWhereInput = {
    status: "PUBLISHED",
    visibility: "PUBLIC",
  };

  if (input.q) {
    const usernameQuery = normalizeUsername(input.q);
    const usernameFilters: Prisma.DreamWhereInput[] = [
      { author: { username: { contains: input.q, mode: "insensitive" } } },
    ];

    if (usernameQuery && usernameQuery !== input.q) {
      usernameFilters.push({
        author: { username: { contains: usernameQuery, mode: "insensitive" } },
      });
    }

    where.OR = [
      { title: { contains: input.q, mode: "insensitive" } },
      { description: { contains: input.q, mode: "insensitive" } },
      { tags: { has: input.q.toLowerCase() } },
      ...usernameFilters,
    ];
  }

  if (input.category) {
    where.category = { slug: input.category };
  }

  if (input.tag) {
    where.tags = { has: input.tag.toLowerCase() };
  }

  const orderBy: Prisma.DreamOrderByWithRelationInput[] =
    input.sort === "liked"
      ? [{ likeCount: "desc" }, { createdAt: "desc" }]
      : input.sort === "trending"
        ? [
            { likeCount: "desc" },
            { commentCount: "desc" },
            { shareCount: "desc" },
            { createdAt: "desc" },
          ]
        : [{ createdAt: "desc" }];

  try {
    return await getPrisma().dream.findMany({
      where,
      include: dreamCardInclude,
      orderBy,
      take: input.take ?? 24,
    });
  } catch (error) {
    handleDevelopmentFallback(error, "dream-feed");
    return [];
  }
}

export async function getTrendingDreams(take = 6) {
  const since = subDays(new Date(), 7);

  try {
    return await getPrisma().dream.findMany({
      where: {
        status: "PUBLISHED",
        visibility: "PUBLIC",
        createdAt: { gte: since },
      },
      include: dreamCardInclude,
      orderBy: [
        { likeCount: "desc" },
        { commentCount: "desc" },
        { shareCount: "desc" },
        { viewCount: "desc" },
      ],
      take,
    });
  } catch (error) {
    handleDevelopmentFallback(error, "trending-dreams");
    return [];
  }
}

type DreamViewer = {
  id: string;
  role: Role;
};

async function canViewDream(
  dream: { authorId: string; visibility: "PUBLIC" | "FOLLOWERS" | "PRIVATE" },
  viewer?: DreamViewer | null,
) {
  if (dream.visibility === "PUBLIC") return true;
  if (!viewer) return false;
  if (dream.authorId === viewer.id) return true;
  if (ROLE_WEIGHT[viewer.role] >= ROLE_WEIGHT.MODERATOR) return true;
  if (dream.visibility === "PRIVATE") return false;

  const follow = await getPrisma().follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: viewer.id,
        followingId: dream.authorId,
      },
    },
    select: { id: true },
  });

  return Boolean(follow);
}

export async function getDreamById(id: string, viewer?: DreamViewer | null) {
  try {
    const dream = await getPrisma().dream.findFirst({
      where: { id, status: "PUBLISHED" },
      include: {
        ...dreamCardInclude,
        comments: {
          where: { deletedAt: null },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                role: true,
              },
            },
            replies: {
              where: { deletedAt: null },
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatarUrl: true,
                    role: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!dream) return null;
    if (!(await canViewDream(dream, viewer))) return null;

    return dream;
  } catch (error) {
    handleDevelopmentFallback(error, "dream-detail");
    return null;
  }
}

export async function getProfile(username: string, viewerId?: string) {
  try {
    const prisma = getPrisma();
    const profile = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        role: true,
        status: true,
        privateProfile: true,
        showSavedDreams: true,
        createdAt: true,
        _count: {
          select: {
            dreams: true,
            followers: true,
            following: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!profile) return null;

    const isOwner = viewerId === profile.id;
    const followsProfile =
      viewerId && !isOwner
        ? Boolean(
            await prisma.follow.findUnique({
              where: {
                followerId_followingId: {
                  followerId: viewerId,
                  followingId: profile.id,
                },
              },
              select: { id: true },
            }),
          )
        : false;

    const dreams = await prisma.dream.findMany({
      where: {
        authorId: profile.id,
        status: "PUBLISHED",
        ...(isOwner
          ? {}
          : followsProfile
            ? { visibility: { in: ["PUBLIC", "FOLLOWERS"] } }
            : { visibility: "PUBLIC" }),
      },
      include: dreamCardInclude,
      orderBy: { createdAt: "desc" },
      take: 12,
    });

    return { ...profile, dreams };
  } catch (error) {
    handleDevelopmentFallback(error, "profile");
    return null;
  }
}

export async function getSavedDreams(userId: string) {
  try {
    return await getPrisma().bookmark.findMany({
      where: {
        userId,
        dream: {
          status: "PUBLISHED",
          OR: [
            { visibility: "PUBLIC" },
            { authorId: userId },
            {
              visibility: "FOLLOWERS",
              author: {
                followers: {
                  some: { followerId: userId },
                },
              },
            },
          ],
        },
      },
      include: {
        dream: {
          include: dreamCardInclude,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    handleDevelopmentFallback(error, "saved-dreams");
    return [];
  }
}

export async function getNotifications(userId: string) {
  try {
    return await getPrisma().notification.findMany({
      where: { recipientId: userId },
      include: {
        actor: {
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        dream: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    handleDevelopmentFallback(error, "notifications");
    return [];
  }
}

export async function getAdminStats() {
  const prisma = getPrisma();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalDreams,
    totalComments,
    activeUsers,
    newUsersToday,
    dreamsToday,
    openReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.dream.count({ where: { status: { not: "DELETED" } } }),
    prisma.comment.count({ where: { deletedAt: null } }),
    prisma.user.count({
      where: {
        status: "ACTIVE",
        lastLoginAt: { gte: subDays(new Date(), 30) },
      },
    }),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.dream.count({ where: { createdAt: { gte: today } } }),
    prisma.report.count({ where: { status: { in: ["OPEN", "REVIEWING"] } } }),
  ]);

  return {
    totalUsers,
    totalDreams,
    totalComments,
    activeUsers,
    newUsersToday,
    dreamsToday,
    openReports,
  };
}

export async function getAdminAnalytics() {
  const prisma = getPrisma();
  const since = subDays(new Date(), 13);
  const [users, dreams, comments] = await Promise.all([
    prisma.user.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.dream.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.comment.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const rows = Array.from({ length: 14 }, (_, index) => {
    const date = subDays(new Date(), 13 - index);
    const key = date.toISOString().slice(0, 10);
    return { date: key, users: 0, dreams: 0, comments: 0 };
  });

  const byDate = new Map(rows.map((row) => [row.date, row]));
  for (const user of users) byDate.get(user.createdAt.toISOString().slice(0, 10))!.users += 1;
  for (const dream of dreams) byDate.get(dream.createdAt.toISOString().slice(0, 10))!.dreams += 1;
  for (const comment of comments) byDate.get(comment.createdAt.toISOString().slice(0, 10))!.comments += 1;

  return rows;
}
