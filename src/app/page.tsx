import Link from "next/link";
import { Bodoni_Moda, Archivo } from "next/font/google";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

const serif = { fontFamily: "var(--font-bodoni)" } as const;

// 纸面颗粒（去饱和的 fractal noise），叠加 multiply 增加海报质感
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// 旋转的评价碎片
const CHIPS = [
  { t: "★★★★★", cls: "left-[2%] top-[18%] rotate-[-8deg] bg-zinc-900 text-[#f4f4f2]" },
  { t: "Generous grading", cls: "right-[6%] top-[12%] rotate-[5deg] border border-zinc-900" },
  { t: "Way too much homework", cls: "right-[2%] top-[34%] rotate-[-4deg] border border-zinc-900" },
  { t: "Highly recommend", cls: "left-[4%] top-[64%] rotate-[3deg] bg-zinc-900 text-[#f4f4f2]" },
  { t: "Easy final", cls: "right-[10%] bottom-[16%] rotate-[7deg] border border-zinc-900" },
  { t: "Hard pass.", cls: "right-[24%] top-[6%] rotate-[-3deg] border border-zinc-900" },
  { t: "Actually learned a lot", cls: "left-[12%] bottom-[8%] rotate-[-5deg] border border-zinc-900" },
];

const TICKER = [
  "DATA STRUCTURES",
  "GENEROUS GRADING",
  "EASY FINAL",
  "HIGHLY RECOMMEND",
  "TOO MUCH HOMEWORK",
  "THE PROF IS AMAZING",
  "MACHINE LEARNING",
  "ACTUALLY LEARNED A LOT",
  "HARD PASS",
  "WORTH IT",
];

const VALUES = [
  { n: "01", t: "SEARCH", d: "Find any course by name, teacher, or department. The average rating sits right next to it." },
  { n: "02", t: "REAL REVIEWS", d: "Four-dimension scores for grading, workload, and payoff, plus honest written reviews and follow-ups." },
  { n: "03", t: "ANONYMOUS", d: "Only your nickname shows. Say what you actually think, a glowing review or a warning." },
];

async function getHotCourses() {
  const rows = await prisma.course.findMany({
    where: { status: "published" },
    orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
    take: 5,
    include: {
      _count: { select: { reviews: true } },
      reviews: { select: { ratingOverall: true } },
    },
  });
  return rows.map((c) => {
    const n = c.reviews.length;
    return {
      id: c.id,
      name: c.name,
      teacher: c.teacher,
      count: c._count.reviews,
      avg: n ? c.reviews.reduce((s, r) => s + r.ratingOverall, 0) / n : null,
    };
  });
}

function Crosshair({ className }: { className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute text-zinc-900/40 ${className}`}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M7 0v14M0 7h14" />
      </svg>
    </span>
  );
}

export default async function LandingPage() {
  const [user, hot] = await Promise.all([getCurrentUser(), getHotCourses()]);

  return (
    <div
      className={`${bodoni.variable} ${archivo.variable} relative min-h-screen overflow-hidden bg-[#f4f4f2] text-zinc-900`}
      style={{ fontFamily: "var(--font-archivo)" }}
    >
      {/* 纸面颗粒 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.06] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />

      {/* 报头 */}
      <header className="relative z-20 border-b border-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-extrabold tracking-tight">理工课探</span>
            <span className="hidden text-[11px] uppercase tracking-[0.25em] text-zinc-500 sm:inline">
              Ligong Course Reviews
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Link href="/courses" className="px-3 py-1.5 text-zinc-600 transition-colors hover:text-zinc-900">
              Browse
            </Link>
            {user ? (
              <Link href="/me" className="border border-zinc-900 px-4 py-1.5 font-medium transition-colors hover:bg-zinc-900 hover:text-[#f4f4f2]">
                {user.nickname}
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 text-zinc-600 transition-colors hover:text-zinc-900">
                  Log in
                </Link>
                <Link href="/register" className="bg-zinc-900 px-4 py-1.5 font-medium text-[#f4f4f2] transition-transform hover:-translate-y-0.5">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO 拼贴 */}
      <section className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-6 py-16">
        <Crosshair className="left-4 top-4" />
        <Crosshair className="right-4 top-4" />
        <Crosshair className="bottom-4 left-4" />
        <Crosshair className="bottom-4 right-4" />

        {/* 巨型描边背景字 */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 top-[8%] hidden select-none text-[22rem] leading-none text-transparent lg:block"
          style={{ ...serif, WebkitTextStroke: "1px rgba(24,24,27,0.10)" }}
        >
          ✳
        </span>
        {/* 网点圆 */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-[6%] hidden h-72 w-72 rounded-full opacity-[0.5] md:block"
          style={{
            backgroundImage: "radial-gradient(#18181b 1px, transparent 1.7px)",
            backgroundSize: "11px 11px",
            WebkitMaskImage: "radial-gradient(circle at center, #000 55%, transparent 72%)",
            maskImage: "radial-gradient(circle at center, #000 55%, transparent 72%)",
          }}
        />
        {/* 侧边竖排刊名 */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-2 top-1/2 hidden -translate-y-1/2 text-[11px] uppercase tracking-[0.4em] text-zinc-400 [writing-mode:vertical-rl] lg:block"
        >
          Course Reviews · Vol.01
        </span>

        {/* 旋转评价碎片（桌面） */}
        {CHIPS.map((c) => (
          <span
            key={c.t}
            aria-hidden
            className={`absolute hidden whitespace-nowrap px-3 py-1 text-sm font-medium shadow-[3px_3px_0_0_rgba(24,24,27,0.12)] transition-transform duration-300 hover:rotate-0 md:inline-block ${c.cls}`}
          >
            {c.t}
          </span>
        ))}

        {/* 主文案 */}
        <div className="relative z-10 max-w-2xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Vol.01 — Campus course reviews
          </p>
          <h1 className="font-black leading-[0.92] tracking-[-0.02em]">
            <span className="block text-[clamp(2.8rem,9vw,6.5rem)]">STOP GUESSING</span>
            <span
              className="mt-1 block text-[clamp(2rem,6.2vw,4.2rem)] font-medium italic tracking-[-0.01em] text-zinc-700"
              style={serif}
            >
              which course to take.
            </span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-zinc-600">
            Real reviews from students who sat through it: grading, workload, and
            whether you'll actually learn anything. Anonymous and honest.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="bg-zinc-900 px-7 py-3.5 text-center text-sm font-semibold text-[#f4f4f2] transition-transform hover:-translate-y-0.5"
            >
              Browse reviews →
            </Link>
            <Link
              href={user ? "/courses/new" : "/register"}
              className="border border-zinc-900 px-7 py-3.5 text-center text-sm font-semibold transition-colors hover:bg-zinc-900 hover:text-[#f4f4f2]"
            >
              {user ? "Share a course" : "Write a review"}
            </Link>
          </div>

          {/* 移动端碎片（在流内，避免绝对定位拥挤） */}
          <div className="mt-8 flex flex-wrap gap-2 md:hidden">
            {CHIPS.slice(0, 4).map((c) => (
              <span key={c.t} aria-hidden className="border border-zinc-900 px-2.5 py-1 text-xs font-medium">
                {c.t}
              </span>
            ))}
          </div>
        </div>

        <span aria-hidden className="absolute bottom-4 right-6 text-xs tracking-[0.3em] text-zinc-400" style={serif}>
          001
        </span>
      </section>

      {/* 跑马灯 */}
      <div className="relative z-20 overflow-hidden border-y border-zinc-900 bg-zinc-900 py-3 text-[#f4f4f2]">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap pr-8 text-sm font-semibold uppercase tracking-[0.2em]">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-8">
              {t}
              <span className="text-zinc-500">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 价值 01/02/03 */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-px border border-zinc-900 bg-zinc-900 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.n} className="bg-[#f4f4f2] p-7">
              <div className="text-5xl font-medium text-zinc-300" style={serif}>
                {v.n}
              </div>
              <h3 className="mt-3 text-lg font-extrabold uppercase tracking-wide">{v.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 热门课程：编辑式排行 */}
      {hot.length > 0 && (
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
          <div className="mb-6 flex items-end justify-between border-b border-zinc-900 pb-3">
            <h2 className="text-2xl font-extrabold uppercase tracking-tight">Top rated</h2>
            <Link href="/courses" className="text-sm text-zinc-500 transition-colors hover:text-zinc-900">
              View all →
            </Link>
          </div>
          <ul>
            {hot.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/courses/${c.id}`}
                  className="group flex items-center gap-5 border-b border-zinc-300 py-5 transition-colors hover:bg-zinc-900/[0.03]"
                >
                  <span className="w-12 shrink-0 text-3xl font-medium text-zinc-300 group-hover:text-zinc-900" style={serif}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-lg font-bold">{c.name}</span>
                    <span className="text-sm text-zinc-500">{c.teacher}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-xl font-extrabold tabular-nums">
                      {c.avg != null ? c.avg.toFixed(1) : "—"}
                    </span>
                    <span className="text-xs text-zinc-500">{c.count} reviews</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 底部 CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="border border-zinc-900 px-8 py-16 text-center sm:px-16 sm:py-20">
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            One honest review can save a whole class{" "}
            <span className="italic font-medium" style={serif}>
              from a bad pick.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-zinc-600">
            Took a course? Write one. Picking one? Read first.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/courses" className="bg-zinc-900 px-7 py-3.5 text-sm font-semibold text-[#f4f4f2] transition-transform hover:-translate-y-0.5">
              Browse reviews →
            </Link>
            {!user && (
              <Link href="/register" className="border border-zinc-900 px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-zinc-900 hover:text-[#f4f4f2]">
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 版口 */}
      <footer className="relative z-10 border-t border-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs uppercase tracking-[0.2em] text-zinc-500 sm:flex-row">
          <span>理工课探 — Campus Course Reviews</span>
          <span style={serif} className="tracking-[0.3em]">Vol.01 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
