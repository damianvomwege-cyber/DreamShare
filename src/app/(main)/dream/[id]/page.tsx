import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentSection } from "@/components/comments/comment-section";
import { DreamOwnerControls } from "@/components/dreams/dream-owner-controls";
import { ReactionBar } from "@/components/dreams/reaction-bar";
import { DreamStructuredData } from "@/components/seo/structured-data";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { ReactionType } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { APP_NAME, MOOD_LABELS, REACTION_LABELS } from "@/lib/constants";
import { getDreamById } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import {
  dreamSeoKeywords,
  getPublicDreamSeo,
  truncateForSeo,
} from "@/lib/seo";
import { absoluteUrl, profilePath, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const dream = await getPublicDreamSeo(id);

  if (!dream) {
    return {
      title: "Dream not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${dream.title} by ${dream.author.displayName}`;
  const description = truncateForSeo(dream.description);
  const path = `/dream/${dream.id}`;
  const previewImages = dream.imageUrl
    ? [
        {
          url: dream.imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ]
    : undefined;

  return {
    title,
    description,
    keywords: dreamSeoKeywords(dream),
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: APP_NAME,
      type: "article",
      publishedTime: dream.createdAt.toISOString(),
      modifiedTime: dream.updatedAt.toISOString(),
      authors: [dream.author.displayName],
      images: previewImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: dream.imageUrl ? [dream.imageUrl] : undefined,
    },
  };
}

function reactionSummary(
  dream: NonNullable<Awaited<ReturnType<typeof getDreamById>>>,
  currentUserId?: string,
) {
  const counts = Object.fromEntries(
    (Object.keys(REACTION_LABELS) as ReactionType[]).map((type) => [type, 0]),
  ) as Record<ReactionType, number>;
  const activeReactions: ReactionType[] = [];

  for (const reaction of dream.reactions) {
    counts[reaction.type] += 1;
    if (reaction.userId === currentUserId) activeReactions.push(reaction.type);
  }

  return {
    counts,
    activeReactions,
    saved: dream.bookmarks.some((bookmark) => bookmark.userId === currentUserId),
  };
}

export default async function DreamDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const dream = await getDreamById(id, user);
  if (!dream) notFound();

  await getPrisma().dream.update({
    where: { id: dream.id },
    data: { viewCount: { increment: 1 } },
  });

  const summary = reactionSummary(dream, user?.id);

  return (
    <div className="space-y-6">
      <DreamStructuredData dream={dream} />
      <Card className="premium-border social-card overflow-hidden">
        {dream.imageUrl ? (
          <div className="relative aspect-[16/8] overflow-hidden">
            <Image
              src={dream.imageUrl}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 900px"
              className="object-cover"
              priority
            />
            <span
              className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>
        ) : null}
        <article className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Link href={profilePath(dream.author.username)} className="focus-ring rounded-full">
              <Avatar
                src={dream.author.avatarUrl}
                name={dream.author.displayName}
                className="size-12"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={profilePath(dream.author.username)}
                  className="font-semibold hover:text-primary"
                >
                  {dream.author.displayName}
                </Link>
                <span className="text-sm text-muted-foreground">
                  @{dream.author.username}
                </span>
                <span className="text-sm text-muted-foreground">
                  {timeAgo(dream.createdAt)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>{dream.category.name}</Badge>
                <Badge>{MOOD_LABELS[dream.mood]}</Badge>
                <Badge>{dream.visibility.toLowerCase()}</Badge>
              </div>
              {dream.authorId === user?.id ? (
                <div className="mt-3">
                  <DreamOwnerControls
                    dreamId={dream.id}
                    initialVisibility={dream.visibility}
                    afterDeleteHref={profilePath(dream.author.username)}
                  />
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-semibold tracking-normal">
              {dream.title}
            </h1>
            <p className="mt-4 whitespace-pre-wrap text-base leading-8 text-muted-foreground">
              {dream.description}
            </p>
          </div>

          {dream.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dream.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${encodeURIComponent(tag)}`}
                  className="focus-ring rounded-full border border-primary/10 bg-primary/10 px-2.5 py-1 text-sm font-bold text-primary transition hover:-translate-y-0.5 hover:bg-primary/15"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="border-t pt-4">
            <ReactionBar
              dreamId={dream.id}
              counts={summary.counts}
              activeReactions={summary.activeReactions}
              saved={summary.saved}
              commentCount={dream.commentCount}
              shareCount={dream.shareCount}
            />
          </div>
        </article>
      </Card>

      <CommentSection
        dreamId={dream.id}
        comments={dream.comments}
        signedIn={Boolean(user)}
      />
    </div>
  );
}
