import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { getOwnedReview } from "@/lib/reviews";
import { SiteHeader } from "@/components/site-header";
import { Scrap } from "@/components/collage";
import { disp } from "@/lib/ui";
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
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-10">
        <Link href={`/courses/${review.course.id}`} className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-[#0b0b0a]/55 transition-colors hover:text-[#0b0b0a]">← {review.course.name}</Link>
        <h1 className="text-3xl uppercase leading-none" style={disp}>Edit review</h1>
        <p className="mb-6 mt-2 text-sm text-[#0b0b0a]/60">修改后会更新，标记为「已编辑」</p>

        <Scrap rotate={-0.6}>
          <div className="px-6 py-7">
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
        </Scrap>

        <div className="mt-8">
          <Scrap rotate={0.6}>
            <div className="px-6 py-7">
              <h2 className="mb-3 text-lg uppercase" style={disp}>追加评价</h2>
              {review.appends.length > 0 && (
                <div className="mb-4 space-y-2 border-l-2 border-[#0b0b0a] pl-3">
                  {review.appends.map((a) => (
                    <div key={a.id} className="text-sm">
                      <span className="text-xs uppercase tracking-wide text-[#0b0b0a]/45">{a.createdAt.toLocaleDateString("zh-CN")}</span>
                      <p className="whitespace-pre-wrap text-[#0b0b0a]/80">{a.content}</p>
                    </div>
                  ))}
                </div>
              )}
              <AppendForm action={appendReview.bind(null, review.id)} />
            </div>
          </Scrap>
        </div>
      </main>
    </div>
  );
}
