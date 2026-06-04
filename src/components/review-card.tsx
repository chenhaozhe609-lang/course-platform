import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import { deleteReview } from "@/app/reviews/actions";

type ReviewCardData = {
  id: string;
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
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const MINI = [
  { key: "ratingScore", label: "给分" },
  { key: "ratingWorkload", label: "作业轻松" },
  { key: "ratingGain", label: "收获" },
] as const;

export function ReviewCard({
  review,
  isOwner,
}: {
  review: ReviewCardData;
  isOwner: boolean;
}) {
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

      <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span>{fmtDate(review.createdAt)}{edited ? "（已编辑）" : ""}</span>
          {/* 点赞 / 有用 / 评论 交互在 M3 接入，此处先展示计数 */}
          <span>有用 {review.helpfulCount}</span>
          <span>赞 {review.likeCount}</span>
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
    </article>
  );
}
