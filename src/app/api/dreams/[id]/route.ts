import { revalidatePath } from "next/cache";

import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_WEIGHT } from "@/lib/constants";
import { getDreamById } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import { profilePath } from "@/lib/utils";
import { dreamVisibilitySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  const dream = await getDreamById(id, user);
  if (!dream) return jsonError("Dream not found.", 404);
  return jsonOk({ dream });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const prisma = getPrisma();
  const dream = await prisma.dream.findUnique({
    where: { id },
    select: {
      authorId: true,
      author: { select: { username: true } },
    },
  });

  if (!dream) return jsonError("Dream not found.", 404);
  if (dream.authorId !== user.id && ROLE_WEIGHT[user.role] < ROLE_WEIGHT.MODERATOR) {
    return jsonError("Forbidden", 403);
  }

  await prisma.dream.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/trending");
  revalidatePath(`/dream/${id}`);
  revalidatePath(profilePath(dream.author.username));

  return jsonOk({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = dreamVisibilitySchema.safeParse({
    dreamId: id,
    visibility: body?.visibility,
  });

  if (!parsed.success) return jsonError("Invalid visibility.", 400);

  const dream = await getPrisma().dream.findUnique({
    where: { id },
    select: {
      authorId: true,
      status: true,
      author: { select: { username: true } },
    },
  });

  if (!dream || dream.status === "DELETED") return jsonError("Dream not found.", 404);
  if (dream.authorId !== user.id && ROLE_WEIGHT[user.role] < ROLE_WEIGHT.MODERATOR) {
    return jsonError("Forbidden", 403);
  }

  const updatedDream = await getPrisma().dream.update({
    where: { id },
    data: { visibility: parsed.data.visibility },
    select: { id: true, visibility: true },
  });

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/trending");
  revalidatePath(`/dream/${id}`);
  revalidatePath(profilePath(dream.author.username));

  return jsonOk({ ok: true, dream: updatedDream });
}
