"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { submitCourseSchema } from "@/lib/validations/course";

export type SubmitCourseState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
      suggestionId?: string;
      suggestionName?: string;
    }
  | undefined;

export async function submitCourse(
  _prev: SubmitCourseState,
  formData: FormData,
): Promise<SubmitCourseState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = submitCourseSchema.safeParse({
    name: formData.get("name"),
    teacher: formData.get("teacher"),
    department: formData.get("department"),
    type: formData.get("type"),
    credit: formData.get("credit"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "_");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return { fieldErrors };
  }

  const { name, teacher, department, type, credit } = parsed.data;

  // 去重：同名同教师的已上架课程视为重复，引导去已有课程
  const dup = await prisma.course.findFirst({
    where: { name, teacher, status: "published" },
    select: { id: true, name: true },
  });
  if (dup) {
    return {
      error: "已存在同名同教师的课程",
      suggestionId: dup.id,
      suggestionName: dup.name,
    };
  }

  const course = await prisma.course.create({
    data: {
      name,
      teacher,
      department,
      type,
      credit,
      status: "pending",
      submittedById: user.id,
    },
    select: { id: true },
  });

  redirect(`/courses/${course.id}`);
}
