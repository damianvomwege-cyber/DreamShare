import { NextRequest } from "next/server";

import { jsonError, jsonOk } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { getDreamFeed } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import { detectSpam, sanitizeText } from "@/lib/security";
import { normalizeTags } from "@/lib/utils";
import { dreamSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const dreams = await getDreamFeed({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    sort: (searchParams.get("sort") as "new" | "liked" | "trending") ?? "new",
    take: Number(searchParams.get("take") ?? 24),
  });

  return jsonOk({ dreams });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = dreamSchema.safeParse({
    title: sanitizeText(String(body?.title ?? ""), 140),
    description: sanitizeText(String(body?.description ?? ""), 6000),
    categoryId: String(body?.categoryId ?? ""),
    mood: String(body?.mood ?? "OTHER"),
    visibility: String(body?.visibility ?? "PUBLIC"),
    tags: Array.isArray(body?.tags) ? body.tags.join(",") : String(body?.tags ?? ""),
    imageUrl: String(body?.imageUrl ?? ""),
  });

  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid dream.");
  }

  const spam = detectSpam(`${parsed.data.title} ${parsed.data.description}`);
  if (spam.blocked) return jsonError(spam.reason ?? "Spam detected.", 422);

  const dream = await getPrisma().dream.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      categoryId: parsed.data.categoryId,
      mood: parsed.data.mood,
      visibility: parsed.data.visibility,
      tags: normalizeTags(parsed.data.tags),
      imageUrl: parsed.data.imageUrl || null,
      authorId: user.id,
    },
  });

  return jsonOk({ dream }, 201);
}
