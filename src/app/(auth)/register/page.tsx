import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import RegisterForm from "../register-form";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center">
          <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">理工课探</span>
        </Link>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="mb-1 text-lg font-semibold">注册</h1>
          <p className="mb-5 text-sm text-zinc-500">学号即账号，自助注册，无需校验真实名单。</p>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
