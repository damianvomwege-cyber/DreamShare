import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { CommentModerationControls } from "@/components/admin/admin-controls";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage() {
  const actor = await requireRole("MODERATOR");
  const comments = await getPrisma().comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      author: {
        select: {
          username: true,
          displayName: true,
        },
      },
      dream: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return (
    <AdminShell user={actor}>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-normal">Comment Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Moderate comments and nested reply conversations.
          </p>
        </section>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Comment</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Dream</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((comment) => (
                <tr key={comment.id} className="border-b last:border-0">
                  <td className="max-w-md px-4 py-3">
                    <p className="line-clamp-3">{comment.content}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {comment.author.displayName} · @{comment.author.username}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dream/${comment.dream.id}`} className="hover:text-primary">
                      {comment.dream.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{comment.deletedAt ? "DELETED" : "VISIBLE"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(comment.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <CommentModerationControls commentId={comment.id} />
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
