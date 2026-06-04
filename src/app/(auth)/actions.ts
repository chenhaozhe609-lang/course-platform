"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";
import { generateNickname } from "@/lib/nickname";
import { registerSchema, loginSchema } from "@/lib/validations/auth";

export type AuthState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[]>;
    }
  | undefined;

// 登录防爆破：进程内内存计数（单实例有效，多实例上线需换 Redis）
const LOCK_LIMIT = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; firstAt: number }>();

function checkLock(key: string): boolean {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (Date.now() - rec.firstAt > LOCK_WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return rec.count >= LOCK_LIMIT;
}

function recordFailure(key: string): void {
  const rec = attempts.get(key);
  if (!rec || Date.now() - rec.firstAt > LOCK_WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
  } else {
    rec.count += 1;
  }
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    studentNo: formData.get("studentNo"),
    password: formData.get("password"),
    nickname: formData.get("nickname"),
  });

  if (!parsed.success) {
    return { fieldErrors: z_flatten(parsed.error) };
  }

  const { studentNo, password, nickname } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { studentNo } });
  if (existing) {
    return { error: "该学号已注册，请直接登录" };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      studentNo,
      passwordHash,
      nickname: nickname && nickname.length > 0 ? nickname : generateNickname(),
    },
    select: { id: true, role: true, nickname: true },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    nickname: user.nickname,
  });

  redirect("/");
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    studentNo: formData.get("studentNo"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z_flatten(parsed.error) };
  }

  const { studentNo, password } = parsed.data;

  if (checkLock(studentNo)) {
    return { error: "登录尝试过多，请 15 分钟后再试" };
  }

  const user = await prisma.user.findUnique({ where: { studentNo } });
  // 凭据错误统一返回，避免账号枚举
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    recordFailure(studentNo);
    return { error: "学号或密码错误" };
  }

  if (user.status === "banned") {
    return { error: "该账号已被封禁" };
  }

  attempts.delete(studentNo);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    userId: user.id,
    role: user.role,
    nickname: user.nickname,
  });

  redirect("/");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

// 把 ZodError 扁平化为 { field: string[] }
function z_flatten(error: {
  issues: { path: PropertyKey[]; message: string }[];
}): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
