import Link from "next/link";
import { getCurrentUser } from "@/lib/dal";
import { logout } from "@/app/(auth)/actions";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b-2 border-[#0b0b0a]">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-lg font-black tracking-tight">理工课探</span>
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-[#0b0b0a]/55 sm:inline">
            Course Reviews
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/courses/new"
              className="bg-[#0b0b0a] px-3 py-1.5 font-bold uppercase tracking-wide text-[#e9e9e4] transition-transform hover:-translate-y-0.5"
            >
              + Course
            </Link>
            <Link
              href="/me"
              className="border-2 border-[#0b0b0a] px-3 py-1.5 font-bold transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4]"
            >
              {user.nickname}
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="px-2 py-1.5 text-xs uppercase tracking-wide text-[#0b0b0a]/55 transition-colors hover:text-[#0b0b0a]"
              >
                Out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm">
            <Link href="/login" className="px-3 py-1.5 text-[#0b0b0a]/70 transition-colors hover:text-[#0b0b0a]">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-[#0b0b0a] px-4 py-1.5 font-bold uppercase tracking-wide text-[#e9e9e4] transition-transform hover:-translate-y-0.5"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
