import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_WEIGHT } from "@/lib/constants";
import { getAdminStats } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (ROLE_WEIGHT[user.role] < ROLE_WEIGHT.MODERATOR) {
    return jsonError("Forbidden", 403);
  }

  return jsonOk({ stats: await getAdminStats() });
}
