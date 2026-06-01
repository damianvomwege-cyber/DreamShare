import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_WEIGHT } from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (ROLE_WEIGHT[user.role] < ROLE_WEIGHT.MODERATOR) return jsonError("Forbidden", 403);

  const users = await getPrisma().user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return jsonOk({ users });
}
