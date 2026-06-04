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

/**
 * 某课程的可见评价列表（含作者昵称、追加、标签、评论，及当前用户的点赞/有用状态）。
 * 传 viewerId 时返回 myReactions（该用户对每条评价的反应）。
 */
export async function listReviews(
  courseId: string,
  sort: ReviewSort = "helpful",
  viewerId?: string,
) {
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
      comments: {
        where: { status: "visible" },
        orderBy: { createdAt: "asc" },
        include: { user: { select: { nickname: true } } },
      },
      // 仅取当前用户的反应；匿名用户用不存在的 id 得到空数组
      reactions: {
        where: { userId: viewerId ?? "__anonymous__" },
        select: { type: true },
      },
    },
  });

  return reviews.map((r) => ({
    ...r,
    tagList: parseTags(r.tags),
    myReactions: r.reactions.map((x) => x.type),
  }));
}

/** 当前用户对该课程已有的评价（用于「写评价 / 编辑我的评价」分流） */
export async function getMyReviewForCourse(courseId: string, userId: string) {
  return prisma.review.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { id: true },
  });
}

/** 个人中心：我发布的评价（含课程信息） */
export async function listMyReviews(userId: string) {
  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: { select: { id: true, name: true, teacher: true } },
      _count: { select: { comments: true } },
    },
  });
  return reviews.map((r) => ({ ...r, tagList: parseTags(r.tags) }));
}

/** 个人中心：我点赞/标记有用的评价 */
export async function listMyReactedReviews(
  userId: string,
  type: "like" | "helpful",
) {
  const reactions = await prisma.reaction.findMany({
    where: { userId, type },
    orderBy: { createdAt: "desc" },
    include: {
      review: {
        include: {
          user: { select: { nickname: true } },
          course: { select: { id: true, name: true } },
        },
      },
    },
  });
  // 过滤掉已被删除/隐藏的评价
  return reactions
    .map((r) => r.review)
    .filter((rv) => rv && rv.status === "visible");
}

/** 个人中心：我的评论（含所属评价与课程） */
export async function listMyComments(userId: string) {
  return prisma.comment.findMany({
    where: { userId, status: "visible" },
    orderBy: { createdAt: "desc" },
    include: {
      review: { select: { id: true, course: { select: { id: true, name: true } } } },
    },
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
