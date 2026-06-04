import "server-only";

// 进程内固定窗口限流。
// 注意：单实例有效；多实例部署需替换为 Redis（INCR + EXPIRE）。

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
let lastSweep = 0;

function sweep(now: number) {
  // 偶尔清理过期键，避免 Map 无限增长
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, e] of store) if (now >= e.resetAt) store.delete(k);
}

export type RateResult = { ok: boolean; retryAfterSec: number };

export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);

  const e = store.get(key);
  if (!e || now >= e.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }
  if (e.count >= limit) {
    return { ok: false, retryAfterSec: Math.ceil((e.resetAt - now) / 1000) };
  }
  e.count += 1;
  return { ok: true, retryAfterSec: 0 };
}

// 常用窗口
export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
