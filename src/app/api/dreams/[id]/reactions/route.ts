import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { reactionSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = reactionSchema.safeParse({
    dreamId: id,
    type: String(body?.type ?? ""),
  });

  if (!parsed.success) return jsonError("Invalid reaction.");

  const existing = await getPrisma().reaction.findUnique({
    where: {
      dreamId_userId_type: {
        dreamId: id,
        userId: user.id,
        type: parsed.data.type,
      },
    },
  });

  if (existing) {
    await getPrisma().$transaction([
      getPrisma().reaction.delete({ where: { id: existing.id } }),
      getPrisma().dream.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      }),
    ]);
    return jsonOk({ reacted: false });
  }

  const [reaction] = await getPrisma().$transaction([
    getPrisma().reaction.create({
      data: {
        dreamId: id,
        userId: user.id,
        type: parsed.data.type,
      },
    }),
    getPrisma().dream.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    }),
  ]);

  return jsonOk({ reacted: true, reaction }, 201);
}
