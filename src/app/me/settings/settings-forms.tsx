"use client";

import { useActionState } from "react";
import { inputCls, btnPrimary } from "@/lib/ui";
import { updateNickname, updatePassword, type SettingsState } from "../actions";

function Feedback({ state }: { state: SettingsState }) {
  if (state?.error) return <p className="text-sm font-bold text-[#0b0b0a]">✕ {state.error}</p>;
  if (state?.ok) return <p className="text-sm font-bold text-[#0b0b0a]">✓ {state.message}</p>;
  return null;
}

export function NicknameForm({ current }: { current: string }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateNickname, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="nickname" className="mb-1 block text-sm font-bold uppercase tracking-wide">昵称</label>
        <input id="nickname" name="nickname" defaultValue={current} className={inputCls} />
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "保存中…" : "保存昵称"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updatePassword, undefined);
  return (
    <form action={action} className="space-y-3">
      <div>
        <label htmlFor="oldPassword" className="mb-1 block text-sm font-bold uppercase tracking-wide">原密码</label>
        <input id="oldPassword" name="oldPassword" type="password" className={inputCls} autoComplete="current-password" />
      </div>
      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-bold uppercase tracking-wide">新密码</label>
        <input id="newPassword" name="newPassword" type="password" className={inputCls} autoComplete="new-password" />
        <p className="mt-1 text-xs text-[#0b0b0a]/45">至少 8 位，含字母和数字</p>
      </div>
      <Feedback state={state} />
      <button type="submit" disabled={pending} className={btnPrimary}>{pending ? "修改中…" : "修改密码"}</button>
    </form>
  );
}
