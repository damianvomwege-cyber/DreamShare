import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { DreamModerationControls } from "@/components/admin/admin-controls";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAdminDreams } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDreamsPage() {
  const actor = await requireRole("MODERATOR");
  const dreams = await getAdminDreams();

  return (
    <AdminShell user={actor}>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-normal">Dream Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review visibility, status, and remove unsafe dream posts.
          </p>
        </section>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Dream</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Engagement</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dreams.map((dream) => (
                <tr key={dream.id} className="border-b last:border-0">
                  <td className="max-w-sm px-4 py-3">
                    <Link href={`/dream/${dream.id}`} className="font-medium hover:text-primary">
                      {dream.title}
                    </Link>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {dream.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dream.author.displayName} · @{dream.author.username}
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{dream.category.name}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{dream.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {dream.likeCount} reactions · {dream.commentCount} comments
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(dream.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <DreamModerationControls dreamId={dream.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AdminShell>
  );
}
