import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border bg-background/70 px-2 py-0.5 text-xs font-medium text-muted-foreground shadow-sm shadow-slate-950/5",
        className,
      )}
      {...props}
    />
  );
}
