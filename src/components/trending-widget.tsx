import { Flame } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DreamCardData } from "@/lib/data";
import { compactNumber } from "@/lib/utils";

export function TrendingWidget({ dreams }: { dreams: DreamCardData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="size-4 text-accent" aria-hidden="true" />
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
              className="focus-ring block rounded-lg border bg-background p-3 transition hover:bg-muted"
            >
              <div className="flex gap-3">
                <span className="font-mono text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{dream.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {compactNumber(dream.likeCount)} reactions ·{" "}
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
