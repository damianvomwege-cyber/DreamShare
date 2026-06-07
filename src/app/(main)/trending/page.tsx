import type { Metadata } from "next";
import { Flame, Sparkles } from "lucide-react";

import { DreamCard } from "@/components/dreams/dream-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import {
  getDreamFeed,
  getTrendingDreams,
  type DreamCardData,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending",
  description:
    "Explore trending dreams, most liked dream stories, and new public dreams shared by the DreamShare community.",
  alternates: {
    canonical: "/trending",
  },
};

function takeUniqueDreams(
  dreams: DreamCardData[],
  seenDreamIds: Set<string>,
  limit: number,
) {
  const uniqueDreams: DreamCardData[] = [];

  for (const dream of dreams) {
    if (seenDreamIds.has(dream.id)) {
      continue;
    }

    seenDreamIds.add(dream.id);
    uniqueDreams.push(dream);

    if (uniqueDreams.length >= limit) {
      break;
    }
  }

  return uniqueDreams;
}

function DreamColumn({
  title,
  dreams,
  currentUserId,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  dreams: DreamCardData[];
  currentUserId?: string;
  emptyTitle: string;
  emptyDescription: string;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold tracking-normal">{title}</h2>
      {dreams.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        dreams.map((dream) => (
          <DreamCard
            key={dream.id}
            dream={dream}
            currentUserId={currentUserId}
          />
        ))
      )}
    </div>
  );
}

export default async function TrendingPage() {
  const [user, trendingPool, likedPool, newestPool] = await Promise.all([
    getCurrentUser(),
    getTrendingDreams(18),
    getDreamFeed({ sort: "liked", take: 18 }),
    getDreamFeed({ sort: "new", take: 18 }),
  ]);
  const seenDreamIds = new Set<string>();
  const trending = takeUniqueDreams(trendingPool, seenDreamIds, 12);
  const liked = takeUniqueDreams(likedPool, seenDreamIds, 6);
  const newest = takeUniqueDreams(newestPool, seenDreamIds, 6);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-normal">
          <Flame className="size-7 text-accent" aria-hidden="true" />
          Trending Dreams
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The dreams getting the most reactions and conversation this week.
        </p>
      </section>

      <section className="space-y-4">
        {trending.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing is trending yet"
            description="Trending dreams appear after people start reacting and commenting."
          />
        ) : (
          <div className="space-y-4">
            {trending.map((dream) => (
              <DreamCard
                key={dream.id}
                dream={dream}
                currentUserId={user?.id}
                featured
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <DreamColumn
          title="Most Liked"
          dreams={liked}
          currentUserId={user?.id}
          emptyTitle="No extra liked dreams yet"
          emptyDescription="Liked dreams that are not already shown above will appear here."
        />
        <DreamColumn
          title="New Dreams"
          dreams={newest}
          currentUserId={user?.id}
          emptyTitle="No extra new dreams yet"
          emptyDescription="New dreams that are not already shown above will appear here."
        />
      </section>
    </div>
  );
}
