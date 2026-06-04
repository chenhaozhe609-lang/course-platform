"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ReviewFormState } from "@/app/reviews/actions";

export function AddCommentForm({
  action,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
}) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    action,
    undefined,
  );
  const ref = useRef<HTMLFormElement>(null);

  // 提交成功（无错误）后清空输入
  useEffect(() => {
    if (state === undefined) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="mt-2 flex items-start gap-2">
      <div className="flex-1">
        <input
          name="content"
          placeholder="写评论…"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {state?.fieldErrors?.content && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.content[0]}</p>
        )}
        {state?.error && <p className="mt-1 text-xs text-red-500">{state.error}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        发送
      </button>
    </form>
  );
}
