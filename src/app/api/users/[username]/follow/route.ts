import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { username: usernameParam } = await params;
  const username = normalizeUsername(decodeURIComponent(usernameParam));
  const target = await getPrisma().user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!target || target.id === user.id) {
    return jsonError("Cannot follow this user.", 400);
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
    return jsonOk({ following: false });
  }

  await getPrisma().follow.create({
    data: {
      followerId: user.id,
      followingId: target.id,
    },
  });

  return jsonOk({ following: true }, 201);
}
