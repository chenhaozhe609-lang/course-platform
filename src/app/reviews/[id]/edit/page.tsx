import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getOwnedReview } from "@/lib/reviews";
import { SiteHeader } from "@/components/site-header";
import { ReviewForm } from "@/components/review-form";
import { AppendForm } from "@/components/append-form";
import { updateReview, appendReview } from "../../actions";

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const review = await getOwnedReview(id, user.id);
  if (!review) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-8">
        <Link href={`/courses/${review.course.id}`} className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← 返回课程
        </Link>
        <h1 className="text-xl font-semibold">编辑对《{review.course.name}》的评价</h1>
        <p className="mb-6 text-sm text-zinc-500">修改后会更新，标记为「已编辑」</p>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <ReviewForm
            action={updateReview.bind(null, review.id)}
            submitLabel="保存修改"
            defaults={{
              ratingOverall: review.ratingOverall,
              ratingScore: review.ratingScore,
              ratingWorkload: review.ratingWorkload,
              ratingGain: review.ratingGain,
              content: review.content,
              tags: review.tagList,
              term: review.term,
            }}
          />
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold">追加评价</h2>
          {review.appends.length > 0 && (
            <div className="mb-4 space-y-2 border-l-2 border-zinc-200 pl-3 dark:border-zinc-700">
              {review.appends.map((a) => (
                <div key={a.id} className="text-sm">
                  <span className="text-xs text-zinc-400">
                    {a.createdAt.toLocaleDateString("zh-CN")}
                  </span>
                  <p className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">{a.content}</p>
                </div>
              ))}
            </div>
          )}
          <AppendForm action={appendReview.bind(null, review.id)} />
        </section>
      </main>
    </div>
  );
}
