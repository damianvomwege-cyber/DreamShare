import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t bg-background/62 py-8 text-sm text-muted-foreground backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>
          {APP_NAME} is a dream journal network built for thoughtful sharing.
        </p>
        <div className="flex gap-4">
          <Link className="hover:text-foreground" href="/explore">
            Explore
          </Link>
          <Link className="hover:text-foreground" href="/trending">
            Trending
          </Link>
          <Link className="hover:text-foreground" href="/settings">
            Settings
          </Link>
        </div>
      </div>
    </footer>
  );
}
