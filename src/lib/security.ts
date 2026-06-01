import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

import type { AdminAction, Prisma } from "@/generated/prisma/client";
import { BANNED_KEYWORDS } from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";

const RATE_LIMIT_WINDOW_MS = 60_000;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function sanitizeText(value: string, maxLength = 2000) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function detectSpam(value: string) {
  const normalized = value.toLowerCase();
  const linkCount = (normalized.match(/https?:\/\//g) ?? []).length;
  const repeatedCharacters = /(.)\1{12,}/.test(normalized);
  const bannedKeyword = BANNED_KEYWORDS.find((keyword) =>
    normalized.includes(keyword),
  );

  return {
    blocked: Boolean(bannedKeyword) || linkCount > 4 || repeatedCharacters,
    reason: bannedKeyword
      ? `Blocked keyword: ${bannedKeyword}`
      : linkCount > 4
        ? "Too many links"
        : repeatedCharacters
          ? "Repeated characters"
          : null,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function checkRateLimit(key: string, limit = 60) {
  const now = Date.now();
  const current = rateBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, remaining: limit - 1 };
  }

  current.count += 1;

  return {
    limited: current.count > limit,
    remaining: Math.max(0, limit - current.count),
  };
}

export function getIpFromRequest(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function recordFailedLogin(identifier: string, ipAddress?: string) {
  const prisma = getPrisma();
  const normalizedIdentifier = identifier.toLowerCase();
  const existing = await prisma.loginAttempt.findUnique({
    where: { identifier: normalizedIdentifier },
  });
  const count = (existing?.count ?? 0) + 1;
  const lockedUntil =
    count >= 5 ? new Date(Date.now() + 15 * 60_000) : existing?.lockedUntil;

  await prisma.loginAttempt.upsert({
    where: { identifier: normalizedIdentifier },
    create: {
      identifier: normalizedIdentifier,
      count,
      lockedUntil,
      ipAddress,
      lastAttemptAt: new Date(),
    },
    update: {
      count,
      lockedUntil,
      ipAddress,
      lastAttemptAt: new Date(),
    },
  });

  return { count, lockedUntil };
}

export async function clearLoginAttempts(identifier: string) {
  await getPrisma().loginAttempt.deleteMany({
    where: { identifier: identifier.toLowerCase() },
  });
}

export async function assertLoginNotLocked(identifier: string) {
  const attempt = await getPrisma().loginAttempt.findUnique({
    where: { identifier: identifier.toLowerCase() },
  });

  if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
    throw new Error("Too many failed attempts. Try again later.");
  }
}

export async function writeAdminLog(input: {
  actorId?: string | null;
  action: AdminAction;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return getPrisma().adminLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      metadata: input.metadata,
    },
  });
}
