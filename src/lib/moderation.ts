import "server-only";

// 基础敏感词钩子。V1 用内置小词表做"命中即拦截"；
// 生产应替换为可维护的词库或第三方内容安全服务（此函数是统一接入点）。

// 起步词表：广告/导流/明显辱骂的占位样例，按需扩充或外置。
const BANNED = [
  // 广告 / 导流 / 刷单
  "加微信",
  "加qq",
  "代写",
  "代考",
  "刷单",
  "兼职日结",
  "博彩",
  "赌博",
  "borrow money",
  "free money",
  "click here to win",
  // 明显辱骂（占位）
  "fuck",
  "shit",
  "傻逼",
  "废物",
];

// 归一化：转小写、去空白、全角转半角（简化版），降低绕过空间
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[！-～]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));
}

export type ModerationResult = { flagged: boolean; word?: string };

export function moderate(text: string): ModerationResult {
  if (!text) return { flagged: false };
  const n = normalize(text);
  for (const w of BANNED) {
    if (n.includes(normalize(w))) return { flagged: true, word: w };
  }
  return { flagged: false };
}
