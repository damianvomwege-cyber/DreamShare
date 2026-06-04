import type { ReactNode } from "react";
import Link from "next/link";

import { DreamShareLogo } from "@/components/brand/dreamshare-logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="dream-gradient dream-shell grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="focus-ring mx-auto mb-8 flex w-max items-center gap-2 rounded-lg text-lg font-bold"
        >
          <DreamShareLogo />
        </Link>
        {children}
      </div>
    </main>
  );
}
