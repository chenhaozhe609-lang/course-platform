"use client";

import { useActionState } from "react";
import { updateNickname, updatePassword, type SettingsState } from "../actions";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900";

function Feedback({ state }: { state: SettingsState }) {
  if (state?.error) return <p className="text-sm text-red-500">{state.error}</p>;
  if (state?.ok) return <p className="text-sm text-emerald-600">{state.message}</p>;
  return null;
}

export function NicknameForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updateNickname,
    undefined,
  );
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="nickname" className="mb-1 block text-sm font-medium">昵称</label>
        <input id="nickname" name="nickname" defaultValue={current} className={inputCls} />
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "保存中…" : "保存昵称"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(
    updatePassword,
    undefined,
  );
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="oldPassword" className="mb-1 block text-sm font-medium">原密码</label>
        <input id="oldPassword" name="oldPassword" type="password" className={inputCls} autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium">新密码</label>
        <input id="newPassword" name="newPassword" type="password" className={inputCls} autoComplete="new-password" />
        <p className="mt-1 text-xs text-zinc-400">至少 8 位，含字母和数字</p>
      </div>
      <Feedback state={state} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "修改中…" : "修改密码"}
      </button>
    </form>
  );
}
