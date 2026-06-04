"use client";

import { useActionState } from "react";
import { inputCls, btnOutline } from "@/lib/ui";
import type { ReviewFormState } from "@/app/reviews/actions";

export function AppendForm({
  action,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
}) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-2">
      <textarea name="content" rows={3} placeholder="结课后补充？追加内容会以时间线展示，不覆盖原评价（10–2000 字）" className={inputCls} />
      {state?.fieldErrors?.content && <p className="text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.content[0]}</p>}
      {state?.error && <p className="text-xs font-bold text-[#0b0b0a]">{state.error}</p>}
      <button type="submit" disabled={pending} className={btnOutline}>
        {pending ? "追加中…" : "追加评价"}
      </button>
    </form>
  );
}
