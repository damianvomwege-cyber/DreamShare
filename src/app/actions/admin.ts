"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { canManageRole, requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { writeAdminLog } from "@/lib/security";
import { roleChangeSchema } from "@/lib/validators";

async function auditMeta() {
  const headerStore = await headers();
  return {
    ipAddress:
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headerStore.get("x-real-ip") ||
      "unknown",
    userAgent: headerStore.get("user-agent") ?? undefined,
  };
}

export async function banUserAction(userId: string) {
  const actor = await requireRole("ADMIN");
  const target = await getPrisma().user.findUniqueOrThrow({ where: { id: userId } });

  if (target.role === "OWNER" || !canManageRole(actor.role, target.role)) {
    return { ok: false, message: "You cannot ban this account." };
  }

  await getPrisma().user.update({
    where: { id: userId },
    data: { status: "BANNED" },
  });

  await writeAdminLog({
    actorId: actor.id,
    action: "USER_BAN",
    targetType: "USER",
    targetId: userId,
    ...(await auditMeta()),
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function suspendUserAction(userId: string) {
  const actor = await requireRole("MODERATOR");
  const target = await getPrisma().user.findUniqueOrThrow({ where: { id: userId } });

  if (target.role === "OWNER" || !canManageRole(actor.role, target.role)) {
    return { ok: false, message: "You cannot suspend this account." };
  }

  await getPrisma().user.update({
    where: { id: userId },
    data: { status: "SUSPENDED" },
  });

  await writeAdminLog({
    actorId: actor.id,
    action: "USER_SUSPEND",
    targetType: "USER",
    targetId: userId,
    ...(await auditMeta()),
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserAction(userId: string) {
  const actor = await requireRole("ADMIN");
  const target = await getPrisma().user.findUniqueOrThrow({ where: { id: userId } });

  if (target.role === "OWNER" || !canManageRole(actor.role, target.role)) {
    return { ok: false, message: "You cannot delete this account." };
  }

  await getPrisma().user.delete({ where: { id: userId } });
  await writeAdminLog({
    actorId: actor.id,
    action: "USER_DELETE",
    targetType: "USER",
    targetId: userId,
    ...(await auditMeta()),
  });

  revalidatePath("/admin/users");
  return { ok: true };
}

export async function changeRoleAction(formData: FormData) {
  const actor = await requireRole("ADMIN");
  const parsed = roleChangeSchema.safeParse({
    userId: String(formData.get("userId") ?? ""),
    role: String(formData.get("role") ?? ""),
  });

  if (!parsed.success) return;

  const target = await getPrisma().user.findUniqueOrThrow({
    where: { id: parsed.data.userId },
  });

  if (target.role === "OWNER" || parsed.data.role === "OWNER") {
    if (actor.role !== "OWNER") return;
  }

  if (!canManageRole(actor.role, target.role)) {
    return;
  }

  await getPrisma().user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });

  await writeAdminLog({
    actorId: actor.id,
    action: "ROLE_CHANGE",
    targetType: "USER",
    targetId: parsed.data.userId,
    metadata: { from: target.role, to: parsed.data.role },
    ...(await auditMeta()),
  });

  revalidatePath("/admin/users");
}

export async function adminDeleteDreamAction(dreamId: string) {
  const actor = await requireRole("MODERATOR");
  await getPrisma().dream.update({
    where: { id: dreamId },
    data: { status: "DELETED" },
  });
  await writeAdminLog({
    actorId: actor.id,
    action: "DREAM_DELETE",
    targetType: "DREAM",
    targetId: dreamId,
    ...(await auditMeta()),
  });
  revalidatePath("/admin/dreams");
  return { ok: true };
}

export async function adminDeleteCommentAction(commentId: string) {
  const actor = await requireRole("MODERATOR");
  await getPrisma().comment.update({
    where: { id: commentId },
    data: { deletedAt: new Date() },
  });
  await writeAdminLog({
    actorId: actor.id,
    action: "COMMENT_DELETE",
    targetType: "COMMENT",
    targetId: commentId,
    ...(await auditMeta()),
  });
  revalidatePath("/admin/comments");
  return { ok: true };
}
