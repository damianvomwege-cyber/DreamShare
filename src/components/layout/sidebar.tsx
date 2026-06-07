import { PlusCircle, Radio } from "lucide-react";
import Link from "next/link";

import { navItems } from "@/components/layout/navbar";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import type { getCurrentUser } from "@/lib/auth";
import { profilePath } from "@/lib/utils";

type User = Awaited<ReturnType<typeof getCurrentUser>>;

export function Sidebar({ user }: { user: User }) {
  return (
    <aside className="sticky top-20 hidden w-64 shrink-0 self-start lg:block">
      <div className="social-card space-y-3 rounded-lg border p-2">
        {user ? (
          <Link
            href={profilePath(user.username)}
            className="focus-ring flex items-center gap-3 rounded-lg border bg-background/48 p-3 transition hover:border-primary/35 hover:bg-muted/55"
          >
            <Avatar src={user.image} name={user.displayName} className="size-11" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {user.displayName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                @{user.username}
              </span>
            </span>
          </Link>
        ) : (
          <div className="rounded-lg border bg-background/48 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="grid size-8 place-items-center rounded-lg bg-primary/12 text-primary">
                <Radio className="size-4" aria-hidden="true" />
              </span>
              DreamShare
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Guest mode</p>
          </div>
        )}

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-ring group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:bg-muted/75 hover:text-foreground"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-background/60 text-muted-foreground transition group-hover:bg-primary/12 group-hover:text-primary">
              <item.icon className="size-4" aria-hidden="true" />
            </span>
            {item.label}
          </Link>
        ))}
        <div className="border-t pt-3">
          <ButtonLink
            href="/#compose"
            size="md"
            className="kinetic-bar w-full shadow-[var(--glow-primary)]"
          >
            <PlusCircle className="size-4" aria-hidden="true" />
            Post Dream
          </ButtonLink>
        </div>
        <div className="rounded-lg border bg-background/42 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <span className="pulse-dot size-2 rounded-full bg-success" />
            Live pulse
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {["Posts", "Reacts", "Saves"].map((label) => (
              <span key={label} className="rounded-md bg-muted/55 px-2 py-2 text-xs">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
