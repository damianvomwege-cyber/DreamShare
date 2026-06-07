import type { Metadata } from "next";
import { Lock, UserRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { DreamCard } from "@/components/dreams/dream-card";
import { ProfileCard } from "@/components/profiles/profile-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { getProfile } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import {
  defaultOgImage,
  getPublicProfileSeo,
  truncateForSeo,
} from "@/lib/seo";
import { absoluteUrl, displayUsername, normalizeUsername, profilePath } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Profile = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

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

function usernamesMatch(left: string, right: string) {
  return normalizeUsername(left).toLowerCase() === normalizeUsername(right).toLowerCase();
}

function getDevelopmentProfileFallback(
  username: string,
  user: Awaited<ReturnType<typeof getCurrentUser>>,
): Profile | null {
  if (process.env.NODE_ENV !== "development" || !user || !usernamesMatch(user.username, username)) {
    return null;
  }

  return {
    id: user.id,
    username: normalizeUsername(user.username),
    displayName: user.displayName,
    bio: null,
    avatarUrl: user.image ?? null,
    bannerUrl: null,
    role: user.role,
    status: user.status,
    privateProfile: false,
    showSavedDreams: false,
    createdAt: new Date(),
    _count: {
      dreams: 0,
      followers: 0,
      following: 0,
      bookmarks: 0,
    },
    dreams: [],
  };
}

async function getFollowingState(userId: string, profileId: string) {
  try {
    return Boolean(
      await getPrisma().follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: profileId,
          },
        },
      }),
    );
  } catch (error) {
    if (process.env.NODE_ENV !== "development") throw error;

    console.warn(
      "[dreamshare:profile-follow-state] database unavailable; rendering not-following state.",
      error,
    );

    return false;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const username = usernameFromHandle(handle);
  const profile = await getPublicProfileSeo(username);

  if (!profile) {
    return {
      title: username ? displayUsername(username) : "Channel",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const path = profilePath(profile.username);
  const title = `${profile.displayName} (${displayUsername(profile.username)})`;
  const description = truncateForSeo(
    profile.bio ||
      `${profile.displayName} shares public dreams on DreamShare. Read their dream journal, followers, and latest sleep stories.`,
  );

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "profile",
      images: [
        {
          url: profile.avatarUrl || defaultOgImage(),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [profile.avatarUrl || defaultOgImage()],
    },
  };
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
  const profile = (await getProfile(username, user?.id)) ?? getDevelopmentProfileFallback(username, user);

  if (!profile) {
    if (process.env.NODE_ENV !== "development") notFound();

    return (
      <EmptyState
        icon={UserRound}
        title="Profile unavailable"
        description="The local database could not return this profile. Check the database connection or use your own channel link."
      />
    );
  }

  if (profile.status === "BANNED") notFound();

  const following = user
    ? await getFollowingState(user.id, profile.id)
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
