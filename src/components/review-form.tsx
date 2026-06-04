"use client";

import { useActionState } from "react";
import { StarRatingInput } from "@/components/star-rating-input";
import { REVIEW_TAGS, RATING_DIMENSIONS } from "@/lib/validations/review";
import type { ReviewFormState } from "@/app/reviews/actions";

export type ReviewDefaults = {
  ratingOverall?: number;
  ratingScore?: number;
  ratingWorkload?: number;
  ratingGain?: number;
  content?: string;
  tags?: string[];
  term?: string | null;
};

export function ReviewForm({
  action,
  defaults,
  submitLabel = "发布评价",
}: {
  action: (state: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  defaults?: ReviewDefaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(
    action,
    undefined,
  );
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2.5 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
        {RATING_DIMENSIONS.map((d) => (
          <StarRatingInput
            key={d.key}
            name={d.key}
            label={d.label}
            defaultValue={defaults?.[d.key] ?? 0}
            error={fe[d.key]?.[0]}
          />
        ))}
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium">
          文字评价
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          defaultValue={defaults?.content ?? ""}
          placeholder="说说这门课的真实体验：给分、作业、考试、收获……（10–2000 字）"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {fe.content && <p className="mt-1 text-xs text-red-500">{fe.content[0]}</p>}
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">
          标签 <span className="text-zinc-400">（选填，最多 6 个）</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((t) => {
            const checked = defaults?.tags?.includes(t);
            return (
              <label
                key={t}
                className="cursor-pointer select-none rounded-full border border-zinc-300 px-3 py-1 text-sm has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50 has-[:checked]:text-amber-700 dark:border-zinc-700 dark:has-[:checked]:bg-amber-900/30 dark:has-[:checked]:text-amber-400"
              >
                <input type="checkbox" name="tags" value={t} defaultChecked={checked} className="sr-only" />
                {t}
              </label>
            );
          })}
        </div>
        {fe.tags && <p className="mt-1 text-xs text-red-500">{fe.tags[0]}</p>}
      </div>

      <div>
        <label htmlFor="term" className="mb-1 block text-sm font-medium">
          修读学期 <span className="text-zinc-400">（选填）</span>
        </label>
        <input
          id="term"
          name="term"
          defaultValue={defaults?.term ?? ""}
          placeholder="如：2025秋"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "提交中…" : submitLabel}
      </button>
    </form>
  );
}
