import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/dal";
import { Scrap, Stamp } from "@/components/collage";
import { disp } from "@/lib/ui";
import LoginForm from "../login-form";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/courses");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 block text-center text-2xl font-black tracking-tight">理工课探</Link>
        <div className="relative">
          <div className="absolute -right-4 -top-4 z-10 hidden sm:block"><Stamp rotate={8}>Welcome back</Stamp></div>
          <Scrap rotate={-1}>
            <div className="px-6 py-7">
              <h1 className="mb-5 text-2xl uppercase" style={disp}>Log in</h1>
              <LoginForm />
            </div>
          </Scrap>
        </div>
      </div>
    </div>
  );
}
