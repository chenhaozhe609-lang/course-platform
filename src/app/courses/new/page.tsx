import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { SiteHeader } from "@/components/site-header";
import CourseForm from "./course-form";

export default async function NewCoursePage() {
  // 需登录（proxy 已做乐观拦截，这里做安全校验）
  await requireUser();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-8">
        <Link href="/" className="mb-4 inline-block text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← 返回课程列表
        </Link>
        <h1 className="mb-1 text-xl font-semibold">提交新课程</h1>
        <p className="mb-6 text-sm text-zinc-500">找不到想评价的课程？提交后即可对它评价。</p>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <CourseForm />
        </div>
      </main>
    </div>
  );
}
