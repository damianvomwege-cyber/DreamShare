"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { profilePath } from "@/lib/utils";

export async function toggleFollowAction(username: string) {
  const user = await requireUser();
  const target = await getPrisma().user.findUnique({
    where: { username },
    select: { id: true, username: true, displayName: true },
  });

  if (!target || target.id === user.id) {
    return { ok: false, message: "Cannot follow this user." };
  }

  const existing = await getPrisma().follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: target.id,
      },
    },
  });

  if (existing) {
    await getPrisma().follow.delete({ where: { id: existing.id } });
  } else {
    await getPrisma().$transaction([
      getPrisma().follow.create({
        data: {
          followerId: user.id,
          followingId: target.id,
        },
      }),
      getPrisma().notification.create({
        data: {
          recipientId: target.id,
          actorId: user.id,
          type: "NEW_FOLLOWER",
          message: `${user.displayName} followed you.`,
        },
      }),
    ]);
  }

  revalidatePath(profilePath(username));
  return { ok: true, following: !existing };
}

export async function markNotificationsReadAction() {
  const user = await requireUser();
  await getPrisma().notification.updateMany({
    where: { recipientId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}
