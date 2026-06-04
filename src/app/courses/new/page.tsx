import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { SiteHeader } from "@/components/site-header";
import { Scrap } from "@/components/collage";
import { disp } from "@/lib/ui";
import CourseForm from "./course-form";

export default async function NewCoursePage() {
  await requireUser();

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-10">
        <Link href="/courses" className="mb-4 inline-block text-sm font-bold uppercase tracking-wide text-[#0b0b0a]/55 transition-colors hover:text-[#0b0b0a]">← Courses</Link>
        <h1 className="text-3xl uppercase leading-none" style={disp}>Submit a course</h1>
        <p className="mb-6 mt-2 text-sm text-[#0b0b0a]/60">找不到想评价的课程？提交后即可对它评价。</p>
        <Scrap rotate={-0.6}>
          <div className="px-6 py-7"><CourseForm /></div>
        </Scrap>
      </main>
    </div>
  );
}
