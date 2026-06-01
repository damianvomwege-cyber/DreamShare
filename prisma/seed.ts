import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { DREAM_CATEGORIES } from "../src/lib/constants";
import { hashPassword } from "../src/lib/security";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is required.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  for (const category of DREAM_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        color: category.color,
        icon: category.icon,
      },
      create: category,
    });
  }

  const adminCount = await prisma.user.count({
    where: { role: { in: ["ADMIN", "OWNER"] } },
  });

  const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME;
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
  const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const defaultDisplayName =
    process.env.DEFAULT_ADMIN_DISPLAY_NAME ?? "DreamShare Owner";

  if (adminCount === 0 && defaultUsername && defaultPassword && defaultEmail) {
    const owner = await prisma.user.create({
      data: {
        email: defaultEmail.toLowerCase(),
        username: defaultUsername,
        displayName: defaultDisplayName,
        passwordHash: await hashPassword(defaultPassword),
        emailVerified: new Date(),
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    await prisma.adminLog.create({
      data: {
        actorId: owner.id,
        action: "SETUP_COMPLETE",
        targetType: "USER",
        targetId: owner.id,
        metadata: {
          source: "seed",
        },
      },
    });
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
