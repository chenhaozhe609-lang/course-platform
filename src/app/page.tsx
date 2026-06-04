import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Bodoni_Moda, Archivo, Caveat } from "next/font/google";
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
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

const serif: CSSProperties = { fontFamily: "var(--font-bodoni)" };
const hand: CSSProperties = { fontFamily: "var(--font-caveat)" };

const INK = "#211d17";
const PAPER = "#ece4d2";
const PEN_BLUE = "#284a86";
const PEN_RED = "#b5392c";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const RULED =
  "repeating-linear-gradient(to bottom, transparent 0 28px, rgba(40,74,134,0.16) 28px 29px)";
const GRAPH =
  "repeating-linear-gradient(to right, transparent 0 21px, rgba(40,74,134,0.10) 21px 22px), repeating-linear-gradient(to bottom, transparent 0 21px, rgba(40,74,134,0.10) 21px 22px)";

/* ---------- 拼贴原件 ---------- */

function Tape({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`absolute h-7 w-20 ${className}`}
      style={{
        background:
          "linear-gradient(110deg, rgba(226,219,196,.55), rgba(214,205,176,.42))",
        boxShadow: "0 1px 2px rgba(0,0,0,.12)",
        ...style,
      }}
    />
  );
}

function Scrap({
  children,
  className = "",
  rotate = 0,
  tone = PAPER,
  variant = "plain",
  filterId = "torn",
  style,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  tone?: string;
  variant?: "plain" | "ruled" | "graph";
  filterId?: "torn" | "torn2";
  style?: CSSProperties;
}) {
  const bg: CSSProperties = {
    backgroundColor: tone,
    filter: `url(#${filterId}) drop-shadow(2px 6px 5px rgba(40,30,12,.24))`,
  };
  if (variant === "ruled") {
    bg.backgroundImage = RULED;
  } else if (variant === "graph") {
    bg.backgroundImage = GRAPH;
  }
  return (
    <div className={`relative ${className}`} style={{ rotate: `${rotate}deg`, ...style }}>
      <div aria-hidden className="absolute inset-0" style={bg} />
      {variant === "ruled" && (
        <span aria-hidden className="absolute inset-y-0 left-10 w-px" style={{ background: "rgba(181,57,44,.45)" }} />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function Stamp({
  children,
  className = "",
  rotate = -9,
  color = PEN_RED,
}: {
  children: ReactNode;
  className?: string;
  rotate?: number;
  color?: string;
}) {
  return (
    <div
      className={`inline-block px-3 py-1.5 ${className}`}
      style={{
        rotate: `${rotate}deg`,
        color,
        border: `2.5px solid ${color}`,
        boxShadow: `inset 0 0 0 2px ${color}`,
        filter: "url(#sketch)",
        opacity: 0.82,
      }}
    >
      <span className="block text-[11px] font-extrabold uppercase tracking-[0.22em]" style={{ fontFamily: "var(--font-archivo)" }}>
        {children}
      </span>
    </div>
  );
}

function Annote({
  children,
  className = "",
  color = PEN_BLUE,
  rotate = -4,
  size = "text-2xl",
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  rotate?: number;
  size?: string;
}) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute font-semibold leading-none ${size} ${className}`}
      style={{ ...hand, color, rotate: `${rotate}deg` }}
    >
      {children}
    </span>
  );
}

function SketchArrow({ className = "", color = PEN_RED }: { className?: string; color?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 130 90"
      fill="none"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`pointer-events-none absolute ${className}`}
      style={{ filter: "url(#sketch)" }}
    >
      <path d="M10 16 C 46 2, 104 12, 112 62" />
      <path d="M112 62 l -17 -5 M112 62 l 6 -17" />
    </svg>
  );
}

function FilterDefs() {
  return (
    <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
      <defs>
        <filter id="torn">
          <feTurbulence type="fractalNoise" baseFrequency="0.016 0.013" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="torn2">
          <feTurbulence type="fractalNoise" baseFrequency="0.02 0.014" numOctaves="2" seed="19" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="13" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="sketch">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
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

const TICKER = [
  "DATA STRUCTURES", "GENEROUS GRADING", "EASY FINAL", "HIGHLY RECOMMEND",
  "TOO MUCH HOMEWORK", "THE PROF IS AMAZING", "MACHINE LEARNING",
  "ACTUALLY LEARNED A LOT", "HARD PASS", "WORTH IT",
];

const VALUES = [
  { n: "01", t: "SEARCH", d: "Hunt down any course by name, teacher, or department. The rating is right there.", v: "graph" as const, r: -1.5 },
  { n: "02", t: "REAL REVIEWS", d: "Grading, workload, payoff — four scores, plus honest write-ups and follow-ups.", v: "ruled" as const, r: 1.2 },
  { n: "03", t: "ANONYMOUS", d: "Only your nickname shows. Say the quiet part out loud, good or bad.", v: "plain" as const, r: -1 },
];

export default async function LandingPage() {
  const [user, hot] = await Promise.all([getCurrentUser(), getHotCourses()]);

  return (
    <div
      className={`${bodoni.variable} ${archivo.variable} ${caveat.variable} relative min-h-screen overflow-hidden text-[#211d17]`}
      style={{
        fontFamily: "var(--font-archivo)",
        backgroundColor: "#e7ddc8",
        backgroundImage:
          "radial-gradient(120% 80% at 15% 0%, rgba(255,252,244,.7), transparent 60%), radial-gradient(100% 90% at 90% 100%, rgba(120,96,40,.10), transparent 55%)",
      }}
    >
      <FilterDefs />
      {/* 纸面纤维颗粒 */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.07] mix-blend-multiply"
        style={{ backgroundImage: GRAIN }}
      />
      {/* 咖啡渍 */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[12%] top-[42%] hidden h-40 w-40 rounded-full md:block"
        style={{ boxShadow: "inset 0 0 0 6px rgba(120,80,30,.10)", border: "7px solid rgba(120,80,30,.09)" }}
      />

      {/* 报头 */}
      <header className="relative z-20 border-b-2 border-[#211d17]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-black tracking-tight">理工课探</span>
            <span className="hidden text-[10px] uppercase tracking-[0.3em] text-[#211d17]/55 sm:inline">
              Ligong Course Reviews · Est. 2026
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Link href="/courses" className="px-3 py-1.5 text-[#211d17]/70 transition-colors hover:text-[#211d17]">
              Browse
            </Link>
            {user ? (
              <Link href="/me" className="border-2 border-[#211d17] px-4 py-1.5 font-bold transition-colors hover:bg-[#211d17] hover:text-[#ece4d2]">
                {user.nickname}
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-3 py-1.5 text-[#211d17]/70 transition-colors hover:text-[#211d17]">
                  Log in
                </Link>
                <Link href="/register" className="bg-[#211d17] px-4 py-1.5 font-bold text-[#ece4d2] transition-transform hover:-translate-y-0.5">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO 拼贴 */}
      <section className="relative mx-auto min-h-[92vh] max-w-6xl px-6 py-14">
        {/* 角落套准十字 + 页码 */}
        <span aria-hidden className="absolute left-3 top-3 text-[#211d17]/35">+</span>
        <span aria-hidden className="absolute right-3 top-3 text-[#211d17]/35">+</span>
        <span aria-hidden className="absolute bottom-3 left-3 text-[#211d17]/35">+</span>
        <span aria-hidden className="absolute bottom-4 right-6 text-xs tracking-[0.3em] text-[#211d17]/45" style={serif}>001</span>

        {/* —— 桌面散落物件 —— */}
        {/* 便签：好评 */}
        <Scrap rotate={5} tone="#f4ecd4" filterId="torn2" className="collage-in absolute right-[3%] top-[6%] hidden w-60 md:block" style={{ animationDelay: "120ms" }}>
          <Tape className="-top-3 left-20 rotate-6" />
          <div className="px-5 py-4">
            <div className="text-lg tracking-widest text-[#b5392c]">★★★★★</div>
            <p className="mt-1 text-[15px] font-semibold leading-snug">“Generous grading, and I actually use this stuff now.”</p>
            <p className="mt-2 text-xs text-[#211d17]/55">— 数据结构</p>
          </div>
          <Annote className="-bottom-6 right-2" color={PEN_BLUE} rotate={-6} size="text-2xl">so true</Annote>
        </Scrap>

        {/* 横线纸：长评 */}
        <Scrap rotate={-3} variant="ruled" className="collage-in absolute right-[8%] top-[40%] hidden w-72 md:block" style={{ animationDelay: "260ms" }}>
          <Tape className="-top-3 right-10 -rotate-6" />
          <div className="px-5 py-4 pl-12">
            <p className="text-[15px] leading-[28px]" style={hand}>
              the prof actually cares.
              <br />took it twice. no regrets.
              <br />just bring coffee for 8am.
            </p>
          </div>
        </Scrap>

        {/* 橡皮章 */}
        <div className="collage-in absolute right-[30%] top-[3%] hidden md:block" style={{ animationDelay: "360ms" }}>
          <Stamp rotate={-12}>Real reviews · no PR</Stamp>
        </div>

        {/* 票根 */}
        <div className="collage-in absolute bottom-[8%] right-[6%] hidden w-56 md:block" style={{ animationDelay: "420ms" }}>
          <Scrap rotate={4} tone="#efe7d2">
            <div className="flex items-stretch">
              <div className="border-r-2 border-dashed border-[#211d17]/40 px-3 py-4 text-center">
                <div className="text-2xl font-black" style={serif}>01</div>
                <div className="text-[9px] uppercase tracking-widest text-[#211d17]/55">vol</div>
              </div>
              <div className="px-4 py-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#211d17]/60">Admit one</div>
                <div className="text-sm font-bold">Course Reviews</div>
                <div className="mt-1 text-[10px] text-[#211d17]/50">no. 0001 · 2026</div>
              </div>
            </div>
          </Scrap>
        </div>

        {/* 网点“印刷照片” */}
        <div className="collage-in absolute bottom-[20%] right-[34%] hidden w-44 md:block" style={{ animationDelay: "300ms" }}>
          <Scrap rotate={-5} tone="#efe7d2">
            <div className="p-2">
              <div
                className="aspect-[5/4] w-full"
                style={{
                  backgroundColor: "#cfc5ad",
                  backgroundImage: "radial-gradient(#211d17 32%, transparent 33%)",
                  backgroundSize: "6px 6px",
                }}
              />
              <p className="mt-1 text-center text-[15px]" style={{ ...hand, color: PEN_BLUE }}>lecture hall, 8am</p>
            </div>
          </Scrap>
        </div>

        {/* —— 主标题纸片 —— */}
        <div className="relative z-10 max-w-xl pt-6 md:pt-16">
          <Scrap rotate={-1.6} filterId="torn2" className="collage-in">
            <Tape className="-top-3 left-10 -rotate-3" />
            <Tape className="-top-3 right-16 rotate-6" />
            <div className="px-7 py-9 sm:px-10 sm:py-11">
              <p className="mb-3 text-[15px]" style={{ ...hand, color: PEN_BLUE }}>
                you've been picking courses on vibes. stop.
              </p>
              <h1 className="font-black leading-[0.86] tracking-[-0.02em]">
                <span className="block text-[clamp(3rem,10vw,6.8rem)]">STOP</span>
                <span className="relative inline-block">
                  <span className="block text-[clamp(2.4rem,8vw,5.4rem)] font-medium italic text-[#211d17]" style={serif}>
                    guessing
                  </span>
                  {/* 红圈手绘 */}
                  <svg aria-hidden viewBox="0 0 260 120" className="pointer-events-none absolute -inset-x-6 -inset-y-3 h-[140%] w-[120%]" fill="none" stroke={PEN_RED} strokeWidth="3" strokeLinecap="round" style={{ filter: "url(#sketch)" }}>
                    <path d="M30 60 C 30 24, 120 14, 180 22 C 236 30, 250 70, 210 92 C 160 116, 50 112, 24 78 C 14 64, 18 50, 40 44" />
                  </svg>
                </span>
                <span className="mt-1 block text-[clamp(1.5rem,4.5vw,2.6rem)] font-extrabold">
                  which course to take.
                </span>
              </h1>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-[#211d17]/75">
                Real reviews from students who actually sat through it — grading,
                workload, and whether you'll learn a thing. Anonymous and honest.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/courses" className="bg-[#211d17] px-7 py-3.5 text-center text-sm font-bold uppercase tracking-wide text-[#ece4d2] transition-transform hover:-translate-y-0.5">
                  Browse reviews →
                </Link>
                <Link href={user ? "/courses/new" : "/register"} className="border-2 border-[#211d17] px-7 py-3.5 text-center text-sm font-bold uppercase tracking-wide transition-colors hover:bg-[#211d17] hover:text-[#ece4d2]">
                  {user ? "Share a course" : "Write a review"}
                </Link>
              </div>
            </div>
          </Scrap>

          {/* 手写：指向 CTA */}
          <Annote className="-bottom-4 left-8 hidden md:block" color={PEN_RED} rotate={-7} size="text-3xl">
            start here!
          </Annote>
          <SketchArrow className="-bottom-12 left-44 hidden h-16 w-24 md:block" color={PEN_RED} />

          {/* 移动端精选碎片 */}
          <div className="mt-6 flex flex-wrap gap-3 md:hidden">
            <div className="border-2 border-[#211d17] px-3 py-1 text-sm font-semibold">★★★★★ Generous grading</div>
            <Stamp rotate={-4}>Real reviews</Stamp>
          </div>
        </div>
      </section>

      {/* 跑马灯（黑条胶带） */}
      <div className="relative z-20 overflow-hidden border-y-2 border-[#211d17] bg-[#211d17] py-3 text-[#ece4d2]">
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap pr-8 text-sm font-bold uppercase tracking-[0.2em]">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-8">
              {t}
              <span className="text-[#b5392c]">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 价值：三张纸片 */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-10 text-center text-[13px] font-bold uppercase tracking-[0.4em] text-[#211d17]/60">
          How it works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {VALUES.map((v) => (
            <Scrap key={v.n} rotate={v.r} variant={v.v} className="collage-in">
              <div className={`px-6 py-7 ${v.v === "ruled" ? "pl-12" : ""}`}>
                <div className="text-5xl font-medium text-[#211d17]/30" style={serif}>{v.n}</div>
                <h3 className="mt-2 text-lg font-black uppercase tracking-wide">{v.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#211d17]/75">{v.d}</p>
              </div>
            </Scrap>
          ))}
        </div>
      </section>

      {/* 热门课程：笔记本剪报 */}
      {hot.length > 0 && (
        <section className="relative z-10 mx-auto max-w-3xl px-6 pb-20">
          <div className="relative">
            <Annote className="-top-3 -right-2 z-10 hidden sm:block" color={PEN_RED} rotate={6} size="text-3xl">
              must-takes ↓
            </Annote>
            <Scrap variant="ruled" rotate={-0.6} className="collage-in">
              <div className="px-6 py-7 pl-12">
                <div className="mb-3 flex items-end justify-between border-b-2 border-[#211d17] pb-2">
                  <h2 className="text-2xl font-black uppercase tracking-tight">Top rated</h2>
                  <Link href="/courses" className="text-sm text-[#211d17]/60 transition-colors hover:text-[#211d17]">View all →</Link>
                </div>
                <ul>
                  {hot.map((c, i) => (
                    <li key={c.id}>
                      <Link href={`/courses/${c.id}`} className="group flex items-center gap-4 border-b border-[#211d17]/15 py-3.5 transition-colors hover:bg-[#211d17]/[0.04]">
                        <span className="w-9 shrink-0 text-2xl font-medium text-[#211d17]/30 group-hover:text-[#b5392c]" style={serif}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-bold">{c.name}</span>
                          <span className="text-sm text-[#211d17]/55">{c.teacher}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-lg font-black tabular-nums">{c.avg != null ? c.avg.toFixed(1) : "—"}</span>
                          <span className="text-xs text-[#211d17]/50">{c.count} reviews</span>
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
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <Scrap rotate={0.8} filterId="torn2" className="collage-in">
          <Tape className="-top-3 left-1/2 -translate-x-1/2 rotate-2" />
          <div className="px-8 py-14 text-center sm:px-16 sm:py-16">
            <div className="mb-5 flex justify-center">
              <Stamp rotate={-6}>Your turn</Stamp>
            </div>
            <h2 className="mx-auto max-w-2xl text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              One honest review saves a whole class{" "}
              <span className="italic font-medium" style={serif}>from a bad pick.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[15px] text-[#211d17]/70">
              Took a course? Write one. Picking one? Read first.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/courses" className="bg-[#211d17] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#ece4d2] transition-transform hover:-translate-y-0.5">
                Browse reviews →
              </Link>
              {!user && (
                <Link href="/register" className="border-2 border-[#211d17] px-7 py-3.5 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-[#211d17] hover:text-[#ece4d2]">
                  Create account
                </Link>
              )}
            </div>
          </div>
        </Scrap>
      </section>

      {/* 版口 */}
      <footer className="relative z-10 border-t-2 border-[#211d17]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-xs uppercase tracking-[0.2em] text-[#211d17]/55 sm:flex-row">
          <span>理工课探 — Campus Course Reviews</span>
          <span style={serif} className="tracking-[0.3em]">Vol.01 · 2026</span>
        </div>
      </footer>
    </div>
  );
}
