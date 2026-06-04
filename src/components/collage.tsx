import type { CSSProperties, ReactNode } from "react";
import { INK, PAPER_CARD, DARK, FIBER, LIGHT, RULED, GRAPH } from "@/lib/ui";

// 黑白做旧拼贴 · 服务端可用的拼贴原件（撕边纸卡、胶带、橡皮章、手写、箭头、条码、滤镜）

const BARS = [3, 1, 2, 1, 4, 1, 2, 3, 1, 1, 2, 4, 1, 2, 1, 3, 1, 2, 2, 1, 4, 1, 2, 1, 3];

export function FilterDefs() {
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

export function Tape({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      className={`absolute h-7 w-20 ${className}`}
      style={{ background: "linear-gradient(110deg, rgba(180,180,176,.5), rgba(150,150,146,.38))", boxShadow: "0 1px 2px rgba(0,0,0,.18)", ...style }}
    />
  );
}

export function Scrap({
  children,
  className = "",
  rotate = 0,
  tone = PAPER_CARD,
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
    filter: `url(#${filterId}) drop-shadow(2px 6px 6px rgba(0,0,0,${dark ? 0.45 : 0.2}))`,
  };
  if (variant === "ruled") main.backgroundImage = RULED;
  else if (variant === "graph") main.backgroundImage = GRAPH;
  return (
    <div className={`relative ${className}`} style={{ rotate: `${rotate}deg`, ...style }}>
      <div aria-hidden className="absolute -inset-[3px]" style={{ backgroundColor: FIBER, filter: "url(#torn2)" }} />
      <div aria-hidden className="absolute inset-0" style={main} />
      {variant === "ruled" && <span aria-hidden className="absolute inset-y-0 left-10 w-px" style={{ background: "rgba(0,0,0,.3)" }} />}
      <div className="relative">{children}</div>
    </div>
  );
}

export function Stamp({ children, className = "", rotate = -9, light = false }: { children: ReactNode; className?: string; rotate?: number; light?: boolean }) {
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

export function Annote({ children, className = "", light = false, rotate = -4, size = "text-2xl" }: { children: ReactNode; className?: string; light?: boolean; rotate?: number; size?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute font-semibold leading-none ${size} ${className}`} style={{ fontFamily: "var(--font-caveat)", color: light ? LIGHT : INK, rotate: `${rotate}deg` }}>
      {children}
    </span>
  );
}

export function SketchArrow({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 130 90" fill="none" stroke={light ? LIGHT : INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className={`pointer-events-none absolute ${className}`} style={{ filter: "url(#sketch)" }}>
      <path d="M10 16 C 46 2, 104 12, 112 62" />
      <path d="M112 62 l -17 -5 M112 62 l 6 -17" />
    </svg>
  );
}

export function Barcode({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <span aria-hidden className={`inline-flex h-9 items-stretch gap-[2px] ${className}`}>
      {BARS.map((w, i) => (
        <span key={i} style={{ width: w, backgroundColor: light ? LIGHT : INK }} />
      ))}
    </span>
  );
}
