"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { rateLimit, HOUR, DAY } from "@/lib/ratelimit";
import { moderate } from "@/lib/moderation";
import {
  createReviewSchema,
  appendReviewSchema,
  commentSchema,
  REACTION_TYPES,
  type ReactionType,
} from "@/lib/validations/review";

export type ReviewFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

function tooFast(retryAfterSec: number): ReviewFormState {
  const min = Math.max(1, Math.ceil(retryAfterSec / 60));
  return { error: `操作过于频繁，请约 ${min} 分钟后再试` };
}

const FLAGGED: ReviewFormState = { error: "内容包含不当词汇，请修改后重新发布" };

function flattenZod(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}

function parseReviewForm(formData: FormData) {
  return createReviewSchema.safeParse({
    ratingOverall: formData.get("ratingOverall"),
    ratingScore: formData.get("ratingScore"),
    ratingWorkload: formData.get("ratingWorkload"),
    ratingGain: formData.get("ratingGain"),
    content: formData.get("content"),
    tags: formData.getAll("tags").map(String),
    term: formData.get("term"),
  });
}

export async function createReview(
  courseId: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // 课程必须存在，且已上架或为本人提交（待审核）
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, status: true, submittedById: true },
  });
  if (!course || (course.status !== "published" && course.submittedById !== user.id)) {
    return { error: "课程不存在或不可评价" };
  }

  // 一人一课一评
  const existing = await prisma.review.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  });
  if (existing) redirect(`/reviews/${existing.id}/edit`);

  const parsed = parseReviewForm(formData);
  if (!parsed.success) return { fieldErrors: flattenZod(parsed.error) };

  const rl = rateLimit(`review:${user.id}`, 10, DAY);
  if (!rl.ok) return tooFast(rl.retryAfterSec);
  if (moderate(parsed.data.content).flagged) return FLAGGED;

  const { tags, ...rest } = parsed.data;
  await prisma.review.create({
    data: {
      ...rest,
      tags: tags && tags.length ? JSON.stringify(tags) : null,
      userId: user.id,
      courseId,
    },
  });

  redirect(`/courses/${courseId}`);
}

export async function updateReview(
  reviewId: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, courseId: true },
  });
  if (!review || review.userId !== user.id) {
    return { error: "无权编辑该评价" };
  }

  const parsed = parseReviewForm(formData);
  if (!parsed.success) return { fieldErrors: flattenZod(parsed.error) };
  if (moderate(parsed.data.content).flagged) return FLAGGED;

  const { tags, ...rest } = parsed.data;
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...rest,
      tags: tags && tags.length ? JSON.stringify(tags) : null,
    },
  });

  redirect(`/courses/${review.courseId}`);
}

export async function appendReview(
  reviewId: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, courseId: true },
  });
  if (!review || review.userId !== user.id) {
    return { error: "无权追加该评价" };
  }

  const parsed = appendReviewSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { fieldErrors: flattenZod(parsed.error) };

  const rl = rateLimit(`append:${user.id}`, 20, DAY);
  if (!rl.ok) return tooFast(rl.retryAfterSec);
  if (moderate(parsed.data.content).flagged) return FLAGGED;

  await prisma.reviewAppend.create({
    data: { reviewId, content: parsed.data.content },
  });

  redirect(`/courses/${review.courseId}`);
}

export async function deleteReview(reviewId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { userId: true, courseId: true },
  });
  if (!review || review.userId !== user.id) redirect("/");

  await prisma.review.delete({ where: { id: reviewId } });
  redirect(`/courses/${review.courseId}`);
}

/** 点赞 / 标记有用：切换开关，事务内同步冗余计数 */
export async function toggleReaction(
  reviewId: string,
  type: ReactionType,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!REACTION_TYPES.includes(type)) return;
  if (!rateLimit(`reaction:${user.id}`, 200, HOUR).ok) return;

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { courseId: true },
  });
  if (!review) return;

  const existing = await prisma.reaction.findUnique({
    where: { userId_reviewId_type: { userId: user.id, reviewId, type } },
    select: { id: true },
  });

  const countField = type === "like" ? "likeCount" : "helpfulCount";

  if (existing) {
    await prisma.$transaction([
      prisma.reaction.delete({ where: { id: existing.id } }),
      prisma.review.update({
        where: { id: reviewId },
        data: { [countField]: { decrement: 1 } },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.reaction.create({ data: { userId: user.id, reviewId, type } }),
      prisma.review.update({
        where: { id: reviewId },
        data: { [countField]: { increment: 1 } },
      }),
    ]);
  }

  revalidatePath(`/courses/${review.courseId}`);
}

/** 发表评论（单层） */
export async function addComment(
  reviewId: string,
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { courseId: true },
  });
  if (!review) return { error: "评价不存在" };

  const parsed = commentSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { fieldErrors: flattenZod(parsed.error) };

  const rl = rateLimit(`comment:${user.id}`, 30, HOUR);
  if (!rl.ok) return tooFast(rl.retryAfterSec);
  if (moderate(parsed.data.content).flagged) return FLAGGED;

  await prisma.comment.create({
    data: { reviewId, userId: user.id, content: parsed.data.content },
  });

  revalidatePath(`/courses/${review.courseId}`);
  return undefined;
}

/** 删除自己的评论 */
export async function deleteComment(commentId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, review: { select: { courseId: true } } },
  });
  if (!comment || comment.userId !== user.id) return;

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/courses/${comment.review.courseId}`);
}
