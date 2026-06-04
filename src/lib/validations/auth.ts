import * as z from "zod";

export const studentNoSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9]{6,20}$/, { error: "学号为 6–20 位字母或数字" });

export const passwordSchema = z
  .string()
  .min(8, { error: "密码至少 8 位" })
  .regex(/[A-Za-z]/, { error: "密码需包含字母" })
  .regex(/[0-9]/, { error: "密码需包含数字" });

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, { error: "昵称至少 2 个字符" })
  .max(20, { error: "昵称最多 20 个字符" });

export const registerSchema = z.object({
  studentNo: studentNoSchema,
  password: passwordSchema,
  // 允许留空：空字符串视为未填，注册时随机生成
  nickname: z.union([nicknameSchema, z.literal("")]).optional(),
});

export const loginSchema = z.object({
  studentNo: z.string().trim().min(1, { error: "请输入学号" }),
  password: z.string().min(1, { error: "请输入密码" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
