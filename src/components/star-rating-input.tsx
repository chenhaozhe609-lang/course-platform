"use client";

import { useState } from "react";

// 可点选星级输入（整数 1–5），值写入隐藏 input 供表单提交。
export function StarRatingInput({
  name,
  label,
  defaultValue = 0,
  error,
}: {
  name: string;
  label: string;
  defaultValue?: number;
  error?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input type="hidden" name={name} value={value || ""} />
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i} 星`}
              onClick={() => setValue(i)}
              onMouseEnter={() => setHover(i)}
              className={`px-0.5 text-2xl leading-none transition-colors ${
                shown >= i ? "text-amber-500" : "text-zinc-300 dark:text-zinc-600"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="w-6 text-sm text-zinc-400">{value || "—"}</span>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    </div>
  );
}
