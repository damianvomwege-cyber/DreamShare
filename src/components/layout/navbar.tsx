import {
  Bell,
  Bookmark,
  Compass,
  Home,
  LayoutDashboard,
  Search,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { DreamShareLogo } from "@/components/brand/dreamshare-logo";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import type { getCurrentUser } from "@/lib/auth";
import { ROLE_WEIGHT } from "@/lib/constants";
import { profilePath } from "@/lib/utils";

type User = Awaited<ReturnType<typeof getCurrentUser>>;

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/trending", label: "Trending", icon: TrendingUp },
  { href: "/bookmarks", label: "Saved", icon: Bookmark },
  { href: "/notifications", label: "Alerts", icon: Bell },
];

export function Navbar({ user }: { user: User }) {
  const isStaff = user && ROLE_WEIGHT[user.role] >= ROLE_WEIGHT.MODERATOR;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/76 shadow-sm shadow-slate-950/5 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/62">
      <div className="mx-auto flex h-16 max-w-[1480px] items-center gap-3 px-3 sm:px-5 lg:px-6">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-lg text-lg font-bold tracking-normal"
        >
          <DreamShareLogo />
        </Link>

        <nav className="ml-5 hidden items-center gap-1 rounded-lg border bg-card/45 p-1 shadow-sm shadow-slate-950/5 lg:flex" aria-label="Primary">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:-translate-y-0.5 hover:bg-muted/75 hover:text-foreground"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/explore"
          className="focus-ring group ml-auto hidden h-10 w-full max-w-md items-center gap-2 rounded-lg border bg-card/62 px-3 text-sm text-muted-foreground shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-primary/45 hover:bg-card/86 hover:text-foreground md:flex"
        >
          <span className="grid size-6 place-items-center rounded-md bg-muted text-muted-foreground transition group-hover:bg-primary/12 group-hover:text-primary">
            <Search className="size-3.5" aria-hidden="true" />
          </span>
          Search dreams, tags, users
        </Link>

        <ThemeToggle />

        {isStaff ? (
          <ButtonLink href="/admin" variant="secondary" className="hidden sm:flex">
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Admin
          </ButtonLink>
        ) : null}

        {user ? (
          <>
            <SignOutButton className="hidden sm:inline-flex" />
            <SignOutButton compact className="sm:hidden" />
            <Link
              href={profilePath(user.username)}
              className="focus-ring rounded-full"
              aria-label="Open profile"
            >
              <Avatar
                src={user.image}
                name={user.displayName}
                className="size-10"
              />
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" className="hidden sm:inline-flex">
              Login
            </ButtonLink>
            <ButtonLink href="/register" className="shadow-[var(--glow-primary)]">
              Join
            </ButtonLink>
          </div>
        )}
      </div>
    </header>
  );
}

export { navItems };
