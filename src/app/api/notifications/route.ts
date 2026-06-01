import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const notifications = await getNotifications(user.id);
  return jsonOk({ notifications });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  await getPrisma().notification.updateMany({
    where: { recipientId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return jsonOk({ ok: true });
}
