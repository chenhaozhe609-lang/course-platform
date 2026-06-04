"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/me", label: "我的评价" },
  { href: "/me/reactions", label: "我赞过的" },
  { href: "/me/comments", label: "我的评论" },
  { href: "/me/settings", label: "账号设置" },
];

export function MeNav() {
  const pathname = usePathname();
  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b-2 border-[#0b0b0a] pb-3">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors ${
              active ? "bg-[#0b0b0a] text-[#e9e9e4]" : "text-[#0b0b0a]/55 hover:text-[#0b0b0a]"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
