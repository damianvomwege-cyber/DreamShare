import Image from "next/image";
import Link from "next/link";

import { DreamOwnerControls } from "@/components/dreams/dream-owner-controls";
import { ReactionBar } from "@/components/dreams/reaction-bar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ReactionType } from "@/generated/prisma/client";
import { MOOD_LABELS, REACTION_LABELS } from "@/lib/constants";
import type { DreamCardData } from "@/lib/data";
import { compactNumber, profilePath, timeAgo } from "@/lib/utils";

function getReactionSummary(dream: DreamCardData, currentUserId?: string) {
  const counts = Object.fromEntries(
    (Object.keys(REACTION_LABELS) as ReactionType[]).map((type) => [type, 0]),
  ) as Record<ReactionType, number>;
  const activeReactions: ReactionType[] = [];

  for (const reaction of dream.reactions) {
    counts[reaction.type] += 1;
    if (reaction.userId === currentUserId) {
      activeReactions.push(reaction.type);
    }
  }

  return {
    counts,
    activeReactions,
    saved: dream.bookmarks.some((bookmark) => bookmark.userId === currentUserId),
  };
}

export function DreamCard({
  dream,
  currentUserId,
  featured = false,
}: {
  dream: DreamCardData;
  currentUserId?: string;
  featured?: boolean;
}) {
  const reactionSummary = getReactionSummary(dream, currentUserId);
  const isOwner = dream.author.id === currentUserId;

  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
      {dream.imageUrl ? (
        <Link href={`/dream/${dream.id}`} className="relative block aspect-[16/7]">
          <Image
            src={dream.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 760px"
            className="object-cover"
          />
        </Link>
      ) : null}

      <article className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <Link href={profilePath(dream.author.username)} className="focus-ring rounded-full">
            <Avatar
              src={dream.author.avatarUrl}
              name={dream.author.displayName}
              className="size-11"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={profilePath(dream.author.username)}
                className="focus-ring rounded text-sm font-semibold hover:text-primary"
              >
                {dream.author.displayName}
              </Link>
              <span className="text-xs text-muted-foreground">
                @{dream.author.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(dream.createdAt)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge
                style={{
                  borderColor: `${dream.category.color}55`,
                  color: dream.category.color,
                }}
              >
                {dream.category.name}
              </Badge>
              <Badge>{MOOD_LABELS[dream.mood]}</Badge>
              {isOwner ? <Badge>{dream.visibility.toLowerCase()}</Badge> : null}
              {featured ? <Badge>{compactNumber(dream.viewCount)} views</Badge> : null}
            </div>
            {isOwner ? (
              <div className="mt-3">
                <DreamOwnerControls
                  dreamId={dream.id}
                  initialVisibility={dream.visibility}
                />
              </div>
            ) : null}
          </div>
        </div>

        <div>
          <Link href={`/dream/${dream.id}`} className="focus-ring rounded">
            <h2 className="text-xl font-semibold tracking-normal text-foreground">
              {dream.title}
            </h2>
          </Link>
          <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground">
            {dream.description}
          </p>
        </div>

        {dream.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dream.tags.map((tag) => (
              <Link
                key={tag}
                href={`/explore?tag=${encodeURIComponent(tag)}`}
                className="focus-ring rounded-md text-xs font-medium text-primary hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}

        <ReactionBar
          dreamId={dream.id}
          counts={reactionSummary.counts}
          activeReactions={reactionSummary.activeReactions}
          saved={reactionSummary.saved}
          commentCount={dream.commentCount}
          shareCount={dream.shareCount}
          compact
        />
      </article>
    </Card>
  );
}
