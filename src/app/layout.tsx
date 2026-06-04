import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

// 拉丁字体用 Sora（克制几何无衬线，非 Inter/Geist 套路）；中文走系统 CJK 栈（见 globals.css）。
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

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
    <html lang="zh-CN" className={`${sora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
