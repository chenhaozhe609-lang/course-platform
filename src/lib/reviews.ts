import { prisma } from "@/lib/db";

export const REVIEW_SORTS = ["helpful", "latest"] as const;
export type ReviewSort = (typeof REVIEW_SORTS)[number];

export function parseTags(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((t) => typeof t === "string") : [];
  } catch {
    return [];
  }
}

/** 某课程的可见评价列表（含作者昵称、追加、解析后的标签） */
export async function listReviews(courseId: string, sort: ReviewSort = "helpful") {
  const orderBy =
    sort === "latest"
      ? [{ createdAt: "desc" as const }]
      : [{ helpfulCount: "desc" as const }, { createdAt: "desc" as const }];

  const reviews = await prisma.review.findMany({
    where: { courseId, status: "visible" },
    orderBy,
    include: {
      user: { select: { nickname: true } },
      appends: { orderBy: { createdAt: "asc" } },
    },
  });

  return reviews.map((r) => ({ ...r, tagList: parseTags(r.tags) }));
}

/** 当前用户对该课程已有的评价（用于「写评价 / 编辑我的评价」分流） */
export async function getMyReviewForCourse(courseId: string, userId: string) {
  return prisma.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
}

/** 取一条属于当前用户的评价用于编辑；非作者返回 null */
export async function getOwnedReview(reviewId: string, userId: string) {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      course: { select: { id: true, name: true } },
      appends: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!review || review.userId !== userId) return null;
  return { ...review, tagList: parseTags(review.tags) };
}
