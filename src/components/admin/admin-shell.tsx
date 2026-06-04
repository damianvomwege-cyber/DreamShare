import {
  FileText,
  Gauge,
  Home,
  MessageSquare,
  MonitorCheck,
  ScrollText,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { DreamShareLogo } from "@/components/brand/dreamshare-logo";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import type { getCurrentUser } from "@/lib/auth";

type User = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/dreams", label: "Dreams", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/logs", label: "Logs", icon: ScrollText },
  { href: "/admin/test", label: "Test", icon: MonitorCheck },
];

export function AdminShell({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="focus-ring flex items-center gap-2 rounded-lg font-semibold">
            <DreamShareLogo label="DreamShare Admin" />
          </Link>
          <Badge className="ml-auto">{user.role}</Badge>
          <ThemeToggle />
          <Link
            href="/"
            className="focus-ring hidden items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
          >
            <Home className="size-4" aria-hidden="true" />
            App
          </Link>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="h-max rounded-lg border bg-card p-2 lg:sticky lg:top-20">
          <nav className="grid gap-1" aria-label="Admin">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
