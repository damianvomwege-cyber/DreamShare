"use client";

import { Loader2, Reply, Send } from "lucide-react";
import { useActionState, useState } from "react";

import {
  addCommentAction,
  addReplyAction,
  type CommentActionState,
} from "@/app/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form";

const initialState: CommentActionState = { ok: false, message: "" };

export function CommentForm({ dreamId }: { dreamId: string }) {
  const [state, action, isPending] = useActionState(
    addCommentAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="dreamId" value={dreamId} />
      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-600" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}
      <Textarea
        name="content"
        required
        maxLength={1000}
        placeholder="Add your interpretation, memory, or reaction."
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Comment
      </Button>
    </form>
  );
}

export function ReplyForm({
  commentId,
  parentReplyId,
}: {
  commentId: string;
  parentReplyId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(addReplyAction, initialState);

  if (!open) {
    return (
      <button
        type="button"
        className="focus-ring inline-flex items-center gap-1 rounded-md text-xs font-medium text-muted-foreground hover:text-primary"
        onClick={() => setOpen(true)}
      >
        <Reply className="size-3.5" aria-hidden="true" />
        Reply
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="commentId" value={commentId} />
      {parentReplyId ? (
        <input type="hidden" name="parentReplyId" value={parentReplyId} />
      ) : null}
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-destructive"}`}>
          {state.message}
        </p>
      ) : null}
      <Textarea
        name="content"
        required
        maxLength={1000}
        className="min-h-20"
        placeholder="Write a reply"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Reply
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
