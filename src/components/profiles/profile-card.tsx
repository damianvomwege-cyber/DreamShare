import { CalendarDays, Lock, ShieldCheck } from "lucide-react";
import Image from "next/image";

import { FollowButton } from "@/components/profiles/follow-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { getProfile } from "@/lib/data";
import { compactNumber } from "@/lib/utils";

type Profile = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

export function ProfileCard({
  profile,
  following,
  currentUserId,
}: {
  profile: Profile;
  following: boolean;
  currentUserId?: string;
}) {
  const isOwnProfile = currentUserId === profile.id;

  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 bg-muted">
        {profile.bannerUrl ? (
          <Image
            src={profile.bannerUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full bg-[linear-gradient(135deg,rgba(34,211,238,.28),rgba(249,115,22,.18))]" />
        )}
      </div>
      <div className="p-5">
        <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Avatar
            src={profile.avatarUrl}
            name={profile.displayName}
            className="size-24 border-4 border-card text-2xl"
          />
          {!isOwnProfile ? (
            <FollowButton
              username={profile.username}
              initialFollowing={following}
              disabled={!currentUserId}
            />
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-normal">
                {profile.displayName}
              </h1>
              {profile.role !== "USER" ? (
                <Badge className="gap-1 text-primary">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  {profile.role.toLowerCase()}
                </Badge>
              ) : null}
              {profile.privateProfile ? (
                <Badge className="gap-1">
                  <Lock className="size-3" aria-hidden="true" />
                  Private
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
          {profile.bio ? <p className="max-w-2xl text-sm leading-6">{profile.bio}</p> : null}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              Joined {profile.createdAt.toLocaleDateString()}
            </span>
            <span>{compactNumber(profile._count.dreams)} dreams</span>
            <span>{compactNumber(profile._count.followers)} followers</span>
            <span>{compactNumber(profile._count.following)} following</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
