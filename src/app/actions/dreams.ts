"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

import type { Prisma, ReactionType } from "@/generated/prisma/client";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { ROLE_WEIGHT } from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";
import { createToken, detectSpam, sanitizeText } from "@/lib/security";
import { normalizeTags, profilePath } from "@/lib/utils";
import {
  dreamSchema,
  dreamVisibilitySchema,
  reactionSchema,
  reportSchema,
} from "@/lib/validators";

export type DreamActionState = {
  ok: boolean;
  message: string;
};

const initialError = "Something went wrong. Try again.";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function dreamWriteErrorMessage() {
  return process.env.NODE_ENV === "development"
    ? "Dreams cannot be posted while the local database is unavailable. Start Postgres and refresh the categories."
    : "Dream could not be posted. Try again.";
}

function revalidateDreamSurfaces(dreamId: string, username?: string) {
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/trending");
  revalidatePath("/bookmarks");
  revalidatePath(`/dream/${dreamId}`);
  if (username) revalidatePath(profilePath(username));
}

export async function createDreamAction(
  _state: DreamActionState,
  formData: FormData,
): Promise<DreamActionState> {
  const user = await requireUser();
  const parsed = dreamSchema.safeParse({
    title: sanitizeText(text(formData, "title"), 140),
    description: sanitizeText(text(formData, "description"), 6000),
    categoryId: text(formData, "categoryId"),
    mood: text(formData, "mood"),
    visibility: text(formData, "visibility"),
    tags: text(formData, "tags"),
    imageUrl: text(formData, "imageUrl"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? initialError };
  }

  const spam = detectSpam(`${parsed.data.title} ${parsed.data.description}`);
  if (spam.blocked) {
    return { ok: false, message: spam.reason ?? "This dream looks like spam." };
  }

  if (parsed.data.categoryId.startsWith("local-")) {
    return { ok: false, message: dreamWriteErrorMessage() };
  }

  try {
    await getPrisma().dream.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        categoryId: parsed.data.categoryId,
        mood: parsed.data.mood,
        visibility: parsed.data.visibility,
        tags: normalizeTags(parsed.data.tags),
        imageUrl: parsed.data.imageUrl || null,
        authorId: user.id,
      },
    });
  } catch {
    return { ok: false, message: dreamWriteErrorMessage() };
  }

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(profilePath(user.username));

  return { ok: true, message: "Dream posted." };
}

export async function toggleReactionAction(dreamId: string, type: ReactionType) {
  const user = await requireUser();
  const parsed = reactionSchema.safeParse({ dreamId, type });
  if (!parsed.success) return { ok: false };

  const prisma = getPrisma();
  const existing = await prisma.reaction.findUnique({
    where: {
      dreamId_userId_type: {
        dreamId,
        userId: user.id,
        type,
      },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.reaction.delete({ where: { id: existing.id } }),
      prisma.dream.update({
        where: { id: dreamId },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
  } else {
    const dream = await prisma.dream.findUniqueOrThrow({
      where: { id: dreamId },
      select: { authorId: true, title: true },
    });

    const transaction: Prisma.PrismaPromise<unknown>[] = [
      prisma.reaction.create({
        data: {
          dreamId,
          userId: user.id,
          type,
        },
      }),
      prisma.dream.update({
        where: { id: dreamId },
        data: { likeCount: { increment: 1 } },
      }),
    ];

    if (dream.authorId !== user.id) {
      transaction.push(
        prisma.notification.create({
          data: {
            recipientId: dream.authorId,
            actorId: user.id,
            dreamId,
            type: "NEW_REACTION",
            message: `${user.displayName} reacted ${type.toLowerCase()} to your dream.`,
          },
        }),
      );
    }

    await prisma.$transaction(transaction);
  }

  revalidatePath("/");
  revalidatePath(`/dream/${dreamId}`);

  return { ok: true };
}

export async function toggleBookmarkAction(dreamId: string) {
  const user = await requireUser();
  const prisma = getPrisma();
  const existing = await prisma.bookmark.findUnique({
    where: {
      dreamId_userId: {
        dreamId,
        userId: user.id,
      },
    },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
  } else {
    await prisma.bookmark.create({
      data: {
        dreamId,
        userId: user.id,
      },
    });
  }

  revalidatePath("/bookmarks");
  revalidatePath(`/dream/${dreamId}`);
  return { ok: true, saved: !existing };
}

export async function incrementShareAction(dreamId: string) {
  const prisma = getPrisma();
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  let anonymousId = cookieStore.get("dreamshare_share_id")?.value;

  if (!user && !anonymousId) {
    anonymousId = createToken(16);
    cookieStore.set("dreamshare_share_id", anonymousId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const existingShare = await prisma.share.findFirst({
    where: {
      dreamId,
      ...(user ? { userId: user.id } : { anonymousId }),
    },
  });

  if (existingShare) {
    return { ok: true, counted: false };
  }

  try {
    await prisma.$transaction([
      prisma.share.create({
        data: {
          dreamId,
          userId: user?.id ?? null,
          anonymousId: user ? null : anonymousId!,
        },
      }),
      prisma.dream.update({
        where: { id: dreamId },
        data: { shareCount: { increment: 1 } },
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/trending");
    revalidatePath(`/dream/${dreamId}`);
    return { ok: true, counted: true };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { ok: true, counted: false };
    }

    throw error;
  }
}

export async function deleteDreamAction(dreamId: string) {
  const user = await requireUser();
  const dream = await getPrisma().dream.findUnique({
    where: { id: dreamId },
    select: {
      authorId: true,
      status: true,
      author: { select: { username: true } },
    },
  });

  if (!dream) return { ok: false, message: "Dream not found." };

  const canDelete =
    dream.authorId === user.id || ROLE_WEIGHT[user.role] >= ROLE_WEIGHT.MODERATOR;

  if (!canDelete) return { ok: false, message: "Not authorized." };

  if (dream.status !== "DELETED") {
    await getPrisma().dream.update({
      where: { id: dreamId },
      data: { status: "DELETED" },
    });
  }

  revalidateDreamSurfaces(dreamId, dream.author.username);
  return { ok: true, message: "Dream deleted." };
}

export async function updateDreamVisibilityAction(
  dreamId: string,
  visibility: unknown,
) {
  const user = await requireUser();
  const parsed = dreamVisibilitySchema.safeParse({ dreamId, visibility });

  if (!parsed.success) {
    return { ok: false, message: "Invalid visibility." };
  }

  const dream = await getPrisma().dream.findUnique({
    where: { id: parsed.data.dreamId },
    select: {
      authorId: true,
      status: true,
      author: { select: { username: true } },
    },
  });

  if (!dream || dream.status === "DELETED") {
    return { ok: false, message: "Dream not found." };
  }

  const canUpdate =
    dream.authorId === user.id || ROLE_WEIGHT[user.role] >= ROLE_WEIGHT.MODERATOR;

  if (!canUpdate) {
    return { ok: false, message: "Not authorized." };
  }

  await getPrisma().dream.update({
    where: { id: parsed.data.dreamId },
    data: { visibility: parsed.data.visibility },
  });

  revalidateDreamSurfaces(parsed.data.dreamId, dream.author.username);
  return {
    ok: true,
    message: "Visibility updated.",
    visibility: parsed.data.visibility,
  };
}

export async function createReportAction(
  _state: DreamActionState,
  formData: FormData,
): Promise<DreamActionState> {
  const user = await requireUser();
  const parsed = reportSchema.safeParse({
    targetType: text(formData, "targetType"),
    targetId: text(formData, "targetId"),
    reason: sanitizeText(text(formData, "reason"), 500),
    details: sanitizeText(text(formData, "details"), 1500),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? initialError };
  }

  await getPrisma().report.create({
    data: {
      reporterId: user.id,
      targetType: parsed.data.targetType,
      reason: parsed.data.reason,
      details: parsed.data.details,
      dreamId: parsed.data.targetType === "DREAM" ? parsed.data.targetId : null,
      commentId:
        parsed.data.targetType === "COMMENT" ? parsed.data.targetId : null,
      replyId: parsed.data.targetType === "REPLY" ? parsed.data.targetId : null,
      userId: parsed.data.targetType === "USER" ? parsed.data.targetId : null,
    },
  });

  return { ok: true, message: "Report submitted for moderation." };
}
