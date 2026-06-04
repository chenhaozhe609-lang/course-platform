import { requireUser } from "@/lib/dal";
import { SiteHeader } from "@/components/site-header";
import { MeNav } from "./me-nav";

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-4 text-xl font-semibold">个人中心</h1>
        <MeNav />
        {children}
      </main>
    </div>
  );
}
