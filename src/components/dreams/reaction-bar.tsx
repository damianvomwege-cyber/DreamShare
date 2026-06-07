"use client";

import {
  Bookmark,
  Ghost,
  Heart,
  Laugh,
  MessageCircle,
  Share2,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";

import {
  toggleBookmarkAction,
  toggleReactionAction,
} from "@/app/actions/dreams";
import type { ReactionType } from "@/generated/prisma/client";
import { REACTION_LABELS, REACTION_STYLES } from "@/lib/constants";
import { cn, compactNumber } from "@/lib/utils";

const icons: Record<ReactionType, typeof Heart> = {
  LIKE: Heart,
  INTERESTING: Sparkles,
  CREEPY: Ghost,
  FUNNY: Laugh,
  AMAZING: Star,
};

export function ReactionBar({
  dreamId,
  counts,
  activeReactions,
  saved,
  commentCount,
  shareCount,
  compact = false,
}: {
  dreamId: string;
  counts: Record<ReactionType, number>;
  activeReactions: ReactionType[];
  saved: boolean;
  commentCount: number;
  shareCount: number;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [displayShareCount, setDisplayShareCount] = useState(shareCount);
  const [poppingReaction, setPoppingReaction] = useState<ReactionType | null>(null);
  const [bookmarkPop, setBookmarkPop] = useState(false);
  const [sharePop, setSharePop] = useState(false);
  const [optimistic, updateOptimistic] = useOptimistic(
    { counts, activeReactions, saved, shareCount },
    (
      state,
      update:
        | { kind: "reaction"; type: ReactionType }
        | { kind: "bookmark" },
    ) => {
      if (update.kind === "bookmark") {
        return { ...state, saved: !state.saved };
      }

      const active = state.activeReactions.includes(update.type);
      return {
        ...state,
        activeReactions: active
          ? state.activeReactions.filter((type) => type !== update.type)
          : [...state.activeReactions, update.type],
        counts: {
          ...state.counts,
          [update.type]: Math.max(
            0,
            state.counts[update.type] + (active ? -1 : 1),
          ),
        },
      };
    },
  );
  async function shareDream() {
    const shareUrl = `${window.location.origin}/dream/${dreamId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "DreamShare dream",
          text: "Read this dream on DreamShare.",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard?.writeText(shareUrl);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }

    startTransition(() => {
      void fetch(`/api/dreams/${dreamId}/share`, {
        method: "POST",
      })
        .then((response) => response.json())
        .then((result: { counted?: boolean }) => {
          if (result.counted) {
            setDisplayShareCount((count) => count + 1);
          }
        });
    });
  }

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
      {(Object.keys(REACTION_LABELS) as ReactionType[]).map((type) => {
        const Icon = icons[type];
        const active = optimistic.activeReactions.includes(type);

        return (
          <button
            key={type}
            type="button"
            data-sound="reaction"
            data-active={active ? "true" : undefined}
            data-pop={poppingReaction === type ? "true" : undefined}
            className={cn(
              "focus-ring reaction-pill inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold disabled:opacity-50",
              active
                ? `${REACTION_STYLES[type]} border-current/20 shadow-sm`
                : "bg-background/52 text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
            disabled={isPending}
            aria-label={`${REACTION_LABELS[type]} reaction`}
            title={REACTION_LABELS[type]}
            onAnimationEnd={() => {
              setPoppingReaction((current) => (current === type ? null : current));
            }}
            onClick={() => {
              setPoppingReaction(type);
              startTransition(() => {
                updateOptimistic({ kind: "reaction", type });
                void toggleReactionAction(dreamId, type);
              });
            }}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span>
              {compact
                ? compactNumber(optimistic.counts[type])
                : optimistic.counts[type]}
            </span>
          </button>
        );
      })}

      <Link
        href={`/dream/${dreamId}`}
        data-sound="nav"
        className="focus-ring reaction-pill inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border bg-background/52 px-3 text-xs font-bold text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        aria-label="Open comments"
      >
        <MessageCircle className="size-4" aria-hidden="true" />
        <span>{compact ? compactNumber(commentCount) : commentCount}</span>
      </Link>

      <button
        type="button"
        data-sound="save"
        data-active={optimistic.saved ? "true" : undefined}
        data-pop={bookmarkPop ? "true" : undefined}
        className={cn(
          "focus-ring reaction-pill inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold hover:bg-muted/80",
          optimistic.saved
            ? "border-amber-500/25 bg-amber-500/10 text-amber-700 shadow-sm dark:text-amber-300"
            : "bg-background/52 text-muted-foreground hover:text-foreground",
        )}
        disabled={isPending}
        aria-label={optimistic.saved ? "Remove bookmark" : "Save dream"}
        title={optimistic.saved ? "Remove bookmark" : "Save dream"}
        onAnimationEnd={() => {
          setBookmarkPop(false);
        }}
        onClick={() => {
          setBookmarkPop(true);
          startTransition(() => {
            updateOptimistic({ kind: "bookmark" });
            void toggleBookmarkAction(dreamId);
          });
        }}
      >
        <Bookmark className="size-4" aria-hidden="true" />
      </button>

      <button
        type="button"
        data-sound="share"
        data-pop={sharePop ? "true" : undefined}
        className="focus-ring reaction-pill inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border bg-background/52 px-3 text-xs font-bold text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        aria-label="Share dream"
        title="Share dream"
        disabled={isPending}
        onAnimationEnd={() => {
          setSharePop(false);
        }}
        onClick={() => {
          setSharePop(true);
          void shareDream();
        }}
      >
        <Share2 className="size-4" aria-hidden="true" />
        <span>{compact ? compactNumber(displayShareCount) : displayShareCount}</span>
      </button>
    </div>
  );
}
