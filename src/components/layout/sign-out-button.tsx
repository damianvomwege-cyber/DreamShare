"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SignOutButton({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "md"}
      className={cn(className)}
      aria-label="Logout"
      title="Logout"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut className="size-4" aria-hidden="true" />
      {compact ? null : "Logout"}
    </Button>
  );
}
