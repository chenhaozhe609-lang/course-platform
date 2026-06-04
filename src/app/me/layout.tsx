import { requireUser } from "@/lib/dal";
import { SiteHeader } from "@/components/site-header";
import { disp } from "@/lib/ui";
import { MeNav } from "./me-nav";

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-4 text-4xl uppercase leading-none" style={disp}>My desk</h1>
        <MeNav />
        {children}
      </main>
    </div>
  );
}
