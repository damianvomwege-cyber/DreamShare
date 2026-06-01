"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { detectSpam, sanitizeText } from "@/lib/security";
import { commentSchema, replySchema } from "@/lib/validators";

export type CommentActionState = {
  ok: boolean;
  message: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function addCommentAction(
  _state: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const user = await requireUser();
  const parsed = commentSchema.safeParse({
    dreamId: value(formData, "dreamId"),
    content: sanitizeText(value(formData, "content"), 1000),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid comment." };
  }

  const spam = detectSpam(parsed.data.content);
  if (spam.blocked) {
    return { ok: false, message: spam.reason ?? "This comment looks like spam." };
  }

  const dream = await getPrisma().dream.findUniqueOrThrow({
    where: { id: parsed.data.dreamId },
    select: { authorId: true, title: true },
  });

  const comment = await getPrisma().comment.create({
    data: {
      dreamId: parsed.data.dreamId,
      authorId: user.id,
      content: parsed.data.content,
    },
  });

  await getPrisma().dream.update({
    where: { id: parsed.data.dreamId },
    data: { commentCount: { increment: 1 } },
  });

  if (dream.authorId !== user.id) {
    await getPrisma().notification.create({
      data: {
        recipientId: dream.authorId,
        actorId: user.id,
        dreamId: parsed.data.dreamId,
        commentId: comment.id,
        type: "NEW_COMMENT",
        message: `${user.displayName} commented on your dream.`,
      },
    });
  }

  revalidatePath(`/dream/${parsed.data.dreamId}`);
  return { ok: true, message: "Comment added." };
}

export async function addReplyAction(
  _state: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const user = await requireUser();
  const parsed = replySchema.safeParse({
    commentId: value(formData, "commentId"),
    parentReplyId: value(formData, "parentReplyId") || undefined,
    content: sanitizeText(value(formData, "content"), 1000),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid reply." };
  }

  const spam = detectSpam(parsed.data.content);
  if (spam.blocked) {
    return { ok: false, message: spam.reason ?? "This reply looks like spam." };
  }

  const comment = await getPrisma().comment.findUniqueOrThrow({
    where: { id: parsed.data.commentId },
    select: { authorId: true, dreamId: true },
  });

  const reply = await getPrisma().reply.create({
    data: {
      commentId: parsed.data.commentId,
      parentReplyId: parsed.data.parentReplyId,
      authorId: user.id,
      content: parsed.data.content,
    },
  });

  await getPrisma().dream.update({
    where: { id: comment.dreamId },
    data: { commentCount: { increment: 1 } },
  });

  if (comment.authorId !== user.id) {
    await getPrisma().notification.create({
      data: {
        recipientId: comment.authorId,
        actorId: user.id,
        dreamId: comment.dreamId,
        commentId: parsed.data.commentId,
        replyId: reply.id,
        type: "NEW_REPLY",
        message: `${user.displayName} replied to your comment.`,
      },
    });
  }

  revalidatePath(`/dream/${comment.dreamId}`);
  return { ok: true, message: "Reply added." };
}

export async function deleteCommentAction(commentId: string) {
  const user = await requireUser();
  const comment = await getPrisma().comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, dreamId: true },
  });

  if (!comment) return { ok: false, message: "Comment not found." };
  if (comment.authorId !== user.id && user.role === "USER") {
    return { ok: false, message: "Not authorized." };
  }

  await getPrisma().comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });

  revalidatePath(`/dream/${comment.dreamId}`);
  return { ok: true, message: "Comment deleted." };
}
