import { cookies } from "next/headers";

import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createToken } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  const dreamExists = await prisma.dream.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!dreamExists) {
    return jsonError("Dream not found.", 404);
  }

  const existingShare = await prisma.share.findFirst({
    where: {
      dreamId: id,
      ...(user ? { userId: user.id } : { anonymousId }),
    },
  });

  if (existingShare) {
    return jsonOk({ ok: true, counted: false });
  }

  try {
    await prisma.$transaction([
      prisma.share.create({
        data: {
          dreamId: id,
          userId: user?.id ?? null,
          anonymousId: user ? null : anonymousId!,
        },
      }),
      prisma.dream.update({
        where: { id },
        data: { shareCount: { increment: 1 } },
      }),
    ]);

    return jsonOk({ ok: true, counted: true }, 201);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return jsonOk({ ok: true, counted: false });
    }

    throw error;
  }
}
