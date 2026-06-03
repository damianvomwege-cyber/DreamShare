import type { ReactNode } from "react";
import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="dream-gradient dream-shell grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="focus-ring mx-auto mb-8 flex w-max items-center gap-2 rounded-lg text-lg font-bold"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-[linear-gradient(135deg,var(--primary),var(--accent))] text-primary-foreground shadow-lg shadow-cyan-950/15">
            D
          </span>
          {APP_NAME}
        </Link>
        {children}
      </div>
    </main>
  );
}
