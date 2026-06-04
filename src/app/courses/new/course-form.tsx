"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inputCls, btnPrimary } from "@/lib/ui";
import { submitCourse, type SubmitCourseState } from "../actions";

const selectCls = "w-full border-2 border-[#0b0b0a] bg-[#efefec] px-3 py-2.5 text-sm outline-none";

export default function CourseForm() {
  const [state, action, pending] = useActionState<SubmitCourseState, FormData>(submitCourse, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-bold uppercase tracking-wide">课程名 <span className="text-[#0b0b0a]">*</span></label>
        <input id="name" name="name" className={inputCls} placeholder="如：数据结构" />
        {state?.fieldErrors?.name && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="teacher" className="mb-1 block text-sm font-bold uppercase tracking-wide">任课教师 <span className="text-[#0b0b0a]">*</span></label>
        <input id="teacher" name="teacher" className={inputCls} placeholder="如：王强" />
        {state?.fieldErrors?.teacher && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.teacher[0]}</p>}
      </div>

      <div>
        <label htmlFor="department" className="mb-1 block text-sm font-bold uppercase tracking-wide">开课院系 <span className="font-normal text-[#0b0b0a]/45">（选填）</span></label>
        <input id="department" name="department" className={inputCls} placeholder="如：计算机学院" />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="type" className="mb-1 block text-sm font-bold uppercase tracking-wide">类型</label>
          <select id="type" name="type" defaultValue="" className={selectCls}>
            <option value="">未指定</option>
            <option value="required">必修</option>
            <option value="elective">选修</option>
            <option value="general">通识</option>
          </select>
        </div>
        <div className="flex-1">
          <label htmlFor="credit" className="mb-1 block text-sm font-bold uppercase tracking-wide">学分</label>
          <input id="credit" name="credit" type="number" step="0.5" min="0" max="10" className={inputCls} placeholder="如：3" />
          {state?.fieldErrors?.credit && <p className="mt-1 text-xs font-bold text-[#0b0b0a]">{state.fieldErrors.credit[0]}</p>}
        </div>
      </div>

      {state?.error && (
        <div className="border-2 border-[#0b0b0a] bg-[#efefec] p-3 text-sm">
          {state.error}
          {state.suggestionId && (
            <>，<Link href={`/courses/${state.suggestionId}`} className="font-bold underline">前往「{state.suggestionName}」</Link></>
          )}
        </div>
      )}

      <button type="submit" disabled={pending} className={`w-full ${btnPrimary}`}>
        {pending ? "提交中…" : "提交课程"}
      </button>

      <p className="text-xs text-[#0b0b0a]/50">提交后课程为「待审核」状态，审核通过前仅你自己可见，但你可以立即对它评价。</p>
    </form>
  );
}
