import { getPrisma } from "@/lib/prisma";
import { hashPassword, writeAdminLog } from "@/lib/security";

export async function hasAdminAccount() {
  const count = await getPrisma().user.count({
    where: { role: { in: ["ADMIN", "OWNER"] } },
  });

  return count > 0;
}

export async function ensureDefaultOwnerFromEnv() {
  if (await hasAdminAccount()) return null;

  const username = process.env.DEFAULT_ADMIN_USERNAME;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const displayName =
    process.env.DEFAULT_ADMIN_DISPLAY_NAME ?? "DreamShare Owner";

  if (!username || !password || !email) return null;

  const owner = await getPrisma().user.create({
    data: {
      username,
      email: email.toLowerCase(),
      displayName,
      passwordHash: await hashPassword(password),
      emailVerified: new Date(),
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  await writeAdminLog({
    actorId: owner.id,
    action: "SETUP_COMPLETE",
    targetType: "USER",
    targetId: owner.id,
    metadata: { source: "env-first-launch" },
  });

  return owner;
}
