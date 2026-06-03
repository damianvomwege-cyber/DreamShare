import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { notFound, redirect } from "next/navigation";

import type { Role } from "@/generated/prisma/client";
import { ROLE_WEIGHT } from "@/lib/constants";
import { getPrisma } from "@/lib/prisma";
import {
  assertLoginNotLocked,
  checkRateLimit,
  clearLoginAttempts,
  recordFailedLogin,
  verifyPassword,
  writeAdminLog,
} from "@/lib/security";
import { normalizeUsername } from "@/lib/utils";
import { loginSchema } from "@/lib/validators";

function requestHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = headers?.[key];
  return Array.isArray(value) ? value[0] : value;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email or username",
      credentials: {
        identifier: { label: "Email or username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const identifier = parsed.data.identifier.trim();
        const normalizedIdentifier = identifier.toLowerCase();
        const usernameIdentifier = normalizeUsername(identifier);
        const ipAddress =
          requestHeader(req?.headers, "x-forwarded-for")?.split(",")[0] ||
          requestHeader(req?.headers, "x-real-ip") ||
          "unknown";

        const limiter = checkRateLimit(`login:${normalizedIdentifier}:${ipAddress}`, 10);
        if (limiter.limited) {
          throw new Error("Too many login attempts. Try again shortly.");
        }

        await assertLoginNotLocked(normalizedIdentifier);

        const user = await getPrisma().user.findFirst({
          where: {
            OR: [{ email: normalizedIdentifier }, { username: usernameIdentifier }],
          },
        });

        if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
          await recordFailedLogin(normalizedIdentifier, ipAddress);
          return null;
        }

        if (user.status !== "ACTIVE") {
          throw new Error("This account is not active.");
        }

        await Promise.all([
          clearLoginAttempts(normalizedIdentifier),
          getPrisma().user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          }),
          ROLE_WEIGHT[user.role] >= ROLE_WEIGHT.MODERATOR
            ? writeAdminLog({
                actorId: user.id,
                action: "LOGIN",
                ipAddress,
                userAgent: requestHeader(req?.headers, "user-agent"),
              })
            : Promise.resolve(),
        ]);

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.displayName = user.displayName;
        token.role = user.role;
        token.status = user.status;
        token.picture = user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const latestUser = token.id
          ? await getPrisma().user
              .findUnique({
                where: { id: token.id },
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  role: true,
                  status: true,
                },
              })
              .catch(() => null)
          : null;

        session.user.id = token.id;
        session.user.username = latestUser?.username ?? token.username;
        session.user.displayName = latestUser?.displayName ?? token.displayName;
        session.user.image = latestUser?.avatarUrl ?? token.picture ?? null;
        session.user.role = latestUser?.role ?? token.role;
        session.user.status = latestUser?.status ?? token.status;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      if (token?.id && ROLE_WEIGHT[token.role] >= ROLE_WEIGHT.MODERATOR) {
        await writeAdminLog({
          actorId: token.id,
          action: "LOGOUT",
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(minimumRole: Role = "MODERATOR") {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/admin`);
  if (ROLE_WEIGHT[user.role] < ROLE_WEIGHT[minimumRole]) notFound();
  return user;
}

export function canManageRole(actorRole: Role, targetRole: Role) {
  if (targetRole === "OWNER") return actorRole === "OWNER";
  return ROLE_WEIGHT[actorRole] > ROLE_WEIGHT[targetRole];
}
