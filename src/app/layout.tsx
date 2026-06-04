import type { Metadata } from "next";
import "./globals.css";
import { fontVars } from "@/lib/fonts";
import { FilterDefs } from "@/components/collage";
import { GRAIN } from "@/lib/ui";

export const metadata: Metadata = {
  title: "理工课探 · 校园课程评价社区",
  description:
    "在校学生的课程评价社区：匿名分享真实选课体验，看清给分、作业与收获，帮你避开踩坑、选到好课。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${fontVars} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {/* 全站 SVG 滤镜（撕边 / 做旧 / 手绘） */}
        <FilterDefs />
        {/* 全站复印颗粒 */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60] opacity-[0.08] mix-blend-multiply"
          style={{ backgroundImage: GRAIN }}
        />
        {children}
      </body>
    </html>
  );
}
