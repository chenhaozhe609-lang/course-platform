import * as z from "zod";

export const COURSE_TYPES = ["required", "elective", "general"] as const;
export type CourseType = (typeof COURSE_TYPES)[number];

export const COURSE_TYPE_LABEL: Record<CourseType, string> = {
  required: "必修",
  elective: "选修",
  general: "通识",
};

// 空字符串/未填统一视为 undefined
const optionalText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined));

export const submitCourseSchema = z.object({
  name: z.string().trim().min(1, { error: "请填写课程名" }).max(60),
  teacher: z.string().trim().min(1, { error: "请填写任课教师" }).max(30),
  department: optionalText(30),
  type: z
    .union([z.enum(COURSE_TYPES), z.literal("")])
    .optional()
    .transform((v) => (v ? v : undefined)),
  credit: z
    .union([z.coerce.number().min(0).max(10), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : Number(v))),
});

export type SubmitCourseInput = z.infer<typeof submitCourseSchema>;
