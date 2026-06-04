"use client";

import { useActionState, useEffect, useRef } from "react";
import { inputCls } from "@/lib/ui";
import type { ReviewFormState } from "@/app/reviews/actions";

export function AddCommentForm({
  action,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
}) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(action, undefined);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state === undefined) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="mt-2 flex items-start gap-2">
      <div className="flex-1">
        <input name="content" placeholder="写评论…" className={inputCls} />
        {state?.fieldErrors?.content && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.content[0]}</p>}
        {state?.error && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.error}</p>}
      </div>
      <button type="submit" disabled={pending} className="shrink-0 border-2 border-[#0b0b0a] px-3 py-2.5 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-[#0b0b0a] hover:text-[#e9e9e4] disabled:opacity-50">
        发送
      </button>
    </form>
  );
}
