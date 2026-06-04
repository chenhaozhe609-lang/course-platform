import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { Scrap, Tape, Stamp, Annote, SketchArrow, Barcode } from "@/components/collage";
import { disp, hand, LIGHT } from "@/lib/ui";

async function getHotCourses() {
  const rows = await prisma.course.findMany({
    where: { status: "published" },
    orderBy: [{ reviews: { _count: "desc" } }, { createdAt: "desc" }],
    take: 5,
    include: { _count: { select: { reviews: true } }, reviews: { select: { ratingOverall: true } } },
  });
  return rows.map((c) => {
    const n = c.reviews.length;
    return { id: c.id, name: c.name, teacher: c.teacher, count: c._count.reviews, avg: n ? c.reviews.reduce((s, r) => s + r.ratingOverall, 0) / n : null };
  });
}

const TICKER = ["DATA STRUCTURES", "GENEROUS GRADING", "EASY FINAL", "HIGHLY RECOMMEND", "TOO MUCH HOMEWORK", "THE PROF IS AMAZING", "MACHINE LEARNING", "ACTUALLY LEARNED A LOT", "HARD PASS", "WORTH IT"];

const VALUES = [
  { n: "01", t: "SEARCH", d: "Hunt down any course by name, teacher, or department. The rating is right there.", v: "graph" as const, r: -2.5, w: "sm:w-60", off: "sm:-mt-3" },
  { n: "02", t: "REAL REVIEWS", d: "Grading, workload, payoff — four scores, plus honest write-ups and follow-ups.", v: "ruled" as const, r: 2, w: "sm:w-72", off: "sm:mt-16" },
  { n: "03", t: "ANONYMOUS", d: "Only your nickname shows. Say the quiet part out loud, good or bad.", v: "plain" as const, r: -1.2, w: "sm:w-64", off: "sm:mt-5" },
];

export default async function LandingPage() {
  const [user, hot] = await Promise.all([getCurrentUser(), getHotCourses()]);

  return (
    <div
      className="relative min-h-screen overflow-hidden text-[#0b0b0a]"
      style={{
        backgroundColor: "#dededb",
        backgroundImage: "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.45), transparent 55%), radial-gradient(100% 100% at 100% 100%, rgba(0,0,0,.12), transparent 55%)",
      }}
    >
      {/* 额外 overlay 颗粒（叠在全局之上，hero 更脏） */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      {/* 报头 */}
      <header className="relative z-20 border-b-2 border-[#0b0b0a]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-black tracking-tight">理工课探</span>
            <span className="hidden text-[10px] uppercase tracking-[0.3em] text-[#0b0b0a]/55 sm:inline">Ligong Course Reviews · Est. 2026</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Link href="/courses" className="px-3 py-1.5 text-[#0b0b0a]/70 transition-colors hover:text-[#0b0b0a]">Browse</Link>
            {user ? (
              <Link href="/me" className="border-2 border-[#0b0b0a] px-4 py-1.5 font-bold transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">{user.nickname}</Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 text-[#0b0b0a]/70 transition-colors hover:text-[#0b0b0a]">Log in</Link>
                <Link href="/register" className="bg-[#0b0b0a] px-4 py-1.5 font-bold text-[#e9e9e4] transition-transform hover:-translate-y-0.5">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto min-h-[94vh] max-w-6xl px-6 py-12">
        <span aria-hidden className="pointer-events-none absolute -left-2 top-24 select-none text-[16rem] leading-none text-[#0b0b0a]/[0.05] sm:text-[22rem]" style={disp}>01</span>
        <span aria-hidden className="pointer-events-none absolute left-1 top-1/2 hidden -translate-y-1/2 text-[10px] uppercase tracking-[0.4em] text-[#0b0b0a]/45 [writing-mode:vertical-rl] lg:block">Scroll down ↓</span>
        <span aria-hidden className="absolute right-3 top-3 text-[#0b0b0a]/35">+</span>
        <span aria-hidden className="absolute bottom-3 right-6 text-xs tracking-[0.3em] text-[#0b0b0a]/45" style={disp}>001</span>

        {/* 右上深色簇（照片 + 条码） */}
        <div className="collage-in absolute right-[2%] top-[2%] hidden w-72 md:block" style={{ animationDelay: "120ms" }}>
          <Scrap rotate={3} dark>
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <Barcode light className="h-7" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#e9e9e4]/60">no.0001</span>
              </div>
              <div className="aspect-[4/3] w-full" style={{ backgroundColor: "#2a2a28", backgroundImage: "radial-gradient(#e9e9e4 28%, transparent 30%)", backgroundSize: "5px 5px" }} />
              <p className="mt-2 text-center text-[15px]" style={{ ...hand, color: LIGHT }}>lecture hall, 8am</p>
            </div>
          </Scrap>
        </div>

        {/* 深色短评 */}
        <div className="collage-in absolute right-[6%] top-[44%] hidden w-64 md:block" style={{ animationDelay: "300ms" }}>
          <Scrap rotate={-4} dark filterId="torn2">
            <Tape className="-top-3 right-8 -rotate-6" />
            <div className="px-5 py-4">
              <p className="text-[15px] leading-snug text-[#e9e9e4]">“the prof actually cares. took it twice, no regrets.”</p>
              <p className="mt-2 text-xs text-[#e9e9e4]/55">— 大学物理</p>
            </div>
          </Scrap>
          <Annote className="-bottom-6 right-2" rotate={-6}>so true</Annote>
        </div>

        {/* 浅色好评便签 */}
        <div className="collage-in absolute right-[30%] top-[6%] hidden w-52 md:block" style={{ animationDelay: "220ms" }}>
          <Scrap rotate={6} tone="#f0f0ec">
            <Tape className="-top-3 left-16 rotate-6" />
            <div className="px-5 py-4">
              <div className="text-lg tracking-widest">★★★★★</div>
              <p className="mt-1 text-[15px] font-semibold leading-snug">“Generous grading, and I actually use this now.”</p>
            </div>
          </Scrap>
        </div>

        <div className="collage-in absolute right-[28%] top-[40%] hidden md:block" style={{ animationDelay: "420ms" }}>
          <Stamp rotate={-12}>Real reviews · no PR</Stamp>
        </div>

        {/* 主标题 */}
        <div className="relative z-10 max-w-4xl pt-10 md:pt-20">
          <Scrap rotate={-1.4} filterId="torn2" className="collage-in inline-block">
            <Tape className="-top-3 left-12 -rotate-3" />
            <Tape className="-top-3 right-24 rotate-6" />
            <div className="px-7 py-8 sm:px-12 sm:py-10">
              <div className="mb-4 inline-flex -rotate-1 items-center gap-2 bg-[#0b0b0a] px-2.5 py-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e9e9e4]">Not perfect.</span>
                <span className="text-[15px] italic text-[#e9e9e4]" style={hand}>Honest.</span>
              </div>
              <h1 className="uppercase leading-[0.8] tracking-[0.005em]" style={disp}>
                <span className="block text-[clamp(2.4rem,7.5vw,5rem)] text-[#0b0b0a]/85">Read the</span>
                <span className="block text-[clamp(3.4rem,17vw,11rem)]" style={{ ...disp, filter: "url(#ink)" }}>Reviews</span>
                <span className="block text-[clamp(3rem,12vw,8rem)]" style={{ ...disp, filter: "url(#ink)" }}>First.</span>
              </h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#0b0b0a]/75">
                Real reviews from students who actually sat through it — grading, workload, and whether you'll learn a thing. Anonymous and honest.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <span className="text-sm font-black uppercase tracking-[0.18em]">Rate</span>
                <span className="text-[#0b0b0a]/40">/</span>
                <span className="text-sm font-black uppercase tracking-[0.18em]">Review</span>
                <span className="text-[#0b0b0a]/40">/</span>
                <span className="text-sm font-black uppercase tracking-[0.18em]">Choose</span>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/courses" className="bg-[#0b0b0a] px-7 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-[#e9e9e4] transition-transform hover:-translate-y-0.5">Browse reviews →</Link>
                <Link href={user ? "/courses/new" : "/register"} className="border-2 border-[#0b0b0a] px-7 py-3.5 text-center text-sm font-bold uppercase tracking-wide transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">{user ? "Share a course" : "Write a review"}</Link>
              </div>
            </div>
          </Scrap>

          <Annote className="-bottom-3 left-10 hidden md:block" rotate={-7} size="text-3xl">before you pick a single course →</Annote>
          <SketchArrow className="-bottom-16 left-80 hidden h-16 w-24 md:block" />

          <div className="mt-6 flex flex-wrap items-center gap-3 md:hidden">
            <div className="border-2 border-[#0b0b0a] px-3 py-1 text-sm font-semibold">★★★★★ Generous grading</div>
            <Stamp rotate={-4}>Real reviews</Stamp>
          </div>
        </div>
      </section>

      {/* 跑马灯 */}
      <div className="relative z-20 overflow-hidden border-y-2 border-[#0b0b0a] bg-[#0b0b0a] py-3 text-[#e9e9e4]">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap pr-8 text-sm font-bold uppercase tracking-[0.2em]">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-8">{t}<span className="text-[#e9e9e4]/40">✦</span></span>
          ))}
        </div>
      </div>

      {/* 价值三片（参差散落） */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <h2 className="mb-12 text-center text-[13px] font-bold uppercase tracking-[0.4em] text-[#0b0b0a]/60">How it works</h2>
        <div className="relative flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-7">
          {VALUES.map((v, i) => (
            <Scrap key={v.n} rotate={v.r} variant={v.v} className={`collage-in w-full ${v.w} ${v.off}`} style={{ animationDelay: `${i * 120}ms` }}>
              <div className={`px-6 py-7 ${v.v === "ruled" ? "pl-12" : ""}`}>
                <div className="text-6xl leading-none text-[#0b0b0a]/25" style={disp}>{v.n}</div>
                <h3 className="mt-3 text-lg font-black uppercase tracking-wide">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0b0b0a]/75">{v.d}</p>
              </div>
            </Scrap>
          ))}
          <Annote className="-top-8 left-[18%] hidden sm:block" rotate={-8} size="text-2xl">3 steps. that's it.</Annote>
          <div className="absolute -bottom-7 right-[22%] hidden sm:block"><Stamp rotate={7}>Free forever</Stamp></div>
        </div>
      </section>

      {/* 热门课程：歪斜的笔记本剪报 */}
      {hot.length > 0 && (
        <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24">
          <div className="relative ml-auto mr-2 max-w-2xl sm:mr-8">
            <Annote className="-top-4 -right-1 z-10 hidden sm:block" rotate={6} size="text-3xl">must-takes ↓</Annote>
            <div className="absolute -left-4 -top-5 z-10 hidden sm:block"><Stamp rotate={-11}>Ranked</Stamp></div>
            <Scrap variant="ruled" rotate={-1.6} className="collage-in">
              <Tape className="-top-3 right-16 rotate-3" />
              <div className="px-6 py-7 pl-12">
                <div className="mb-3 flex items-end justify-between border-b-2 border-[#0b0b0a] pb-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight" style={disp}>Top rated</h2>
                  <Link href="/courses" className="text-sm text-[#0b0b0a]/60 transition-colors hover:text-[#0b0b0a]">View all →</Link>
                </div>
                <ul>
                  {hot.map((c, i) => (
                    <li key={c.id}>
                      <Link href={`/courses/${c.id}`} className="group flex items-center gap-4 border-b border-[#0b0b0a]/15 py-3.5 transition-colors hover:bg-[#0b0b0a]/[0.05]">
                        <span className="w-9 shrink-0 text-3xl leading-none text-[#0b0b0a]/25 group-hover:text-[#0b0b0a]" style={disp}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-bold">{c.name}</span>
                          <span className="text-sm text-[#0b0b0a]/55">{c.teacher}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-lg font-black tabular-nums">{c.avg != null ? c.avg.toFixed(1) : "—"}</span>
                          <span className="text-xs text-[#0b0b0a]/50">{c.count} reviews</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </Scrap>
          </div>
        </section>
      )}

      {/* 底部 CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-28">
        <Scrap rotate={0.8} dark filterId="torn2" className="collage-in">
          <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
          <div className="px-8 py-14 text-center text-[#e9e9e4] sm:px-16 sm:py-16">
            <div className="mb-5 flex justify-center"><Stamp rotate={-6} light>Your turn</Stamp></div>
            <h2 className="mx-auto max-w-2xl text-4xl uppercase leading-[0.9] tracking-tight sm:text-6xl" style={disp}>One review saves a whole class.</h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] text-[#e9e9e4]/70">Took a course? Write one. Picking one? Read first.</p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/courses" className="bg-[#e9e9e4] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#0b0b0a] transition-transform hover:-translate-y-0.5">Browse reviews →</Link>
              {!user && <Link href="/register" className="border-2 border-[#e9e9e4] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#e9e9e4] transition-colors hover:bg-[#e9e9e4] hover:text-[#0b0b0a]">Create account</Link>}
            </div>
          </div>
        </Scrap>
      </section>

      <footer className="relative z-10 border-t-2 border-[#0b0b0a]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs uppercase tracking-[0.2em] text-[#0b0b0a]/55 sm:flex-row">
          <span>理工课探 — Campus Course Reviews</span>
          <Barcode className="h-6" />
          <span style={disp} className="tracking-[0.3em]">Vol.01 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
