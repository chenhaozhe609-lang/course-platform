import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { listCourses, listDepartments, PAGE_SIZE } from "@/lib/courses";
import { COURSE_TYPE_LABEL } from "@/lib/validations/course";

const TYPE_OPTIONS = [
  { value: "", label: "全部类型" },
  { value: "required", label: "必修" },
  { value: "elective", label: "选修" },
  { value: "general", label: "通识" },
];

const SORT_OPTIONS = [
  { value: "latest", label: "最新" },
  { value: "reviews", label: "评价最多" },
];

type SearchParams = {
  q?: string;
  department?: string;
  type?: string;
  sort?: string;
  page?: string;
};

function buildHref(base: SearchParams, patch: Partial<SearchParams>): string {
  const sp = new URLSearchParams();
  const merged = { ...base, ...patch };
  for (const [k, v] of Object.entries(merged)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `/courses?${s}` : "/courses";
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [{ items, total }, departments] = await Promise.all([
    listCourses({
      q: sp.q,
      department: sp.department,
      type: sp.type,
      sort: sp.sort,
      page,
    }),
    listDepartments(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* 搜索 + 筛选（无 JS 的 GET 表单） */}
        <form method="get" className="mb-6 space-y-3">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="搜索课程名 / 教师 / 课程号"
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              搜索
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              name="department"
              defaultValue={sp.department ?? ""}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">全部院系</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              name="type"
              defaultValue={sp.type ?? ""}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sp.sort ?? "latest"}
              className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  按{s.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              筛选
            </button>
          </div>
        </form>

        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          共 {total} 门课程
        </h2>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
            没有匹配的课程。
            <Link href="/courses/new" className="ml-1 font-medium text-zinc-900 underline dark:text-zinc-100">
              提交新课程
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/courses/${course.id}`}
                  className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{course.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {course.teacher}
                        {course.department ? ` · ${course.department}` : ""}
                        {course.credit ? ` · ${course.credit} 学分` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      {course.type && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {COURSE_TYPE_LABEL[course.type as keyof typeof COURSE_TYPE_LABEL] ?? course.type}
                        </span>
                      )}
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">{course._count.reviews} 条评价</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-center gap-3 text-sm">
            {page > 1 ? (
              <Link href={buildHref(sp, { page: String(page - 1) })} className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                上一页
              </Link>
            ) : (
              <span className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">上一页</span>
            )}
            <span className="text-zinc-500 dark:text-zinc-400">
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={buildHref(sp, { page: String(page + 1) })} className="rounded-lg border border-zinc-300 px-3 py-1.5 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
                下一页
              </Link>
            ) : (
              <span className="rounded-lg border border-zinc-200 px-3 py-1.5 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600">下一页</span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
