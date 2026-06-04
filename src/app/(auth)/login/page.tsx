import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import LoginForm from "../login-form";

export default async function LoginPage() {
  // 已登录则不再展示登录页
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">理工课探</span>
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-5 text-lg font-semibold">登录</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
