"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/82 shadow-[0_-14px_40px_rgba(15,23,42,0.08)] backdrop-blur-2xl lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-2">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground transition",
                active && "bg-muted/65 text-primary",
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
