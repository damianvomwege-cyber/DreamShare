import { PlusCircle } from "lucide-react";
import Link from "next/link";

import { navItems } from "@/components/layout/navbar";
import { ButtonLink } from "@/components/ui/button";

export function Sidebar() {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-60 shrink-0 flex-col justify-between lg:flex">
      <div className="space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <item.icon className="size-5" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </div>
      <ButtonLink href="/#compose" size="lg" className="w-full">
        <PlusCircle className="size-5" aria-hidden="true" />
        Post Dream
      </ButtonLink>
    </aside>
  );
}
