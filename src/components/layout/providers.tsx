"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import { SoundEffects } from "@/components/layout/sound-effects";
import { ThemeController } from "@/components/layout/theme-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeController />
      <SoundEffects />
      {children}
    </SessionProvider>
  );
}
