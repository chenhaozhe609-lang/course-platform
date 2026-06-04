// 只读星级展示（支持半星）。value 为 null 时显示占位。
export function RatingStars({
  value,
  size = "text-base",
}: {
  value: number | null;
  size?: string;
}) {
  if (value == null) {
    return <span className="text-sm text-[#0b0b0a]/40">暂无评分</span>;
  }
  const rounded = Math.round(value * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-0.5 ${size}`} aria-label={`${value.toFixed(1)} 分`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rounded >= i ? "full" : rounded >= i - 0.5 ? "half" : "empty";
        return (
          <span key={i} className="relative inline-block leading-none text-[#0b0b0a]/25">
            ★
            {fill !== "empty" && (
              <span
                className="absolute left-0 top-0 overflow-hidden text-[#0b0b0a]"
                style={{ width: fill === "full" ? "100%" : "50%" }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
