import type { Metadata } from "next";
import { Bookmark } from "lucide-react";

import { DreamCard } from "@/components/dreams/dream-card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getSavedDreams } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Dreams",
};

export default async function BookmarksPage() {
  const user = await requireUser();
  const bookmarks = await getSavedDreams(user.id);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-normal">Saved Dreams</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Dreams you kept for later reading or interpretation.
        </p>
      </section>

      {bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved dreams"
          description="Use the bookmark button on dream cards to save them here."
        />
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <DreamCard
              key={bookmark.id}
              dream={bookmark.dream}
              currentUserId={user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
