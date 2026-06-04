"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inputCls, btnPrimary } from "@/lib/ui";
import { register, type AuthState } from "./actions";

export default function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="studentNo" className="mb-1 block text-sm font-bold uppercase tracking-wide">学号</label>
        <input id="studentNo" name="studentNo" className={inputCls} autoComplete="username" />
        {state?.fieldErrors?.studentNo && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.studentNo[0]}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-bold uppercase tracking-wide">密码</label>
        <input id="password" name="password" type="password" className={inputCls} autoComplete="new-password" />
        {state?.fieldErrors?.password && (
          <ul className="mt-1 space-y-0.5">
            {state.fieldErrors.password.map((e) => (<li key={e} className="text-xs font-bold text-[#0b0b0a]">· {e}</li>))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="nickname" className="mb-1 block text-sm font-bold uppercase tracking-wide">昵称 <span className="font-normal text-[#0b0b0a]/45">（选填，留空自动生成）</span></label>
        <input id="nickname" name="nickname" className={inputCls} placeholder="前台展示的匿名昵称" />
        {state?.fieldErrors?.nickname && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.nickname[0]}</p>}
      </div>

      {state?.error && <p className="text-sm font-bold text-[#0b0b0a]">{state.error}</p>}

      <button type="submit" disabled={pending} className={`w-full ${btnPrimary}`}>
        {pending ? "注册中…" : "注册"}
      </button>

      <p className="text-center text-sm text-[#0b0b0a]/60">
        已有账号？{" "}
        <Link href="/login" className="font-bold underline">登录</Link>
      </p>
    </form>
  );
}
