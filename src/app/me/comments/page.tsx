import Link from "next/link";
import { requireUser } from "@/lib/dal";
import { listMyComments } from "@/lib/reviews";

function fmtDate(d: Date): string {
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function MyCommentsPage() {
  const user = await requireUser();
  const comments = await listMyComments(user.id);

  if (comments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700">
        你还没有发表评论。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {comments.map((c) => (
        <li key={c.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm text-zinc-800 dark:text-zinc-200">{c.content}</p>
          <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
            <span>{fmtDate(c.createdAt)}</span>
            <span>·</span>
            <Link href={`/courses/${c.review.course.id}`} className="hover:text-zinc-700 dark:hover:text-zinc-300">
              在《{c.review.course.name}》下的评论
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
