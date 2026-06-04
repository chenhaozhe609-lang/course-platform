import { requireUser } from "@/lib/dal";
import { Scrap } from "@/components/collage";
import { disp } from "@/lib/ui";
import { NicknameForm, PasswordForm } from "./settings-forms";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <Scrap rotate={-0.5}>
        <div className="px-6 py-6">
          <h2 className="mb-4 text-xl uppercase" style={disp}>昵称</h2>
          <NicknameForm current={user.nickname} />
        </div>
      </Scrap>

      <Scrap rotate={0.5}>
        <div className="px-6 py-6">
          <h2 className="mb-4 text-xl uppercase" style={disp}>密码</h2>
          <PasswordForm />
        </div>
      </Scrap>
    </div>
  );
}
