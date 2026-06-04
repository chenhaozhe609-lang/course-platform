"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import {
  createReviewSchema,
  appendReviewSchema,
} from "@/lib/validations/review";

export type ReviewFormState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

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
