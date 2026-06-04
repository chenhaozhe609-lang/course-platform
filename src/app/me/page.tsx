import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listMyReviews } from "@/lib/reviews";
import { Scrap } from "@/components/collage";
import { RatingStars } from "@/components/rating-stars";

export default async function MyReviewsPage() {
  const user = await requireUser();
  const reviews = await listMyReviews(user.id);

  if (reviews.length === 0) {
    return (
      <Scrap rotate={-0.6}>
        <p className="px-6 py-12 text-center text-sm text-[#0b0b0a]/65">你还没有发布评价。去课程页写下第一条吧。</p>
      </Scrap>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r, i) => (
        <li key={r.id}>
          <Scrap rotate={i % 2 === 0 ? -0.4 : 0.4}>
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/courses/${r.course.id}`} className="font-bold hover:underline">
                  {r.course.name}
                  <span className="ml-2 text-sm font-normal text-[#0b0b0a]/45">{r.course.teacher}</span>
                </Link>
                <div className="flex items-center gap-1.5">
                  <RatingStars value={r.ratingOverall} size="text-sm" />
                  <span className="text-sm font-black">{r.ratingOverall.toFixed(1)}</span>
                </div>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-[#0b0b0a]/80">{r.content}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-[#0b0b0a]/50">
                <span>有用 {r.helpfulCount}</span>
                <span>赞 {r.likeCount}</span>
                <span>评论 {r._count.comments}</span>
                <Link href={`/reviews/${r.id}/edit`} className="ml-auto border border-[#0b0b0a] px-2 py-0.5 font-bold uppercase tracking-wide hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">编辑</Link>
              </div>
            </div>
          </Scrap>
        </li>
      ))}
    </ul>
  );
}
