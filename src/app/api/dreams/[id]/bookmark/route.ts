import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const existing = await getPrisma().bookmark.findUnique({
    where: { dreamId_userId: { dreamId: id, userId: user.id } },
  });

  if (existing) {
    await getPrisma().bookmark.delete({ where: { id: existing.id } });
    return jsonOk({ saved: false });
  }

  await getPrisma().bookmark.create({
    data: {
      dreamId: id,
      userId: user.id,
    },
  });

  return jsonOk({ saved: true }, 201);
}
