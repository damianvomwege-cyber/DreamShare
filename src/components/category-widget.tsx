import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/generated/prisma/client";

export function CategoryWidget({ categories }: { categories: Category[] }) {
  return (
    <Card className="social-card overflow-hidden">
      <CardHeader className="border-b bg-background/38">
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/explore?category=${category.slug}`}
              className="focus-ring group flex items-center justify-between rounded-lg border bg-background/56 px-3 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/70 hover:shadow-sm"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full shadow-[0_0_0_4px_rgba(8,145,178,0.08)] transition group-hover:scale-110"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
