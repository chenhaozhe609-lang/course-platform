import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listMyComments } from "@/lib/reviews";
import { Scrap } from "@/components/collage";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function MyCommentsPage() {
  const user = await requireUser();
  const comments = await listMyComments(user.id);

  if (comments.length === 0) {
    return (
      <Scrap rotate={-0.6}>
        <p className="px-6 py-12 text-center text-sm text-[#0b0b0a]/65">你还没有发表评论。</p>
      </Scrap>
    );
  }

  return (
    <ul className="space-y-4">
      {comments.map((c, i) => (
        <li key={c.id}>
          <Scrap rotate={i % 2 === 0 ? -0.4 : 0.4}>
            <div className="px-5 py-4">
              <p className="text-sm text-[#0b0b0a]/90">{c.content}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-[#0b0b0a]/50">
                <span>{fmtDate(c.createdAt)}</span>
                <span>·</span>
                <Link href={`/courses/${c.review.course.id}`} className="hover:text-[#0b0b0a]">在《{c.review.course.name}》下的评论</Link>
              </div>
            </div>
          </Scrap>
        </li>
      ))}
    </ul>
  );
}
