import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Scrap } from "@/components/collage";
import { RatingStars } from "@/components/rating-stars";
import { ReviewCard } from "@/components/review-card";
import { disp } from "@/lib/ui";
import { getCurrentUser } from "@/lib/dal";
import { getCourseDetail } from "@/lib/courses";
import { listReviews, getMyReviewForCourse, type ReviewSort } from "@/lib/reviews";
import { COURSE_TYPE_LABEL } from "@/lib/validations/course";

const DIMENSIONS = [
  { key: "overall", label: "综合推荐" },
  { key: "score", label: "给分" },
  { key: "workload", label: "作业轻松" },
  { key: "gain", label: "收获" },
] as const;

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { id } = await params;
  const { sort } = await searchParams;
  const user = await getCurrentUser();
  const data = await getCourseDetail(id, user?.id);
  if (!data) notFound();

  const { course, ratings, reviewCount } = data;
  const reviewSort: ReviewSort = sort === "latest" ? "latest" : "helpful";

  const [reviews, myReview] = await Promise.all([
    listReviews(course.id, reviewSort, user?.id),
    user ? getMyReviewForCourse(course.id, user.id) : Promise.resolve(null),
  ]);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/courses" className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-[#0b0b0a]/55 transition-colors hover:text-[#0b0b0a]">
          ← Courses
        </Link>

        {/* 课程头部 */}
        <Scrap rotate={-0.6}>
          <div className="px-6 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl uppercase leading-[0.95]" style={disp}>{course.name}</h1>
                <p className="mt-2 text-sm text-[#0b0b0a]/65">
                  {course.teacher}
                  {course.department ? ` · ${course.department}` : ""}
                  {course.credit ? ` · ${course.credit} 学分` : ""}
                  {course.courseNo ? ` · ${course.courseNo}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                {course.type && (
                  <span className="border border-[#0b0b0a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                    {COURSE_TYPE_LABEL[course.type as keyof typeof COURSE_TYPE_LABEL] ?? course.type}
                  </span>
                )}
                {course.status === "pending" && (
                  <span className="border-2 border-dashed border-[#0b0b0a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">待审核</span>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t-2 border-[#0b0b0a] pt-4">
              <span className="text-5xl leading-none" style={disp}>
                {ratings.overall != null ? ratings.overall.toFixed(1) : "—"}
              </span>
              <div>
                <RatingStars value={ratings.overall} />
                <p className="mt-0.5 text-xs uppercase tracking-wide text-[#0b0b0a]/55">{reviewCount} reviews</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
              {DIMENSIONS.map((d) => {
                const v = ratings[d.key];
                return (
                  <div key={d.key} className="text-sm">
                    <span className="text-[#0b0b0a]/55">{d.label}</span>
                    <span className="ml-2 font-bold">{v != null ? v.toFixed(1) : "—"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Scrap>

        {/* 评价区 */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between border-b-2 border-[#0b0b0a] pb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl uppercase" style={disp}>Reviews ({reviewCount})</h2>
              {reviewCount > 0 && (
                <div className="flex gap-2 text-xs font-bold uppercase tracking-wide">
                  <Link href={`/courses/${course.id}?sort=helpful`} className={reviewSort === "helpful" ? "text-[#0b0b0a]" : "text-[#0b0b0a]/40"}>Useful</Link>
                  <span className="text-[#0b0b0a]/30">/</span>
                  <Link href={`/courses/${course.id}?sort=latest`} className={reviewSort === "latest" ? "text-[#0b0b0a]" : "text-[#0b0b0a]/40"}>New</Link>
                </div>
              )}
            </div>

            {!user ? (
              <Link href="/login" className="border-2 border-[#0b0b0a] px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">登录后写评价</Link>
            ) : myReview ? (
              <Link href={`/reviews/${myReview.id}/edit`} className="border-2 border-[#0b0b0a] px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">编辑我的评价</Link>
            ) : (
              <Link href={`/reviews/new?courseId=${course.id}`} className="bg-[#0b0b0a] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#e9e9e4] transition-transform hover:-translate-y-0.5">写评价</Link>
            )}
          </div>

          {reviews.length === 0 ? (
            <Scrap rotate={-0.5}>
              <div className="px-6 py-12 text-center text-sm text-[#0b0b0a]/65">还没有评价，来做第一个分享的人。</div>
            </Scrap>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} currentUserId={user?.id} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
