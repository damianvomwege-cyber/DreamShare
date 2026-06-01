import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const actor = await requireRole("ADMIN");
  const logs = await getPrisma().adminLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    include: {
      actor: {
        select: {
          username: true,
          displayName: true,
        },
      },
    },
  });

  return (
    <AdminShell user={actor}>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-normal">Audit Logs</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Security-relevant admin actions are recorded here.
          </p>
        </section>

        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Network</th>
                <th className="px-4 py-3">Metadata</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <Badge>{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.actor
                      ? `${log.actor.displayName} · @${log.actor.username}`
                      : "System"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.targetType ?? "-"} {log.targetId ?? ""}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.ipAddress ?? "-"}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-muted-foreground">
                    {log.metadata ? JSON.stringify(log.metadata) : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {timeAgo(log.createdAt)}
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
