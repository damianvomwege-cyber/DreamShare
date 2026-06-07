import { Flame } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DreamCardData } from "@/lib/data";
import { compactNumber } from "@/lib/utils";

export function TrendingWidget({ dreams }: { dreams: DreamCardData[] }) {
  return (
    <Card className="premium-border social-card overflow-hidden">
      <CardHeader className="border-b bg-background/38">
        <CardTitle className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-accent/12 text-accent shadow-[var(--glow-accent)]">
            <Flame className="size-4" aria-hidden="true" />
          </span>
          Hot now
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dreams.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Trending dreams appear after the first posts.
            </p>
          ) : null}
          {dreams.map((dream, index) => (
            <Link
              key={dream.id}
              href={`/dream/${dream.id}`}
              className="focus-ring group block rounded-lg border bg-background/56 p-3 transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/70 hover:shadow-sm"
            >
              <div className="flex gap-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold text-background shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${dream.category.color}, var(--primary))`,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold transition group-hover:text-primary">
                    {dream.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {compactNumber(dream.likeCount)} reactions /{" "}
                    {compactNumber(dream.commentCount)} comments
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
