"use client";

import { Ban, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useTransition } from "react";

import {
  adminDeleteCommentAction,
  adminDeleteDreamAction,
  banUserAction,
  changeRoleAction,
  deleteUserAction,
  suspendUserAction,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import type { Role } from "@/generated/prisma/client";

function ConfirmButton({
  label,
  confirm,
  action,
  variant = "secondary",
  icon,
}: {
  label: string;
  confirm: string;
  action: () => Promise<unknown>;
  variant?: "secondary" | "danger";
  icon?: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirm)) return;
        startTransition(async () => {
          await action();
          router.refresh();
        });
      }}
    >
      {icon}
      {label}
    </Button>
  );
}

export function UserModerationControls({
  userId,
  role,
}: {
  userId: string;
  role: Role;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <ConfirmButton
        label="Suspend"
        confirm="Suspend this user?"
        action={() => suspendUserAction(userId)}
        icon={<ShieldAlert className="size-4" aria-hidden="true" />}
      />
      <ConfirmButton
        label="Ban"
        confirm="Ban this user?"
        action={() => banUserAction(userId)}
        icon={<Ban className="size-4" aria-hidden="true" />}
      />
      <ConfirmButton
        label="Delete"
        confirm="Permanently delete this user and their content?"
        action={() => deleteUserAction(userId)}
        variant="danger"
        icon={<Trash2 className="size-4" aria-hidden="true" />}
      />
      <form action={changeRoleAction} className="flex gap-2">
        <input type="hidden" name="userId" value={userId} />
        <select
          name="role"
          defaultValue={role}
          className="focus-ring h-9 rounded-lg border bg-background px-2 text-sm"
        >
          <option value="USER">User</option>
          <option value="MODERATOR">Moderator</option>
          <option value="ADMIN">Admin</option>
          <option value="OWNER">Owner</option>
        </select>
        <Button type="submit" size="sm" variant="secondary">
          Role
        </Button>
      </form>
    </div>
  );
}

export function DreamModerationControls({ dreamId }: { dreamId: string }) {
  return (
    <ConfirmButton
      label="Delete"
      confirm="Permanently delete this dream? It will be removed from admin, counts, and all related data."
      action={() => adminDeleteDreamAction(dreamId)}
      variant="danger"
      icon={<Trash2 className="size-4" aria-hidden="true" />}
    />
  );
}

export function CommentModerationControls({ commentId }: { commentId: string }) {
  return (
    <ConfirmButton
      label="Delete"
      confirm="Delete this comment?"
      action={() => adminDeleteCommentAction(commentId)}
      variant="danger"
      icon={<Trash2 className="size-4" aria-hidden="true" />}
    />
  );
}
