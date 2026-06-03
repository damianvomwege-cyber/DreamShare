import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="dream-gradient dream-shell min-h-screen overflow-x-hidden">
      <Navbar user={user} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <main className="content-viewport min-w-0 flex-1 pb-16 lg:pb-0">
          {children}
        </main>
      </div>
      <Footer />
      <MobileNavigation />
    </div>
  );
}
