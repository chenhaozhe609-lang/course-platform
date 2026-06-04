import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { RatingStars } from "@/components/rating-stars";
import { getCurrentUser } from "@/lib/dal";
import { getCourseDetail } from "@/lib/courses";
import { COURSE_TYPE_LABEL } from "@/lib/validations/course";

const DIMENSIONS = [
  { key: "overall", label: "综合推荐" },
  { key: "score", label: "给分" },
  { key: "workload", label: "作业轻松" },
  { key: "gain", label: "收获" },
] as const;

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const data = await getCourseDetail(id, user?.id);
  if (!data) notFound();

  const { course, ratings, reviewCount } = data;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← 返回课程列表
        </Link>

        {/* 课程头部 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{course.name}</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {course.teacher}
                {course.department ? ` · ${course.department}` : ""}
                {course.credit ? ` · ${course.credit} 学分` : ""}
                {course.courseNo ? ` · ${course.courseNo}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {course.type && (
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {COURSE_TYPE_LABEL[course.type as keyof typeof COURSE_TYPE_LABEL] ?? course.type}
                </span>
              )}
              {course.status === "pending" && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  待审核
                </span>
              )}
            </div>
          </div>

          {/* 评分概览 */}
          <div className="mt-5 flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {ratings.overall != null ? ratings.overall.toFixed(1) : "—"}
            </span>
            <div>
              <RatingStars value={ratings.overall} />
              <p className="mt-0.5 text-xs text-zinc-400">{reviewCount} 条评价</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            {DIMENSIONS.map((d) => {
              const v = ratings[d.key];
              return (
                <div key={d.key} className="text-sm">
                  <span className="text-zinc-500 dark:text-zinc-400">{d.label}</span>
                  <span className="ml-2 font-medium text-zinc-900 dark:text-zinc-100">
                    {v != null ? v.toFixed(1) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 评价区（M2） */}
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">学生评价</h2>
            <span
              className="cursor-not-allowed rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-400 dark:border-zinc-800"
              title="评价功能将在 M2 上线"
            >
              写评价（即将上线）
            </span>
          </div>
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
            评分与评价功能将在下一阶段（M2）上线。
          </div>
        </section>
      </main>
    </div>
  );
}
