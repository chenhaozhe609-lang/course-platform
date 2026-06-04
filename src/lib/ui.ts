import type { CSSProperties } from "react";

// 黑白做旧拼贴 · 设计令牌（可在客户端组件安全引用，纯常量无 JSX）

export const INK = "#0b0b0a";
export const PAPER = "#dededb"; // 页面底
export const PAPER_CARD = "#efefec"; // 纸卡
export const PAPER_CARD2 = "#e6e6e2";
export const DARK = "#141413"; // 深色撕纸
export const FIBER = "#f3f3f0"; // 撕边纤维高光
export const LIGHT = "#e9e9e4"; // 深底上的字

export const disp: CSSProperties = { fontFamily: "var(--font-anton)" };
export const hand: CSSProperties = { fontFamily: "var(--font-caveat)" };

export const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const RULED =
  "repeating-linear-gradient(to bottom, transparent 0 28px, rgba(0,0,0,0.16) 28px 29px)";
export const GRAPH =
  "repeating-linear-gradient(to right, transparent 0 21px, rgba(0,0,0,0.09) 21px 22px), repeating-linear-gradient(to bottom, transparent 0 21px, rgba(0,0,0,0.09) 21px 22px)";

// 共享控件类
export const inputCls =
  "w-full border-2 border-[#0b0b0a] bg-[#efefec] px-3 py-2.5 text-sm text-[#0b0b0a] outline-none transition-colors focus:bg-white placeholder:text-[#0b0b0a]/45";
export const btnPrimary =
  "inline-block bg-[#0b0b0a] px-6 py-3 text-center text-sm font-bold uppercase tracking-wide text-[#e9e9e4] transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50";
export const btnOutline =
  "inline-block border-2 border-[#0b0b0a] px-6 py-3 text-center text-sm font-bold uppercase tracking-wide transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4] disabled:opacity-50";
export const chip =
  "inline-block border-2 border-[#0b0b0a] px-2.5 py-1 text-xs font-bold uppercase tracking-wide";
