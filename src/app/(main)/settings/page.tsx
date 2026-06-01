import type { Metadata } from "next";

import {
  NotificationSettingsForm,
  PrivacySettingsForm,
  ProfileSettingsForm,
  SecuritySettingsCard,
} from "@/components/profiles/settings-forms";
import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const sessionUser = await requireUser();
  const user = await getPrisma().user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: {
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

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage profile, privacy, security, and notification preferences.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <ProfileSettingsForm user={user} />
        <PrivacySettingsForm user={user} />
        <SecuritySettingsCard />
        <NotificationSettingsForm user={user} />
      </div>
    </div>
  );
}
