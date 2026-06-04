import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { getMyReviewForCourse } from "@/lib/reviews";
import { SiteHeader } from "@/components/site-header";
import { Scrap } from "@/components/collage";
import { disp } from "@/lib/ui";
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
  if (!course || (course.status !== "published" && course.submittedById !== user.id)) notFound();

  const mine = await getMyReviewForCourse(courseId, user.id);
  if (mine) redirect(`/reviews/${mine.id}/edit`);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-10">
        <Link href={`/courses/${course.id}`} className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-[#0b0b0a]/55 transition-colors hover:text-[#0b0b0a]">← {course.name}</Link>
        <h1 className="text-3xl uppercase leading-none" style={disp}>Write a review</h1>
        <p className="mb-6 mt-2 text-sm text-[#0b0b0a]/60">《{course.name}》· {course.teacher} · 你的评价将匿名展示</p>
        <Scrap rotate={-0.6}>
          <div className="px-6 py-7">
            <ReviewForm action={createReview.bind(null, course.id)} submitLabel="发布评价" />
          </div>
        </Scrap>
      </main>
    </div>
  );
}
