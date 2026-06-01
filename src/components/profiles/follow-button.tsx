"use client";

import { UserMinus, UserPlus } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { toggleFollowAction } from "@/app/actions/social";
import { Button } from "@/components/ui/button";

export function FollowButton({
  username,
  initialFollowing,
  disabled,
}: {
  username: string;
  initialFollowing: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [following, setFollowing] = useOptimistic(
    initialFollowing,
    (state) => !state,
  );

  return (
    <Button
      type="button"
      variant={following ? "secondary" : "primary"}
      disabled={disabled || isPending}
      onClick={() => {
        startTransition(() => {
          setFollowing(undefined);
          void toggleFollowAction(username);
        });
      }}
    >
      {following ? (
        <UserMinus className="size-4" aria-hidden="true" />
      ) : (
        <UserPlus className="size-4" aria-hidden="true" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
