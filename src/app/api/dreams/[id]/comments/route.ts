import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { detectSpam, sanitizeText } from "@/lib/security";
import { commentSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const comments = await getPrisma().comment.findMany({
    where: { dreamId: id, deletedAt: null },
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      replies: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return jsonOk({ comments });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse({
    dreamId: id,
    content: sanitizeText(String(body?.content ?? ""), 1000),
  });

  if (!parsed.success) return jsonError("Invalid comment.");
  const spam = detectSpam(parsed.data.content);
  if (spam.blocked) return jsonError(spam.reason ?? "Spam detected.", 422);

  const comment = await getPrisma().comment.create({
    data: {
      dreamId: id,
      authorId: user.id,
      content: parsed.data.content,
    },
  });

  await getPrisma().dream.update({
    where: { id },
    data: { commentCount: { increment: 1 } },
  });

  return jsonOk({ comment }, 201);
}
