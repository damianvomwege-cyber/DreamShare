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
import { defaultOgImage, defaultSeoDescription } from "@/lib/seo";
import {
  Activity,
  CloudMoon,
  Compass,
  Flame,
  Radio,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: "DreamShare - Share dreams and explore what people dreamed",
  },
  description: defaultSeoDescription(),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DreamShare - Share dreams and explore what people dreamed",
    description: defaultSeoDescription(),
    url: "/",
    images: [
      {
        url: defaultOgImage(),
        width: 1200,
        height: 630,
        alt: "DreamShare social dream journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DreamShare - Share dreams and explore what people dreamed",
    description: defaultSeoDescription(),
    images: [defaultOgImage()],
  },
};

export default async function HomePage() {
  const [user, categories, dreams, trending] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getDreamFeed({ sort: "new", take: 12 }),
    getTrendingDreams(5),
  ]);

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
      <StructuredData />
      <div className="min-w-0 space-y-5">
        <section className="premium-border social-card relative max-w-full overflow-hidden rounded-lg border p-4 sm:p-5">
          <div
            className="kinetic-bar absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,var(--primary),var(--hot),var(--accent),var(--success))]"
            aria-hidden="true"
          />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-lg border bg-background/64 px-3 py-1.5 text-xs font-semibold uppercase text-primary">
                <span className="pulse-dot size-2 rounded-full bg-success" />
                Live dream feed
              </div>
              <h1 className="mt-4 max-w-2xl text-2xl font-semibold tracking-normal sm:text-3xl">
                Dreams people posted tonight
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Strange scenes, lucid moments, nightmares, jokes, and half-remembered worlds.
              </p>
              {!user ? (
                <div className="mt-4 flex min-w-0 flex-wrap gap-2">
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
            <div className="grid min-w-0 grid-cols-3 gap-2 lg:w-72">
              {[
                { label: "Dreams", value: dreams.length, icon: Radio },
                { label: "Categories", value: categories.length, icon: Sparkles },
                { label: "Trending", value: trending.length, icon: Activity },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border bg-background/54 p-3 shadow-sm shadow-slate-950/5"
                >
                  <item.icon className="mb-2 size-4 text-primary" aria-hidden="true" />
                  <p className="text-2xl font-semibold">{item.value}</p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
            {categories.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/explore?category=${category.slug}`}
                className="focus-ring shrink-0 rounded-full border bg-background/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
              >
                <span
                  className="mr-2 inline-block size-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <DreamComposer categories={categories} signedIn={Boolean(user)} />

        <section className="space-y-4">
          <div className="social-card sticky top-20 z-20 flex items-center justify-between rounded-lg border px-3 py-2.5">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-normal sm:text-lg">
              <Flame className="size-5 text-accent" aria-hidden="true" />
              Latest Dreams
            </h2>
            <div className="flex items-center gap-1 rounded-lg bg-muted/45 p-1">
              <ButtonLink href="/explore" variant="ghost" size="sm">
                Explore
              </ButtonLink>
              <ButtonLink href="/trending" variant="ghost" size="sm">
                Trending
              </ButtonLink>
            </div>
          </div>
          {dreams.length === 0 ? (
            <EmptyState
              icon={CloudMoon}
              title="No dreams posted yet"
              description="Dreams will appear here as soon as the feed wakes up."
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

      <aside className="min-w-0 space-y-5 xl:sticky xl:top-20 xl:self-start">
        <TrendingWidget dreams={trending} />
        <CategoryWidget categories={categories} />
      </aside>
    </div>
  );
}
