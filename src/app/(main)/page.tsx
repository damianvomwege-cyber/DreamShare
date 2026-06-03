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
import { CloudMoon, Compass, Flame, Sparkles } from "lucide-react";

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
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <StructuredData />
      <div className="min-w-0 space-y-6">
        <section className="premium-border relative max-w-full overflow-hidden rounded-lg border bg-card/74 p-5 shadow-[var(--elevated-shadow)] backdrop-blur-xl sm:p-6">
          <div
            className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--accent),var(--primary))]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-6">
            <div className="max-w-[19rem] sm:max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-lg border bg-background/72 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Dream feed
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-normal sm:text-5xl">
                Share the strange things your mind builds at night.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Post dreams, track moods, react to stories, and follow the people
                whose sleep worlds feel impossible to ignore.
              </p>
              <div className="mt-5 grid min-w-0 gap-2 sm:grid-cols-3">
                <div className="rounded-lg border bg-background/62 p-3">
                  <p className="text-2xl font-semibold">{dreams.length}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    New dreams loaded
                  </p>
                </div>
                <div className="rounded-lg border bg-background/62 p-3">
                  <p className="text-2xl font-semibold">{categories.length}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    Dream categories
                  </p>
                </div>
                <div className="rounded-lg border bg-background/62 p-3">
                  <p className="text-2xl font-semibold">{trending.length}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    Trending picks
                  </p>
                </div>
              </div>
              {!user ? (
                <div className="mt-5 flex min-w-0 flex-wrap gap-2">
                <ButtonLink href="/register" className="max-w-full">
                  <Compass className="size-4" aria-hidden="true" />
                  Join DreamShare
                </ButtonLink>
                <ButtonLink href="/login" variant="secondary">
                  Login
                </ButtonLink>
              </div>
              ) : null}
            </div>
          </div>
        </section>

        <DreamComposer categories={categories} signedIn={Boolean(user)} />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-normal">
              <Flame className="size-5 text-accent" aria-hidden="true" />
              New Dreams
            </h2>
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

      <aside className="min-w-0 space-y-6">
        <TrendingWidget dreams={trending} />
        <CategoryWidget categories={categories} />
      </aside>
    </div>
  );
}
