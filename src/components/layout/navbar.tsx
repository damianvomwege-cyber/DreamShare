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

import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { APP_NAME, ROLE_WEIGHT } from "@/lib/constants";
import type { getCurrentUser } from "@/lib/auth";
import { profilePath } from "@/lib/utils";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

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
    <header className="sticky top-0 z-40 border-b bg-background/78 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/64">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded-lg text-lg font-bold tracking-normal"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-primary-foreground shadow-lg shadow-cyan-950/15">
            D
          </span>
          <span>{APP_NAME}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.slice(0, 3).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/80 hover:text-foreground"
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/explore"
          className="focus-ring ml-auto hidden h-10 w-full max-w-sm items-center gap-2 rounded-lg border bg-card/78 px-3 text-sm text-muted-foreground shadow-sm shadow-slate-950/5 transition hover:border-primary/40 hover:text-foreground md:flex"
        >
          <Search className="size-4" aria-hidden="true" />
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
            <ButtonLink href="/register">Join</ButtonLink>
          </div>
        )}
      </div>
    </header>
  );
}

export { navItems };
