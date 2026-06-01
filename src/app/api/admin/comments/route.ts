import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_WEIGHT } from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (ROLE_WEIGHT[user.role] < ROLE_WEIGHT.MODERATOR) return jsonError("Forbidden", 403);

  const comments = await getPrisma().comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: { select: { username: true, displayName: true } },
      dream: { select: { id: true, title: true } },
    },
  });

  return jsonOk({ comments });
}
