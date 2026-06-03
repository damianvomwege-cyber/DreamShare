import { Flame } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DreamCardData } from "@/lib/data";
import { compactNumber } from "@/lib/utils";

export function TrendingWidget({ dreams }: { dreams: DreamCardData[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <CardTitle className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-accent/12 text-accent">
            <Flame className="size-4" aria-hidden="true" />
          </span>
          Trending
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
              className="focus-ring block rounded-lg border bg-background/68 p-3 transition hover:border-primary/35 hover:bg-muted/70"
            >
              <div className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted font-mono text-xs text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{dream.title}</p>
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
