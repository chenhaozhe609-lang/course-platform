import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/(auth)/actions";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">理工课探</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">在校学生的课程评价社区</span>
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/courses/new"
              className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              + 提交课程
            </Link>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{user.nickname}</span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                退出
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full px-3 py-1 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              注册
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
