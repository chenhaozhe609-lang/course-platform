import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { Scrap, Stamp } from "@/components/collage";
import { disp } from "@/lib/ui";
import RegisterForm from "../register-form";

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/courses");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center text-2xl font-black tracking-tight">理工课探</Link>
        <div className="relative">
          <div className="absolute -left-4 -top-4 z-10 hidden sm:block"><Stamp rotate={-9}>Free forever</Stamp></div>
          <Scrap rotate={1}>
            <div className="px-6 py-7">
              <h1 className="text-2xl uppercase" style={disp}>Sign up</h1>
              <p className="mb-5 mt-1 text-sm text-[#0b0b0a]/60">学号即账号，自助注册，无需校验真实名单。</p>
              <RegisterForm />
            </div>
          </Scrap>
        </div>
      </div>
    </div>
  );
}
