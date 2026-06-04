import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export type CurrentUser = {
  id: string;
  nickname: string;
  role: string;
};

/**
 * 读取当前登录用户（安全校验：回查数据库确认账号存在且未封禁）。
 * 用 React cache 在单次渲染内去重，避免重复查询。
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, nickname: true, role: true, status: true },
  });

  if (!user || user.status === "banned") return null;

  return { id: user.id, nickname: user.nickname, role: user.role };
});

/** 要求已登录，否则重定向到登录页。返回当前用户。 */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** 要求管理员，否则重定向。 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}
