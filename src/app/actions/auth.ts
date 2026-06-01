"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPrisma } from "@/lib/prisma";
import {
  createToken,
  hashPassword,
  hashToken,
  sanitizeText,
  writeAdminLog,
} from "@/lib/security";
import {
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  setupOwnerSchema,
} from "@/lib/validators";

export type ActionState = {
  ok: boolean;
  message: string;
  devToken?: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function registerAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    email: value(formData, "email").toLowerCase(),
    username: value(formData, "username"),
    displayName: sanitizeText(value(formData, "displayName"), 60),
    password: value(formData, "password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const prisma = getPrisma();
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: parsed.data.email },
        { username: parsed.data.username },
      ],
    },
  });

  if (existing) {
    return { ok: false, message: "Email or username is already in use." };
  }

  await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      passwordHash: await hashPassword(parsed.data.password),
      emailVerified: new Date(),
    },
  });

  revalidatePath("/");

  return {
    ok: true,
    message: "Account created. You can sign in now.",
  };
}

export async function setupOwnerAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = setupOwnerSchema.safeParse({
    email: value(formData, "email").toLowerCase(),
    username: value(formData, "username"),
    displayName: sanitizeText(value(formData, "displayName"), 60),
    password: value(formData, "password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid form." };
  }

  const prisma = getPrisma();
  const existingAdmin = await prisma.user.count({
    where: { role: { in: ["ADMIN", "OWNER"] } },
  });

  if (existingAdmin > 0) {
    return { ok: false, message: "Setup is already complete." };
  }

  const owner = await prisma.user.create({
    data: {
      email: parsed.data.email,
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      passwordHash: await hashPassword(parsed.data.password),
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
  });

  redirect("/login?setup=complete&callbackUrl=/admin");
}

export async function forgotPasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: value(formData, "email").toLowerCase(),
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const prisma = getPrisma();
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    return {
      ok: true,
      message: "If that account exists, a reset link will be sent.",
    };
  }

  const token = createToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      email: user.email,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + 60 * 60_000),
    },
  });

  return {
    ok: true,
    message: "If that account exists, a reset link will be sent.",
    devToken: process.env.NODE_ENV === "production" ? undefined : token,
  };
}

export async function resetPasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: value(formData, "token"),
    password: value(formData, "password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid reset request." };
  }

  const prisma = getPrisma();
  const tokenHash = hashToken(parsed.data.token);
  const reset = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return { ok: false, message: "This reset link is invalid or expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, message: "Password updated. You can sign in now." };
}

export async function verifyEmailAction(token: string) {
  const prisma = getPrisma();
  const verification = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!verification || verification.expiresAt < new Date()) {
    return { ok: false, message: "Verification link is invalid or expired." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.emailVerificationToken.delete({
      where: { id: verification.id },
    }),
  ]);

  return { ok: true, message: "Email verified. You can sign in." };
}
