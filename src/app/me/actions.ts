"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/dal";
import { hashPassword, verifyPassword } from "@/lib/password";
import { nicknameSchema, passwordSchema } from "@/lib/validations/auth";

export type SettingsState =
  | { ok?: boolean; message?: string; error?: string }
  | undefined;

export async function updateNickname(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = nicknameSchema.safeParse(formData.get("nickname"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "昵称不合法" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { nickname: parsed.data },
  });

  revalidatePath("/me/settings");
  revalidatePath("/");
  return { ok: true, message: "昵称已更新" };
}

const passwordChangeSchema = z.object({
  oldPassword: z.string().min(1, { error: "请输入原密码" }),
  newPassword: passwordSchema,
});

export async function updatePassword(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = passwordChangeSchema.safeParse({
    oldPassword: formData.get("oldPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "输入不合法" };
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!record || !(await verifyPassword(parsed.data.oldPassword, record.passwordHash))) {
    return { error: "原密码错误" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return { ok: true, message: "密码已修改" };
}
