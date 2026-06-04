import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const PAGE_SIZE = 12;
export const COURSE_SORTS = ["latest", "reviews"] as const;
export type CourseSort = (typeof COURSE_SORTS)[number];

export type CourseListQuery = {
  q?: string;
  department?: string;
  type?: string;
  sort?: string;
  page?: number;
};

/** 课程列表：仅已上架，支持关键词/院系/类型筛选与排序、分页 */
export async function listCourses(query: CourseListQuery) {
  const page = Math.max(1, query.page ?? 1);
  const where: Prisma.CourseWhereInput = { status: "published" };

  if (query.q) {
    const q = query.q.trim();
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { teacher: { contains: q } },
        { courseNo: { contains: q } },
      ];
    }
  }
  if (query.department) where.department = query.department;
  if (query.type) where.type = query.type;

  const orderBy: Prisma.CourseOrderByWithRelationInput =
    query.sort === "reviews"
      ? { reviews: { _count: "desc" } }
      : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { reviews: true } } },
    }),
    prisma.course.count({ where }),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE };
}

/** 用于筛选下拉的已上架院系清单 */
export async function listDepartments(): Promise<string[]> {
  const rows = await prisma.course.findMany({
    where: { status: "published", department: { not: null } },
    distinct: ["department"],
    select: { department: true },
    orderBy: { department: "asc" },
  });
  return rows.map((r) => r.department!).filter(Boolean);
}

/**
 * 课程详情：已上架对所有人可见；待审核仅提交者本人可见。
 * 返回 null 表示不存在或无权查看。
 */
export async function getCourseDetail(id: string, viewerId?: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { _count: { select: { reviews: true } } },
  });
  if (!course) return null;
  if (course.status !== "published" && course.submittedById !== viewerId) {
    return null;
  }

  const agg = await prisma.review.aggregate({
    where: { courseId: id, status: "visible" },
    _avg: {
      ratingOverall: true,
      ratingScore: true,
      ratingWorkload: true,
      ratingGain: true,
    },
    _count: true,
  });

  return {
    course,
    ratings: {
      overall: agg._avg.ratingOverall,
      score: agg._avg.ratingScore,
      workload: agg._avg.ratingWorkload,
      gain: agg._avg.ratingGain,
    },
    reviewCount: agg._count,
  };
}
