import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listMyReviews } from "@/lib/reviews";
import { RatingStars } from "@/components/rating-stars";

export default async function MyReviewsPage() {
  const user = await requireUser();
  const reviews = await listMyReviews(user.id);

  if (reviews.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        你还没有发布评价。去课程页写下第一条吧。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/courses/${r.course.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
              {r.course.name}
              <span className="ml-2 text-sm font-normal text-zinc-400">{r.course.teacher}</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <RatingStars value={r.ratingOverall} size="text-sm" />
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{r.ratingOverall.toFixed(1)}</span>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">{r.content}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
            <span>有用 {r.helpfulCount}</span>
            <span>赞 {r.likeCount}</span>
            <span>评论 {r._count.comments}</span>
            <Link href={`/reviews/${r.id}/edit`} className="ml-auto rounded border border-zinc-200 px-2 py-0.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
              编辑
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
