import { z } from "zod";

import { DreamMood, DreamVisibility, ReactionType, Role } from "@/generated/prisma/client";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters.")
  .max(24)
  .regex(
    /^[a-zA-Z0-9_ ]+$/,
    "Use letters, numbers, spaces, and underscores only.",
  )
  .refine(
    (username) => (username.match(/ /g)?.length ?? 0) <= 2,
    "Use at most 2 spaces.",
  );

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[a-z]/, "Include a lowercase letter.")
  .regex(/[0-9]/, "Include a number.");

export const registerSchema = z.object({
  email: z.email().max(190),
  username: usernameSchema,
  displayName: z.string().min(2).max(60),
  password: passwordSchema,
});

export const loginSchema = z.object({
  identifier: z.string().min(3).max(190),
  password: z.string().min(1).max(200),
});

export const forgotPasswordSchema = z.object({
  email: z.email().max(190),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password: passwordSchema,
});

export const setupOwnerSchema = z.object({
  email: z.email().max(190),
  username: usernameSchema,
  displayName: z.string().min(2).max(60),
  password: passwordSchema,
});

export const dreamSchema = z.object({
  title: z.string().min(4).max(140),
  description: z.string().min(20).max(6000),
  categoryId: z.string().min(1),
  mood: z.enum(DreamMood),
  visibility: z.enum(DreamVisibility),
  tags: z.string().max(240).optional().default(""),
  imageUrl: z.url().optional().or(z.literal("")),
});

export const dreamVisibilitySchema = z.object({
  dreamId: z.string().min(1),
  visibility: z.enum(DreamVisibility),
});

export const commentSchema = z.object({
  dreamId: z.string().min(1),
  content: z.string().min(2).max(1000),
});

export const replySchema = z.object({
  commentId: z.string().min(1),
  parentReplyId: z.string().optional(),
  content: z.string().min(2).max(1000),
});

export const reactionSchema = z.object({
  dreamId: z.string().min(1),
  type: z.enum(ReactionType),
});

export const profileSettingsSchema = z.object({
  displayName: z.string().min(2).max(60),
  bio: z.string().max(280).optional().or(z.literal("")),
  avatarUrl: z.url().optional().or(z.literal("")),
  bannerUrl: z.url().optional().or(z.literal("")),
});

export const privacySettingsSchema = z.object({
  privateProfile: z.boolean(),
  showSavedDreams: z.boolean(),
});

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
});

export const reportSchema = z.object({
  targetType: z.enum(["DREAM", "COMMENT", "REPLY", "USER"]),
  targetId: z.string().min(1),
  reason: z.string().min(4).max(500),
  details: z.string().max(1500).optional().or(z.literal("")),
});

export const roleChangeSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(Role),
});
