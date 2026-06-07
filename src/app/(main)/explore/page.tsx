import type { Metadata } from "next";
import { Users } from "lucide-react";
import Link from "next/link";

import { CategoryWidget } from "@/components/category-widget";
import { DreamCard } from "@/components/dreams/dream-card";
import { SearchBar } from "@/components/search-bar";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getDreamFeed } from "@/lib/data";
import { getPrisma } from "@/lib/prisma";
import { normalizeUsername, profilePath } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Explore",
  description:
    "Search public dream stories by keyword, dream category, tags, mood, and dreamer on DreamShare.",
  alternates: {
    canonical: "/explore",
  },
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    sort?: "new" | "liked" | "trending";
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const usernameTerms = q
    ? Array.from(new Set([q, normalizeUsername(q)].filter((term) => term.length > 0)))
    : [];
  const [user, categories, dreams, users] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getDreamFeed({
      q,
      category: params.category,
      tag: params.tag,
      sort: params.sort ?? "new",
      take: 30,
    }),
    q
      ? getPrisma().user.findMany({
          where: {
            OR: [
              ...usernameTerms.map((term) => ({
                username: { contains: term, mode: "insensitive" as const },
              })),
              { displayName: { contains: q, mode: "insensitive" } },
            ],
            status: "ACTIVE",
          },
          select: {
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
          },
          take: 8,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <div className="space-y-5">
        <section className="premium-border social-card space-y-4 rounded-lg border p-4 sm:p-5">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal">Explore Dreams</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Search dream stories, people, categories, and tags.
            </p>
          </div>
          <SearchBar defaultValue={q} />
        </section>

        {users.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-base font-semibold">Users</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {users.map((result) => (
                <Card key={result.username} className="social-card-hover">
                  <Link
                    href={profilePath(result.username)}
                    className="focus-ring flex gap-3 rounded-lg p-4 transition hover:bg-muted/50"
                  >
                    <Avatar
                      src={result.avatarUrl}
                      name={result.displayName}
                      className="size-11"
                    />
                    <div className="min-w-0">
                      <p className="font-medium">{result.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        @{result.username}
                      </p>
                      {result.bio ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {result.bio}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-4">
          <div className="social-card sticky top-20 z-20 rounded-lg border px-3 py-2.5">
            <h2 className="text-base font-semibold">Dream Results</h2>
          </div>
          {dreams.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No matching dreams"
              description="Try a different tag, category, or search phrase."
            />
          ) : (
            <div className="feed-stack space-y-4">
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

      <aside className="space-y-5 xl:sticky xl:top-20 xl:self-start">
        <CategoryWidget categories={categories} />
      </aside>
    </div>
  );
}
