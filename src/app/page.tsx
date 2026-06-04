import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Anton, Archivo, Caveat } from "next/font/google";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-caveat", display: "swap" });

const disp: CSSProperties = { fontFamily: "var(--font-anton)" };
const hand: CSSProperties = { fontFamily: "var(--font-caveat)" };

const INK = "#0b0b0a";
const PAPER = "#e6e6e2";
const PAPER_L = "#efefec";
const DARK = "#141413";
const FIBER = "#f3f3f0";
const LIGHT = "#e9e9e4";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const RULED = "repeating-linear-gradient(to bottom, transparent 0 28px, rgba(0,0,0,0.16) 28px 29px)";
const GRAPH =
  "repeating-linear-gradient(to right, transparent 0 21px, rgba(0,0,0,0.09) 21px 22px), repeating-linear-gradient(to bottom, transparent 0 21px, rgba(0,0,0,0.09) 21px 22px)";

const BARS = [3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 1, 3];

/* ---------- 拼贴原件 ---------- */

function Tape({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`absolute h-7 w-20 ${className}`}
      style={{ background: "linear-gradient(110deg, rgba(180,180,176,.5), rgba(150,150,146,.38))", boxShadow: "0 1px 2px rgba(0,0,0,.18)", ...style }}
    />
  );
}

function Scrap({
  children,
  className = "",
  rotate = 0,
  tone = PAPER_L,
  dark = false,
  variant = "plain",
  filterId = "torn",
  style,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  tone?: string;
  dark?: boolean;
  variant?: "plain" | "ruled" | "graph";
  filterId?: "torn" | "torn2";
  style?: CSSProperties;
}) {
  const main: CSSProperties = {
    backgroundColor: dark ? DARK : tone,
    filter: `url(#${filterId}) drop-shadow(2px 6px 6px rgba(0,0,0,${dark ? 0.45 : 0.22}))`,
  };
  if (variant === "ruled") main.backgroundImage = RULED;
  else if (variant === "graph") main.backgroundImage = GRAPH;
  return (
    <div className={`relative ${className}`} style={{ rotate: `${rotate}deg`, ...style }}>
      {/* 撕裂的浅色纸纤维边（深色纸片上露白边） */}
      <div aria-hidden className="absolute -inset-[3px]" style={{ backgroundColor: FIBER, filter: "url(#torn2)" }} />
      <div aria-hidden className="absolute inset-0" style={main} />
      {variant === "ruled" && <span aria-hidden className="absolute inset-y-0 left-10 w-px" style={{ background: "rgba(0,0,0,.3)" }} />}
      <div className="relative">{children}</div>
    </div>
  );
}

function Stamp({ children, className = "", rotate = -9, light = false }: { children: ReactNode; className?: string; rotate?: number; light?: boolean }) {
  const c = light ? LIGHT : INK;
  return (
    <div
      className={`inline-block px-3 py-1.5 ${className}`}
      style={{ rotate: `${rotate}deg`, color: c, border: `2.5px solid ${c}`, boxShadow: `inset 0 0 0 2px ${c}`, filter: "url(#sketch)", opacity: 0.85 }}
    >
      <span className="block text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ fontFamily: "var(--font-archivo)" }}>{children}</span>
    </div>
  );
}

function Annote({ children, className = "", light = false, rotate = -4, size = "text-2xl" }: { children: ReactNode; className?: string; light?: boolean; rotate?: number; size?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute font-semibold leading-none ${size} ${className}`} style={{ ...hand, color: light ? LIGHT : INK, rotate: `${rotate}deg` }}>
      {children}
    </span>
  );
}

function SketchArrow({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 130 90" fill="none" stroke={light ? LIGHT : INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={`pointer-events-none absolute ${className}`} style={{ filter: "url(#sketch)" }}>
      <path d="M10 16 C 46 2, 104 12, 112 62" />
      <path d="M112 62 l -17 -5 M112 62 l 6 -17" />
    </svg>
  );
}

function Barcode({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span aria-hidden className={`inline-flex h-9 items-stretch gap-[2px] ${className}`}>
      {BARS.map((w, i) => (
        <span key={i} style={{ width: w, backgroundColor: light ? LIGHT : INK }} />
      ))}
    </span>
  );
}

function FilterDefs() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
      <defs>
        <filter id="torn">
          <feTurbulence type="fractalNoise" baseFrequency="0.016 0.013" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="11" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="torn2">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.015" numOctaves="2" seed="23" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
        </filter>
        <filter id="ink">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" />
        </filter>
      </defs>
    </svg>
  );
}

/* ---------- 数据 ---------- */

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
  { n: "01", t: "SEARCH", d: "Hunt down any course by name, teacher, or department. The rating is right there.", v: "graph" as const, r: -1.5 },
  { n: "02", t: "REAL REVIEWS", d: "Grading, workload, payoff — four scores, plus honest write-ups and follow-ups.", v: "ruled" as const, r: 1.2 },
  { n: "03", t: "ANONYMOUS", d: "Only your nickname shows. Say the quiet part out loud, good or bad.", v: "plain" as const, r: -1 },
];

export default async function LandingPage() {
  const [user, hot] = await Promise.all([getCurrentUser(), getHotCourses()]);

  return (
    <div
      className={`${anton.variable} ${archivo.variable} ${caveat.variable} relative min-h-screen overflow-hidden text-[#0b0b0a]`}
      style={{
        fontFamily: "var(--font-archivo)",
        backgroundColor: "#dededb",
        backgroundImage: "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.45), transparent 55%), radial-gradient(100% 100% at 100% 100%, rgba(0,0,0,.12), transparent 55%)",
      }}
    >
      <FilterDefs />
      {/* 复印颗粒：multiply + overlay 两层 */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] opacity-[0.10] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[60] opacity-[0.06] mix-blend-overlay" style={{ backgroundImage: GRAIN, backgroundSize: "120px 120px" }} />

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
        {/* 大号淡数字 */}
        <span aria-hidden className="pointer-events-none absolute -left-2 top-24 select-none text-[16rem] leading-none text-[#0b0b0a]/[0.05] sm:text-[22rem]" style={disp}>01</span>
        {/* 竖排 SCROLL */}
        <span aria-hidden className="pointer-events-none absolute left-1 top-1/2 hidden -translate-y-1/2 text-[10px] uppercase tracking-[0.4em] text-[#0b0b0a]/45 [writing-mode:vertical-rl] lg:block">Scroll down ↓</span>
        {/* 角标 */}
        <span aria-hidden className="absolute right-3 top-3 text-[#0b0b0a]/35">+</span>
        <span aria-hidden className="absolute bottom-3 right-6 text-xs tracking-[0.3em] text-[#0b0b0a]/45" style={disp}>001</span>

        {/* —— 右上深色拼贴簇（照片 + 条码） —— */}
        <div className="collage-in absolute right-[2%] top-[2%] hidden w-72 md:block" style={{ animationDelay: "120ms" }}>
          <Scrap rotate={3} dark>
            <div className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <Barcode light className="h-7" />
                <span className="text-[9px] uppercase tracking-[0.2em] text-[#e9e9e4]/60">no.0001</span>
              </div>
              <div
                className="aspect-[4/3] w-full"
                style={{ backgroundColor: "#2a2a28", backgroundImage: "radial-gradient(#e9e9e4 28%, transparent 30%)", backgroundSize: "5px 5px" }}
              />
              <p className="mt-2 text-center text-[15px]" style={{ ...hand, color: LIGHT }}>lecture hall, 8am</p>
            </div>
          </Scrap>
        </div>

        {/* 深色短评（白字压黑纸） */}
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

        {/* 橡皮章 */}
        <div className="collage-in absolute right-[28%] top-[40%] hidden md:block" style={{ animationDelay: "420ms" }}>
          <Stamp rotate={-12}>Real reviews · no PR</Stamp>
        </div>

        {/* —— 主标题 —— */}
        <div className="relative z-10 max-w-4xl pt-10 md:pt-20">
          <Scrap rotate={-1.4} filterId="torn2" className="collage-in inline-block">
            <Tape className="-top-3 left-12 -rotate-3" />
            <Tape className="-top-3 right-24 rotate-6" />
            <div className="px-7 py-8 sm:px-12 sm:py-10">
              {/* 顶部小注 */}
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

          {/* 移动端精选 */}
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

      {/* 价值三片 */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-center text-[13px] font-bold uppercase tracking-[0.4em] text-[#0b0b0a]/60">How it works</h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {VALUES.map((v) => (
            <Scrap key={v.n} rotate={v.r} variant={v.v} className="collage-in">
              <div className={`px-6 py-7 ${v.v === "ruled" ? "pl-12" : ""}`}>
                <div className="text-6xl leading-none text-[#0b0b0a]/25" style={disp}>{v.n}</div>
                <h3 className="mt-3 text-lg font-black uppercase tracking-wide">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#0b0b0a]/75">{v.d}</p>
              </div>
            </Scrap>
          ))}
        </div>
      </section>

      {/* 热门课程 */}
      {hot.length > 0 && (
        <section className="relative z-10 mx-auto max-w-3xl px-6 pb-20">
          <div className="relative">
            <Annote className="-top-3 -right-1 z-10 hidden sm:block" rotate={6} size="text-3xl">must-takes ↓</Annote>
            <Scrap variant="ruled" rotate={-0.6} className="collage-in">
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

      {/* 底部 CTA：大黑撕纸块 */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <Scrap rotate={0.7} dark filterId="torn2" className="collage-in">
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

      {/* 版口 */}
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
