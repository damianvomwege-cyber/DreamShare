import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  NotificationSettingsForm,
  PrivacySettingsForm,
  ProfileSettingsForm,
  SecuritySettingsCard,
} from "@/components/profiles/settings-forms";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
};

type SettingsUser = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  privateProfile: boolean;
  showSavedDreams: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
};

async function getSettingsUser(userId: string) {
  try {
    return await getPrisma().user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        privateProfile: true,
        showSavedDreams: true,
        emailNotifications: true,
        pushNotifications: true,
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;

    console.warn(
      "[dreamshare:settings] database unavailable; rendering session preview.",
      error,
    );

    return null;
  }
}

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const storedUser = await getSettingsUser(sessionUser.id);

  if (!storedUser && process.env.NODE_ENV !== "development") notFound();

  const user: SettingsUser = storedUser ?? {
    username: sessionUser.username,
    displayName: sessionUser.displayName,
    bio: null,
    avatarUrl: sessionUser.image ?? null,
    bannerUrl: null,
    privateProfile: false,
    showSavedDreams: false,
    emailNotifications: true,
    pushNotifications: true,
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage profile, privacy, security, and notification preferences.
        </p>
      </section>

      {!storedUser ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          Local database is not available, so this page is showing session data.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileSettingsForm appUrl={absoluteUrl("/")} user={user} />
        <PrivacySettingsForm user={user} />
        <SecuritySettingsCard />
        <NotificationSettingsForm user={user} />
      </div>
    </div>
  );
}
