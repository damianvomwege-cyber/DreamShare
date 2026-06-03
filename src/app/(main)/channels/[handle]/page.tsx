import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { DreamCard } from "@/components/dreams/dream-card";
import { ProfileCard } from "@/components/profiles/profile-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import { displayUsername, normalizeUsername, profilePath } from "@/lib/utils";

export const dynamic = "force-dynamic";

function decodeRouteParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function usernameFromHandle(handle: string) {
  return normalizeUsername(decodeRouteParam(handle));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const username = usernameFromHandle(handle);

  return { title: username ? displayUsername(username) : "Channel" };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle: handleParam } = await params;
  const handle = decodeRouteParam(handleParam).trim();
  const username = normalizeUsername(handle);

  if (!username) notFound();
  if (!handle.startsWith("@")) redirect(profilePath(username));

  const user = await getCurrentUser();
  const profile = await getProfile(username, user?.id);

  if (!profile || profile.status === "BANNED") notFound();

  const following = user
    ? Boolean(
        await getPrisma().follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: profile.id,
            },
          },
        }),
      )
    : false;

  const canViewDreams =
    !profile.privateProfile || profile.id === user?.id || following;

  return (
    <div className="space-y-6">
      <ProfileCard
        profile={profile}
        following={following}
        currentUserId={user?.id}
      />

      {canViewDreams ? (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold tracking-normal">Dreams</h2>
          {profile.dreams.length === 0 ? (
            <EmptyState
              icon={Lock}
              title="No public dreams"
              description="This profile has not posted public dreams yet."
            />
          ) : (
            <div className="space-y-4">
              {profile.dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <EmptyState
          icon={Lock}
          title="Private profile"
          description="Follow this dreamer to request access to their shared dreams."
        />
      )}
    </div>
  );
}
