"use client";

import { Eye, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";

import {
  deleteDreamAction,
  updateDreamVisibilityAction,
} from "@/app/actions/dreams";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import type { DreamVisibility } from "@/generated/prisma/client";
import { DREAM_VISIBILITIES } from "@/lib/constants";

export function DreamOwnerControls({
  dreamId,
  initialVisibility,
  afterDeleteHref,
}: {
  dreamId: string;
  initialVisibility: DreamVisibility;
  afterDeleteHref?: string;
}) {
  const router = useRouter();
  const visibilityId = useId();
  const [visibility, setVisibility] = useState(initialVisibility);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={visibilityId}>
          Dream visibility
        </label>
        <div className="relative">
          <Eye
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Select
            id={visibilityId}
            value={visibility}
            disabled={isPending}
            className="h-9 w-36 pl-8 text-xs"
            aria-label="Change dream visibility"
            onChange={(event) => {
              const nextVisibility = event.target.value as DreamVisibility;
              const previousVisibility = visibility;
              setVisibility(nextVisibility);
              setMessage("");

              startTransition(async () => {
                const result = await updateDreamVisibilityAction(
                  dreamId,
                  nextVisibility,
                );

                if (!result.ok) {
                  setVisibility(previousVisibility);
                  setMessage(result.message);
                  return;
                }

                router.refresh();
              });
            }}
          >
            {DREAM_VISIBILITIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <Button
          type="button"
          size="sm"
          variant="danger"
          disabled={isPending}
          onClick={() => {
            if (
              !window.confirm(
                "Permanently delete this dream? This cannot be undone.",
              )
            ) {
              return;
            }

            setMessage("");
            startTransition(async () => {
              const result = await deleteDreamAction(dreamId);

              if (!result.ok) {
                setMessage(result.message);
                return;
              }

              if (afterDeleteHref) {
                router.push(afterDeleteHref);
              }
              router.refresh();
            });
          }}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="size-4" aria-hidden="true" />
          )}
          Delete
        </Button>
      </div>
      {message ? (
        <p className="text-xs font-medium text-destructive" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
