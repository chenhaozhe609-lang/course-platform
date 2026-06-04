import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listMyReactedReviews } from "@/lib/reviews";
import { RatingStars } from "@/components/rating-stars";

export default async function MyReactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser();
  const type = (await searchParams).type === "helpful" ? "helpful" : "like";
  const reviews = await listMyReactedReviews(user.id, type);

  return (
    <div>
      <div className="mb-4 flex gap-1 text-sm">
        <Link
          href="/me/reactions?type=like"
          className={type === "like" ? "rounded-full bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-100 dark:text-zinc-900" : "rounded-full border border-zinc-300 px-3 py-1 text-zinc-500 dark:border-zinc-700"}
        >
          我赞过的
        </Link>
        <Link
          href="/me/reactions?type=helpful"
          className={type === "helpful" ? "rounded-full bg-zinc-900 px-3 py-1 text-white dark:bg-zinc-100 dark:text-zinc-900" : "rounded-full border border-zinc-300 px-3 py-1 text-zinc-500 dark:border-zinc-700"}
        >
          我标记有用的
        </Link>
      </div>

      {reviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
          这里还空着。
        </p>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li key={r!.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/courses/${r!.course.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-100">
                  {r!.course.name}
                  <span className="ml-2 text-sm font-normal text-zinc-400">{r!.user.nickname}</span>
                </Link>
                <div className="flex items-center gap-1.5">
                  <RatingStars value={r!.ratingOverall} size="text-sm" />
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">{r!.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
