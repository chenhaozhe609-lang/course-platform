"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "./actions";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="studentNo" className="mb-1 block text-sm font-medium">
          学号
        </label>
        <input id="studentNo" name="studentNo" className={inputCls} autoComplete="username" />
        {state?.fieldErrors?.studentNo && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.studentNo[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          密码
        </label>
        <input id="password" name="password" type="password" className={inputCls} autoComplete="current-password" />
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.password[0]}</p>
        )}
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "登录中…" : "登录"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-zinc-900 underline dark:text-zinc-100">
          注册
        </Link>
      </p>
    </form>
  );
}
