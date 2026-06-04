import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Scrap } from "@/components/collage";
import { disp, inputCls } from "@/lib/ui";
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

type SearchParams = { q?: string; department?: string; type?: string; sort?: string; page?: string };

function buildHref(base: SearchParams, patch: Partial<SearchParams>): string {
  const sp = new URLSearchParams();
  const merged = { ...base, ...patch };
  for (const [k, v] of Object.entries(merged)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `/courses?${s}` : "/courses";
}

const selectCls =
  "border-2 border-[#0b0b0a] bg-white px-2.5 py-2 text-sm font-semibold text-[#0b0b0a] outline-none [&>option]:bg-white [&>option]:text-[#0b0b0a]";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page) || 1;

  const [{ items, total }, departments] = await Promise.all([
    listCourses({ q: sp.q, department: sp.department, type: sp.type, sort: sp.sort, page }),
    listDepartments(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-end justify-between border-b-2 border-[#0b0b0a] pb-3">
          <h1 className="text-4xl uppercase leading-none" style={disp}>Courses</h1>
          <span className="text-sm font-bold uppercase tracking-wide text-[#0b0b0a]/55">{total} total</span>
        </div>

        {/* 搜索 + 筛选 */}
        <form method="get" className="mb-8 space-y-3">
          <div className="flex gap-2">
            <input type="search" name="q" defaultValue={sp.q ?? ""} placeholder="搜索课程名 / 教师 / 课程号" className={`flex-1 ${inputCls}`} />
            <button type="submit" className="bg-[#0b0b0a] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-[#e9e9e4] transition-transform hover:-translate-y-0.5">
              Search
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select name="department" defaultValue={sp.department ?? ""} className={selectCls}>
              <option value="">全部院系</option>
              {departments.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
            <select name="type" defaultValue={sp.type ?? ""} className={selectCls}>
              {TYPE_OPTIONS.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
            <select name="sort" defaultValue={sp.sort ?? "latest"} className={selectCls}>
              {SORT_OPTIONS.map((s) => (<option key={s.value} value={s.value}>按{s.label}</option>))}
            </select>
            <button type="submit" className="border-2 border-[#0b0b0a] px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">
              Filter
            </button>
          </div>
        </form>

        {items.length === 0 ? (
          <Scrap className="mx-auto max-w-md" rotate={-1}>
            <div className="px-6 py-12 text-center text-sm text-[#0b0b0a]/70">
              没有匹配的课程。
              <Link href="/courses/new" className="ml-1 font-bold underline">提交新课程</Link>
            </div>
          </Scrap>
        ) : (
          <ul className="space-y-4">
            {items.map((course, i) => (
              <li key={course.id}>
                <Scrap rotate={i % 2 === 0 ? -0.4 : 0.4}>
                  <Link href={`/courses/${course.id}`} className="block px-5 py-4 transition-colors hover:bg-[#0b0b0a]/[0.04]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-[#0b0b0a]">{course.name}</h3>
                        <p className="mt-1 text-sm text-[#0b0b0a]/60">
                          {course.teacher}
                          {course.department ? ` · ${course.department}` : ""}
                          {course.credit ? ` · ${course.credit} 学分` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        {course.type && (
                          <span className="border border-[#0b0b0a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                            {COURSE_TYPE_LABEL[course.type as keyof typeof COURSE_TYPE_LABEL] ?? course.type}
                          </span>
                        )}
                        <span className="text-xs text-[#0b0b0a]/55">{course._count.reviews} 条评价</span>
                      </div>
                    </div>
                  </Link>
                </Scrap>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="mt-8 flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wide">
            {page > 1 ? (
              <Link href={buildHref(sp, { page: String(page - 1) })} className="border-2 border-[#0b0b0a] px-3 py-1.5 hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">Prev</Link>
            ) : (
              <span className="border-2 border-[#0b0b0a]/30 px-3 py-1.5 text-[#0b0b0a]/30">Prev</span>
            )}
            <span className="text-[#0b0b0a]/60">{page} / {totalPages}</span>
            {page < totalPages ? (
              <Link href={buildHref(sp, { page: String(page + 1) })} className="border-2 border-[#0b0b0a] px-3 py-1.5 hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">Next</Link>
            ) : (
              <span className="border-2 border-[#0b0b0a]/30 px-3 py-1.5 text-[#0b0b0a]/30">Next</span>
            )}
          </nav>
        )}
      </main>
    </div>
  );
}
