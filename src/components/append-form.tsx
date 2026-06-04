"use client";

import { useActionState } from "react";
import type { ReviewFormState } from "@/app/reviews/actions";

export function AppendForm({
  action,
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
}) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-2">
      <textarea
        name="content"
        rows={3}
        placeholder="结课后补充？追加内容会以时间线展示，不覆盖原评价（10–2000 字）"
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {state?.fieldErrors?.content && (
        <p className="text-xs text-red-500">{state.fieldErrors.content[0]}</p>
      )}
      {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {pending ? "追加中…" : "追加评价"}
      </button>
    </form>
  );
}
