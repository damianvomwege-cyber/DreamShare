import { AdminShell } from "@/components/admin/admin-shell";
import { UserModerationControls } from "@/components/admin/admin-controls";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const actor = await requireRole("MODERATOR");
  const users = await getPrisma().user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      username: true,
      displayName: true,
      email: true,
      avatarUrl: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          dreams: true,
          followers: true,
        },
      },
    },
  });

  return (
    <AdminShell user={actor}>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-normal">User Management</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ban, suspend, delete, or change roles for accounts.
          </p>
        </section>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Stats</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatarUrl} name={user.displayName} className="size-9" />
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{user.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge>{user.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user._count.dreams} dreams · {user._count.followers} followers
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <UserModerationControls userId={user.id} role={user.role} />
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
