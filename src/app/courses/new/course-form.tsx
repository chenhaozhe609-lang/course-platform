"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitCourse, type SubmitCourseState } from "../actions";

const inputCls =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

export default function CourseForm() {
  const [state, action, pending] = useActionState<SubmitCourseState, FormData>(
    submitCourse,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          课程名 <span className="text-red-500">*</span>
        </label>
        <input id="name" name="name" className={inputCls} placeholder="如：数据结构" />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="teacher" className="mb-1 block text-sm font-medium">
          任课教师 <span className="text-red-500">*</span>
        </label>
        <input id="teacher" name="teacher" className={inputCls} placeholder="如：王强" />
        {state?.fieldErrors?.teacher && (
          <p className="mt-1 text-xs text-red-500">{state.fieldErrors.teacher[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="department" className="mb-1 block text-sm font-medium">
          开课院系 <span className="text-zinc-400">（选填）</span>
        </label>
        <input id="department" name="department" className={inputCls} placeholder="如：计算机学院" />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="type" className="mb-1 block text-sm font-medium">
            类型 <span className="text-zinc-400">（选填）</span>
          </label>
          <select id="type" name="type" defaultValue="" className={inputCls}>
            <option value="">未指定</option>
            <option value="required">必修</option>
            <option value="elective">选修</option>
            <option value="general">通识</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="credit" className="mb-1 block text-sm font-medium">
            学分 <span className="text-zinc-400">（选填）</span>
          </label>
          <input id="credit" name="credit" type="number" step="0.5" min="0" max="10" className={inputCls} placeholder="如：3" />
          {state?.fieldErrors?.credit && (
            <p className="mt-1 text-xs text-red-500">{state.fieldErrors.credit[0]}</p>
          )}
        </div>
      </div>

      {state?.error && (
        <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
          {state.error}
          {state.suggestionId && (
            <>
              ，
              <Link href={`/courses/${state.suggestionId}`} className="font-medium underline">
                前往「{state.suggestionName}」
              </Link>
            </>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {pending ? "提交中…" : "提交课程"}
      </button>

      <p className="text-xs text-zinc-400">
        提交后课程为「待审核」状态，审核通过前仅你自己可见，但你可以立即对它评价。
      </p>
    </form>
  );
}
