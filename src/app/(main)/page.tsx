import type { Metadata } from "next";

import { CategoryWidget } from "@/components/category-widget";
import { DreamCard } from "@/components/dreams/dream-card";
import { DreamComposer } from "@/components/dreams/dream-composer";
import { StructuredData } from "@/components/seo/structured-data";
import { TrendingWidget } from "@/components/trending-widget";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getDreamFeed, getTrendingDreams } from "@/lib/data";
import { CloudMoon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
};

export default async function HomePage() {
  const [user, categories, dreams, trending] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getDreamFeed({ sort: "new", take: 12 }),
    getTrendingDreams(5),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <StructuredData />
      <div className="space-y-6">
        <section className="rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                Last night, remembered here
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-normal">
                Share dreams, decode symbols, follow dreamers.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                A social dream journal for strange plots, lucid breakthroughs,
                nightmares, and the stories that only make sense asleep.
              </p>
            </div>
            {!user ? (
              <div className="flex flex-wrap gap-2">
                <ButtonLink href="/register">Join DreamShare</ButtonLink>
                <ButtonLink href="/login" variant="secondary">
                  Login
                </ButtonLink>
              </div>
            ) : null}
          </div>
        </section>

        <DreamComposer categories={categories} signedIn={Boolean(user)} />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-normal">New Dreams</h2>
            <ButtonLink href="/explore" variant="ghost">
              Explore all
            </ButtonLink>
          </div>
          {dreams.length === 0 ? (
            <EmptyState
              icon={CloudMoon}
              title="No dreams posted yet"
              description="Seed the database or create the first account and post the first dream."
            />
          ) : (
            <div className="space-y-4">
              {dreams.map((dream) => (
                <DreamCard
                  key={dream.id}
                  dream={dream}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-6">
        <TrendingWidget dreams={trending} />
        <CategoryWidget categories={categories} />
      </aside>
    </div>
  );
}
