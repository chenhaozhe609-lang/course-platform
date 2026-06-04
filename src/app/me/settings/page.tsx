import { requireUser } from "@/lib/dal";
import { NicknameForm, PasswordForm } from "./settings-forms";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold">修改昵称</h2>
        <NicknameForm current={user.nickname} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold">修改密码</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
