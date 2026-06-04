"use client";

import { useActionState } from "react";
import { StarRatingInput } from "@/components/star-rating-input";
import { REVIEW_TAGS, RATING_DIMENSIONS } from "@/lib/validations/review";
import { inputCls, btnPrimary } from "@/lib/ui";
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
  const [state, formAction, pending] = useActionState<ReviewFormState, FormData>(action, undefined);
  const fe = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2.5 border-2 border-[#0b0b0a] p-4">
        {RATING_DIMENSIONS.map((d) => (
          <StarRatingInput key={d.key} name={d.key} label={d.label} defaultValue={defaults?.[d.key] ?? 0} error={fe[d.key]?.[0]} />
        ))}
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-bold uppercase tracking-wide">文字评价</label>
        <textarea id="content" name="content" rows={6} defaultValue={defaults?.content ?? ""} placeholder="说说这门课的真实体验：给分、作业、考试、收获……（10–2000 字）" className={inputCls} />
        {fe.content && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{fe.content[0]}</p>}
      </div>

      <div>
        <span className="mb-2 block text-sm font-bold uppercase tracking-wide">标签 <span className="font-normal text-[#0b0b0a]/45">（选填，最多 6 个）</span></span>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((t) => {
            const checked = defaults?.tags?.includes(t);
            return (
              <label key={t} className="cursor-pointer select-none border-2 border-[#0b0b0a] px-3 py-1 text-sm font-medium has-[:checked]:bg-[#0b0b0a] has-[:checked]:text-[#e9e9e4]">
                <input type="checkbox" name="tags" value={t} defaultChecked={checked} className="sr-only" />
                {t}
              </label>
            );
          })}
        </div>
        {fe.tags && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{fe.tags[0]}</p>}
      </div>

      <div>
        <label htmlFor="term" className="mb-1 block text-sm font-bold uppercase tracking-wide">修读学期 <span className="font-normal text-[#0b0b0a]/45">（选填）</span></label>
        <input id="term" name="term" defaultValue={defaults?.term ?? ""} placeholder="如：2025秋" className={inputCls} />
      </div>

      {state?.error && <p className="text-sm font-bold text-[#0b0b0a]">{state.error}</p>}

      <button type="submit" disabled={pending} className={`w-full ${btnPrimary}`}>
        {pending ? "提交中…" : submitLabel}
      </button>
    </form>
  );
}
