"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inputCls, btnPrimary } from "@/lib/ui";
import { login, type AuthState } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="studentNo" className="mb-1 block text-sm font-bold uppercase tracking-wide">学号</label>
        <input id="studentNo" name="studentNo" className={inputCls} autoComplete="username" />
        {state?.fieldErrors?.studentNo && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.studentNo[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-bold uppercase tracking-wide">密码</label>
        <input id="password" name="password" type="password" className={inputCls} autoComplete="current-password" />
        {state?.fieldErrors?.password && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.password[0]}</p>}
      </div>

      {state?.error && <p className="text-sm font-bold text-[#0b0b0a]">{state.error}</p>}

      <button type="submit" disabled={pending} className={`w-full ${btnPrimary}`}>
        {pending ? "登录中…" : "登录"}
      </button>

      <p className="text-center text-sm text-[#0b0b0a]/60">
        还没有账号？{" "}
        <Link href="/register" className="font-bold underline">注册</Link>
      </p>
    </form>
  );
}
