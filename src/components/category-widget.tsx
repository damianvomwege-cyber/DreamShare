import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category } from "@/generated/prisma/client";

export function CategoryWidget({ categories }: { categories: Category[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-background/42">
        <CardTitle>Dream Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/explore?category=${category.slug}`}
              className="focus-ring flex items-center justify-between rounded-lg border bg-background/68 px-3 py-2 text-sm transition hover:border-primary/35 hover:bg-muted/70"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full shadow-[0_0_0_4px_rgba(8,145,178,0.08)]"
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
