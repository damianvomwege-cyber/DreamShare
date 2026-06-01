import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { markNotificationsReadAction } from "@/app/actions/social";
import { NotificationCard } from "@/components/notifications/notification-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotifications(user.id);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Notifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Follows, replies, reactions, and moderation updates.
          </p>
        </div>
        <form action={markNotificationsReadAction}>
          <Button type="submit" variant="secondary">
            Mark all read
          </Button>
        </form>
      </section>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="New dream activity will appear here."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
