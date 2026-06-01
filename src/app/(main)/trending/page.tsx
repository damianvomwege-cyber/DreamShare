import type { Metadata } from "next";
import { Flame, Sparkles } from "lucide-react";

import { DreamCard } from "@/components/dreams/dream-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { getDreamFeed, getTrendingDreams } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending",
};

export default async function TrendingPage() {
  const [user, trending, liked, newest] = await Promise.all([
    getCurrentUser(),
    getTrendingDreams(12),
    getDreamFeed({ sort: "liked", take: 6 }),
    getDreamFeed({ sort: "new", take: 6 }),
  ]);

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
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-normal">Most Liked</h2>
          {liked.map((dream) => (
            <DreamCard key={dream.id} dream={dream} currentUserId={user?.id} />
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-normal">New Dreams</h2>
          {newest.map((dream) => (
            <DreamCard key={dream.id} dream={dream} currentUserId={user?.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
