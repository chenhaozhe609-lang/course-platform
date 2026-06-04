import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { HeroCanvas } from "@/components/hero-canvas";
import { RatingStars } from "@/components/rating-stars";

const VALUE_CARDS = [
  {
    title: "按需搜课",
    body: "按课程名、教师、院系快速检索，一眼看到平均分与评价数。",
    icon: (
      <path d="M11 4a7 7 0 1 0 4.2 12.6l3.6 3.6 1.4-1.4-3.6-3.6A7 7 0 0 0 11 4Zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" />
    ),
  },
  {
    title: "真实评价",
    body: "给分、作业、收获四维打分，配真实文字点评与结课追评。",
    icon: (
      <path d="M4 4h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-4 4V5a1 1 0 0 1 1-1Zm3 5v2h10V9H7Zm0 4v2h7v-2H7Z" />
    ),
  },
  {
    title: "匿名表达",
    body: "前台只显示匿名昵称，让你放心说真话，好评差评都算数。",
    icon: (
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
    ),
  },
];

async function getHotCourses() {
  return prisma.course.findMany({
    where: { status: "published" },
    orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
    take: 6,
    include: {
      _count: { select: { reviews: true } },
      reviews: { select: { ratingOverall: true } },
    },
  });
}

export default async function LandingPage() {
  const [user, hot] = await Promise.all([getCurrentUser(), getHotCourses()]);

  const hotWithAvg = hot.map((c) => {
    const n = c.reviews.length;
    const avg = n
      ? c.reviews.reduce((s, r) => s + r.ratingOverall, 0) / n
      : null;
    return { id: c.id, name: c.name, teacher: c.teacher, count: c._count.reviews, avg };
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06070d] text-white">
      {/* 顶部透明导航 */}
      <header className="absolute inset-x-0 top-0 z-30">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-lg font-semibold tracking-tight">理工课探</span>
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/courses"
              className="rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white"
            >
              浏览课程
            </Link>
            {user ? (
              <Link
                href="/me"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-1.5 backdrop-blur-md transition-colors hover:bg-white/10"
              >
                {user.nickname}
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-white px-4 py-1.5 font-medium text-[#06070d] transition-transform hover:scale-[1.03]"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-screen items-center justify-center px-6">
        {/* 静态多色底光（无 JS / SSR 时也有色彩） */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(40% 50% at 25% 40%, rgba(46,155,255,.45), transparent 70%), radial-gradient(35% 45% at 70% 35%, rgba(196,76,255,.40), transparent 70%), radial-gradient(40% 50% at 60% 70%, rgba(255,92,168,.35), transparent 70%), radial-gradient(30% 40% at 85% 60%, rgba(255,138,76,.30), transparent 70%)",
          }}
        />
        {/* 动态光流 */}
        <HeroCanvas className="absolute inset-0 h-full w-full" />
        {/* 顶/底渐隐，让文字更聚焦 */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 45%, transparent, rgba(6,7,13,.55) 100%)",
          }}
        />

        {/* 液态玻璃面板 */}
        <div className="relative z-10 w-full max-w-2xl">
          <div className="rounded-[28px] border border-white/12 bg-white/[0.06] px-8 py-12 text-center shadow-[0_8px_60px_-12px_rgba(0,0,0,0.6)] backdrop-blur-2xl sm:px-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              校园课程评价社区
            </span>
            <h1 className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              选课之前，
              <br />
              先听听学长学姐
            </h1>
            <p className="mx-auto mt-5 max-w-md text-pretty text-base leading-relaxed text-white/70">
              理工课探汇聚同学们的真实选课体验：给分松不松、作业多不多、到底有没有收获。匿名分享，帮你避开踩坑、选到好课。
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/courses"
                className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#06070d] transition-transform hover:scale-[1.03] sm:w-auto"
              >
                浏览课程评价
              </Link>
              <Link
                href={user ? "/courses/new" : "/register"}
                className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/10 sm:w-auto"
              >
                {user ? "分享一门课" : "注册分享你的课"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 价值三卡 */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          把选课的信息差，补回来
        </h2>
        <p className="mx-auto mt-3 max-w-md text-center text-white/60">
          教务系统只有课名和学分。真正该知道的，在这里。
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {VALUE_CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition-colors hover:bg-white/[0.07]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-white/80"
                  aria-hidden
                >
                  {card.icon}
                </svg>
              </span>
              <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {card.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 热门课程 */}
      {hotWithAvg.length > 0 && (
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              热门课程
            </h2>
            <Link
              href="/courses"
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              查看全部 →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {hotWithAvg.map((c) => (
              <Link
                key={c.id}
                href={`/courses/${c.id}`}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold leading-snug group-hover:text-white">
                    {c.name}
                  </h3>
                  {c.avg != null && (
                    <span className="shrink-0 text-sm font-semibold text-amber-300">
                      {c.avg.toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/55">{c.teacher}</p>
                <div className="mt-4 flex items-center justify-between">
                  <RatingStars value={c.avg} size="text-sm" />
                  <span className="text-xs text-white/45">{c.count} 条评价</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 底部 CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-28">
        <div className="overflow-hidden rounded-3xl border border-white/12 bg-white/[0.05] p-10 text-center backdrop-blur-2xl sm:p-16">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            你的一条评价，可能帮一整届人少踩一个坑
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/60">
            上过的课，认真写一条；要选的课，先来搜一搜。
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="w-full rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#06070d] transition-transform hover:scale-[1.03] sm:w-auto"
            >
              开始浏览
            </Link>
            {!user && (
              <Link
                href="/register"
                className="w-full rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur-md transition-colors hover:bg-white/10 sm:w-auto"
              >
                注册账号
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8 text-center text-sm text-white/40">
        理工课探 · 在校学生的课程评价社区
      </footer>
    </div>
  );
}
