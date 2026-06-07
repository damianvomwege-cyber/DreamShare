import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border bg-background/66 px-2.5 py-1 text-xs font-semibold text-muted-foreground shadow-sm shadow-slate-950/5",
        className,
      )}
      {...props}
    />
  );
}
