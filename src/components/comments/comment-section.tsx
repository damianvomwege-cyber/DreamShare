import { MessageCircle } from "lucide-react";
import Link from "next/link";

import { CommentForm, ReplyForm } from "@/components/comments/comment-forms";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getDreamById } from "@/lib/data";
import { profilePath, timeAgo } from "@/lib/utils";

type Dream = NonNullable<Awaited<ReturnType<typeof getDreamById>>>;
type Comment = Dream["comments"][number];
type Reply = Comment["replies"][number];

function ReplyItem({ reply, commentId }: { reply: Reply; commentId: string }) {
  return (
    <div className="border-l pl-4">
      <div className="flex gap-3">
        <Avatar
          src={reply.author.avatarUrl}
          name={reply.author.displayName}
          className="size-8"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={profilePath(reply.author.username)}
              className="font-medium hover:text-primary"
            >
              {reply.author.displayName}
            </Link>
            <span className="text-xs text-muted-foreground">
              {timeAgo(reply.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {reply.content}
          </p>
          <ReplyForm commentId={commentId} parentReplyId={reply.id} />
        </div>
      </div>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  return (
    <div className="space-y-4 border-t pt-5 first:border-t-0 first:pt-0">
      <div className="flex gap-3">
        <Avatar
          src={comment.author.avatarUrl}
          name={comment.author.displayName}
          className="size-10"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href={profilePath(comment.author.username)}
              className="font-medium hover:text-primary"
            >
              {comment.author.displayName}
            </Link>
            <span className="text-xs text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {comment.content}
          </p>
          <ReplyForm commentId={comment.id} />
        </div>
      </div>
      {comment.replies.length > 0 ? (
        <div className="ml-12 space-y-4">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} commentId={comment.id} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CommentSection({
  dreamId,
  comments,
  signedIn,
}: {
  dreamId: string;
  comments: Comment[];
  signedIn: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" aria-hidden="true" />
          Comments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {signedIn ? (
          <CommentForm dreamId={dreamId} />
        ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            Log in to comment or reply.
          </div>
        )}
        <div className="space-y-5">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No comments yet. Start the interpretation thread.
            </p>
          ) : null}
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
