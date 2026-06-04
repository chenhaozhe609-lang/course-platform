import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listMyReactedReviews } from "@/lib/reviews";
import { Scrap } from "@/components/collage";
import { RatingStars } from "@/components/rating-stars";

export default async function MyReactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const user = await requireUser();
  const type = (await searchParams).type === "helpful" ? "helpful" : "like";
  const reviews = await listMyReactedReviews(user.id, type);

  const tabCls = (on: boolean) =>
    `px-3 py-1 text-sm font-bold uppercase tracking-wide ${on ? "bg-[#0b0b0a] text-[#e9e9e4]" : "border-2 border-[#0b0b0a] text-[#0b0b0a]/60"}`;

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <Link href="/me/reactions?type=like" className={tabCls(type === "like")}>我赞过的</Link>
        <Link href="/me/reactions?type=helpful" className={tabCls(type === "helpful")}>我标记有用的</Link>
      </div>

      {reviews.length === 0 ? (
        <Scrap rotate={-0.6}>
          <p className="px-6 py-12 text-center text-sm text-[#0b0b0a]/65">这里还空着。</p>
        </Scrap>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r, i) => (
            <li key={r!.id}>
              <Scrap rotate={i % 2 === 0 ? -0.4 : 0.4}>
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/courses/${r!.course.id}`} className="font-bold hover:underline">
                      {r!.course.name}
                      <span className="ml-2 text-sm font-normal text-[#0b0b0a]/45">{r!.user.nickname}</span>
                    </Link>
                    <RatingStars value={r!.ratingOverall} size="text-sm" />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[#0b0b0a]/80">{r!.content}</p>
                </div>
              </Scrap>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
