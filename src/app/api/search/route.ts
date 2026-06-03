import { NextRequest } from "next/server";

import { jsonOk } from "@/lib/api";
import { getDreamFeed } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import { normalizeUsername } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const usernameQuery = normalizeUsername(q);
  const usernameTerms = Array.from(
    new Set([q, usernameQuery].filter((term) => term.length > 0)),
  );
  const [dreams, users, categories] = await Promise.all([
    getDreamFeed({ q, take: 12 }),
    q
      ? getPrisma().user.findMany({
          where: {
            status: "ACTIVE",
            OR: [
              ...usernameTerms.map((term) => ({
                username: { contains: term, mode: "insensitive" as const },
              })),
              { displayName: { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
          },
          take: 8,
        })
      : Promise.resolve([]),
    q
      ? getPrisma().category.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 8,
        })
      : Promise.resolve([]),
  ]);

  return jsonOk({ dreams, users, categories });
}
