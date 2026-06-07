"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="social-card mx-auto grid h-16 max-w-lg grid-cols-5 rounded-lg border px-2 shadow-[0_-18px_50px_rgba(15,23,42,0.14)]">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring flex flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground",
                active && "bg-primary/12 text-primary shadow-sm shadow-cyan-950/10",
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
