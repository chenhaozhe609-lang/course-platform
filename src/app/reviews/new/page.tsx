import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getMyReviewForCourse } from "@/lib/reviews";
import { SiteHeader } from "@/components/site-header";
import { ReviewForm } from "@/components/review-form";
import { createReview } from "../actions";

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const user = await requireUser();
  const { courseId } = await searchParams;
  if (!courseId) notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, name: true, teacher: true, status: true, submittedById: true },
  });
  if (!course || (course.status !== "published" && course.submittedById !== user.id)) {
    notFound();
  }

  // 已评价则跳转到编辑
  const mine = await getMyReviewForCourse(courseId, user.id);
  if (mine) redirect(`/reviews/${mine.id}/edit`);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-8">
        <Link href={`/courses/${course.id}`} className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← 返回课程
        </Link>
        <h1 className="text-xl font-semibold">评价《{course.name}》</h1>
        <p className="mb-6 text-sm text-zinc-500">{course.teacher} · 你的评价将匿名展示</p>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <ReviewForm action={createReview.bind(null, course.id)} submitLabel="发布评价" />
        </div>
      </main>
    </div>
  );
}
