"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/security";
import { profilePath } from "@/lib/utils";
import {
  notificationSettingsSchema,
  privacySettingsSchema,
  profileSettingsSchema,
} from "@/lib/validators";

export type SettingsActionState = {
  ok: boolean;
  message: string;
};

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function updateProfileSettingsAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireUser();
  const parsed = profileSettingsSchema.safeParse({
    displayName: sanitizeText(value(formData, "displayName"), 60),
    bio: sanitizeText(value(formData, "bio"), 280),
    avatarUrl: value(formData, "avatarUrl"),
    bannerUrl: value(formData, "bannerUrl"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid profile." };
  }

  await getPrisma().user.update({
    where: { id: user.id },
    data: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || null,
      avatarUrl: parsed.data.avatarUrl || null,
      bannerUrl: parsed.data.bannerUrl || null,
    },
  });

  revalidatePath(profilePath(user.username));
  return { ok: true, message: "Profile updated." };
}

export async function updatePrivacySettingsAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireUser();
  const parsed = privacySettingsSchema.safeParse({
    privateProfile: formData.get("privateProfile") === "on",
    showSavedDreams: formData.get("showSavedDreams") === "on",
  });

  if (!parsed.success) return { ok: false, message: "Invalid privacy settings." };

  await getPrisma().user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  revalidatePath(profilePath(user.username));
  return { ok: true, message: "Privacy settings updated." };
}

export async function updateNotificationSettingsAction(
  _state: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const user = await requireUser();
  const parsed = notificationSettingsSchema.safeParse({
    emailNotifications: formData.get("emailNotifications") === "on",
    pushNotifications: formData.get("pushNotifications") === "on",
  });

  if (!parsed.success) {
    return { ok: false, message: "Invalid notification settings." };
  }

  await getPrisma().user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  return { ok: true, message: "Notification settings updated." };
}
