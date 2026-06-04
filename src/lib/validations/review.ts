import * as z from "zod";

// 预设快捷标签
export const REVIEW_TAGS = [
  "给分高",
  "考试简单",
  "作业少",
  "作业多",
  "点名严格",
  "老师好",
  "干货多",
  "收获大",
  "硬核",
  "水课",
  "推荐",
  "不推荐",
] as const;

export const RATING_DIMENSIONS = [
  { key: "ratingOverall", label: "综合推荐" },
  { key: "ratingScore", label: "给分情况" },
  { key: "ratingWorkload", label: "作业轻松" },
  { key: "ratingGain", label: "收获程度" },
] as const;

const rating = z.coerce
  .number({ error: "请评分" })
  .min(1, { error: "评分 1–5" })
  .max(5, { error: "评分 1–5" });

export const createReviewSchema = z.object({
  ratingOverall: rating,
  ratingScore: rating,
  ratingWorkload: rating,
  ratingGain: rating,
  content: z
    .string()
    .trim()
    .min(10, { error: "评价至少 10 字" })
    .max(2000, { error: "评价最多 2000 字" }),
  tags: z.array(z.string()).max(6, { error: "最多选 6 个标签" }).optional(),
  term: z
    .union([z.string().trim().max(20), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const appendReviewSchema = z.object({
  content: z
    .string()
    .trim()
    .min(10, { error: "追加内容至少 10 字" })
    .max(2000, { error: "追加内容最多 2000 字" }),
});

export const commentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { error: "评论不能为空" })
    .max(500, { error: "评论最多 500 字" }),
});

export const REACTION_TYPES = ["like", "helpful"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
