import { Flag, MessageSquare, Moon, Users } from "lucide-react";

import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAdminAnalytics, getAdminStats } from "@/lib/data";
import { compactNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statIcons = {
  totalUsers: Users,
  totalDreams: Moon,
  totalComments: MessageSquare,
  openReports: Flag,
};

export default async function AdminDashboardPage() {
  const user = await requireRole("MODERATOR");
  const [stats, analytics] = await Promise.all([
    getAdminStats(),
    getAdminAnalytics(),
  ]);

  const cards = [
    { key: "totalUsers", label: "Total Users", value: stats.totalUsers },
    { key: "totalDreams", label: "Total Dreams", value: stats.totalDreams },
    { key: "totalComments", label: "Total Comments", value: stats.totalComments },
    { key: "activeUsers", label: "Active Users", value: stats.activeUsers },
    { key: "newUsersToday", label: "New Users Today", value: stats.newUsersToday },
    { key: "dreamsToday", label: "Dreams Today", value: stats.dreamsToday },
    { key: "openReports", label: "Open Reports", value: stats.openReports },
  ];

  return (
    <AdminShell user={user}>
      <div className="space-y-6">
        <section>
          <h1 className="text-3xl font-semibold tracking-normal">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Growth, moderation, and engagement overview.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon =
              statIcons[card.key as keyof typeof statIcons] ?? Users;
            return (
              <Card key={card.key}>
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {compactNumber(card.value)}
                    </p>
                  </div>
                  <Icon className="size-8 text-primary" aria-hidden="true" />
                </CardContent>
              </Card>
            );
          })}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>14-day growth</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={analytics} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
