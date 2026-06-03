import { prisma } from "@/lib/db";

const TYPE_LABEL: Record<string, string> = {
  required: "必修",
  elective: "选修",
  general: "通识",
};

export default async function Home() {
  const courses = await prisma.course.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reviews: true } } },
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              理工课探
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              在校学生的课程评价社区
            </p>
          </div>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
            脚手架就绪
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          课程列表（{courses.length}）
        </h2>
        <ul className="space-y-3">
          {courses.map((course) => (
            <li
              key={course.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {course.name}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {course.teacher}
                    {course.department ? ` · ${course.department}` : ""}
                    {course.credit ? ` · ${course.credit} 学分` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {course.type && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {TYPE_LABEL[course.type] ?? course.type}
                    </span>
                  )}
                  <span className="text-xs text-zinc-400">
                    {course._count.reviews} 条评价
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
