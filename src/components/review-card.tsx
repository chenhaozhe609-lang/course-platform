import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import { AddCommentForm } from "@/components/add-comment-form";
import {
  deleteReview,
  toggleReaction,
  addComment,
  deleteComment,
} from "@/app/reviews/actions";

type ReviewCardData = {
  id: string;
  userId: string;
  ratingOverall: number;
  ratingScore: number;
  ratingWorkload: number;
  ratingGain: number;
  content: string;
  term: string | null;
  helpfulCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: { nickname: string };
  tagList: string[];
  appends: { id: string; content: string; createdAt: Date }[];
  myReactions: string[];
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    user: { nickname: string };
  }[];
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const MINI = [
  { key: "ratingScore", label: "给分" },
  { key: "ratingWorkload", label: "作业轻松" },
  { key: "ratingGain", label: "收获" },
] as const;

function ReactionButton({
  reviewId,
  type,
  label,
  count,
  active,
  loggedIn,
}: {
  reviewId: string;
  type: "like" | "helpful";
  label: string;
  count: number;
  active: boolean;
  loggedIn: boolean;
}) {
  const cls = `flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
    active
      ? "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      : "border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
  }`;
  const text = `${label} ${count}`;

  if (!loggedIn) {
    return (
      <Link href="/login" className={cls} title="登录后可操作">
        {text}
      </Link>
    );
  }
  return (
    <form action={toggleReaction.bind(null, reviewId, type)}>
      <button type="submit" className={cls}>
        {text}
      </button>
    </form>
  );
}

export function ReviewCard({
  review,
  currentUserId,
}: {
  review: ReviewCardData;
  currentUserId?: string;
}) {
  const isOwner = currentUserId != null && currentUserId === review.userId;
  const loggedIn = currentUserId != null;
  const edited = review.updatedAt.getTime() - review.createdAt.getTime() > 1000;

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {review.user.nickname}
          </span>
          {review.term && (
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
              {review.term}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <RatingStars value={review.ratingOverall} size="text-sm" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {review.ratingOverall.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        {MINI.map((m) => (
          <span key={m.key}>
            {m.label} {(review[m.key] as number).toFixed(1)}
          </span>
        ))}
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
        {review.content}
      </p>

      {review.tagList.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {review.tagList.map((t) => (
            <span
              key={t}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {review.appends.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
          {review.appends.map((a) => (
            <div key={a.id} className="text-sm">
              <span className="text-xs text-zinc-400">追评 · {fmtDate(a.createdAt)}</span>
              <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{a.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* 操作栏 */}
      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ReactionButton
            reviewId={review.id}
            type="helpful"
            label="有用"
            count={review.helpfulCount}
            active={review.myReactions.includes("helpful")}
            loggedIn={loggedIn}
          />
          <ReactionButton
            reviewId={review.id}
            type="like"
            label="赞"
            count={review.likeCount}
            active={review.myReactions.includes("like")}
            loggedIn={loggedIn}
          />
          <span className="ml-1">{fmtDate(review.createdAt)}{edited ? "（已编辑）" : ""}</span>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2">
            <Link
              href={`/reviews/${review.id}/edit`}
              className="rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              编辑
            </Link>
            <form action={deleteReview.bind(null, review.id)}>
              <button
                type="submit"
                className="rounded border border-zinc-200 px-2 py-0.5 text-red-500 hover:bg-red-50 dark:border-zinc-700 dark:hover:bg-red-950/30"
              >
                删除
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 评论区 */}
      <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
        {review.comments.length > 0 && (
          <ul className="mb-2 space-y-2">
            {review.comments.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-2 text-sm">
                <p className="text-zinc-700 dark:text-zinc-300">
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {c.user.nickname}
                  </span>
                  <span className="mx-1 text-zinc-300">·</span>
                  <span className="whitespace-pre-wrap">{c.content}</span>
                </p>
                {currentUserId === c.userId && (
                  <form action={deleteComment.bind(null, c.id)}>
                    <button type="submit" className="shrink-0 text-xs text-zinc-400 hover:text-red-500">
                      删除
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
        {loggedIn ? (
          <AddCommentForm action={addComment.bind(null, review.id)} />
        ) : (
          <Link href="/login" className="text-xs text-zinc-400 hover:text-zinc-600">
            登录后参与评论
          </Link>
        )}
      </div>
    </article>
  );
}
