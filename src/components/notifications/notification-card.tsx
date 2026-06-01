import { Bell, MessageCircle, UserPlus, Zap } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import type { getNotifications } from "@/lib/data";
import { profilePath, timeAgo } from "@/lib/utils";

type Notification = Awaited<ReturnType<typeof getNotifications>>[number];

const icons = {
  NEW_FOLLOWER: UserPlus,
  NEW_COMMENT: MessageCircle,
  NEW_REPLY: MessageCircle,
  NEW_REACTION: Zap,
  DREAM_TRENDING: Bell,
  MODERATION: Bell,
};

export function NotificationCard({
  notification,
}: {
  notification: Notification;
}) {
  const Icon = icons[notification.type];
  const href = notification.dreamId
    ? `/dream/${notification.dreamId}`
    : notification.actor
      ? profilePath(notification.actor.username)
      : "/notifications";

  return (
    <Card className={notification.readAt ? "opacity-75" : ""}>
      <Link
        href={href}
        className="focus-ring flex gap-3 rounded-lg p-4 transition hover:bg-muted/50"
      >
        {notification.actor ? (
          <Avatar
            src={notification.actor.avatarUrl}
            name={notification.actor.displayName}
            className="size-10"
          />
        ) : (
          <div className="grid size-10 place-items-center rounded-full border bg-muted text-muted-foreground">
            <Icon className="size-5" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{notification.message}</p>
          {notification.dream ? (
            <p className="truncate text-sm text-muted-foreground">
              {notification.dream.title}
            </p>
          ) : null}
          <p className="mt-1 text-xs text-muted-foreground">
            {timeAgo(notification.createdAt)}
          </p>
        </div>
      </Link>
    </Card>
  );
}
