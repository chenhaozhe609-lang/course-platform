import Link from "next/link";
import { RatingStars } from "@/components/rating-stars";
import { Scrap } from "@/components/collage";
import { AddCommentForm } from "@/components/add-comment-form";
import {
  deleteReview,
  toggleReaction,
  addComment,
  deleteComment,
} from "@/app/reviews/actions";

type ReviewCardData = {
  id: string;
  userId: string;
  ratingOverall: number;
  ratingScore: number;
  ratingWorkload: number;
  ratingGain: number;
  content: string;
  term: string | null;
  helpfulCount: number;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: { nickname: string };
  tagList: string[];
  myReactions: string[];
  appends: { id: string; content: string; createdAt: Date }[];
  comments: { id: string; userId: string; content: string; createdAt: Date; user: { nickname: string } }[];
};

function fmtDate(d: Date): string {
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

const MINI = [
  { key: "ratingScore", label: "给分" },
  { key: "ratingWorkload", label: "作业轻松" },
  { key: "ratingGain", label: "收获" },
] as const;

function ReactionButton({ reviewId, type, label, count, active, loggedIn }: {
  reviewId: string; type: "like" | "helpful"; label: string; count: number; active: boolean; loggedIn: boolean;
}) {
  const cls = `flex items-center gap-1 border-2 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide transition-colors ${
    active ? "border-[#0b0b0a] bg-[#0b0b0a] text-[#e9e9e4]" : "border-[#0b0b0a]/70 text-[#0b0b0a]/70 hover:border-[#0b0b0a] hover:text-[#0b0b0a]"
  }`;
  const text = `${label} ${count}`;
  if (!loggedIn) return <Link href="/login" className={cls} title="登录后可操作">{text}</Link>;
  return (
    <form action={toggleReaction.bind(null, reviewId, type)}>
      <button type="submit" className={cls}>{text}</button>
    </form>
  );
}

export function ReviewCard({ review, currentUserId }: { review: ReviewCardData; currentUserId?: string }) {
  const isOwner = currentUserId != null && currentUserId === review.userId;
  const loggedIn = currentUserId != null;
  const edited = review.updatedAt.getTime() - review.createdAt.getTime() > 1000;

  return (
    <Scrap rotate={-0.3}>
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{review.user.nickname}</span>
            {review.term && <span className="border border-[#0b0b0a]/40 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[#0b0b0a]/60">{review.term}</span>}
          </div>
          <div className="flex items-center gap-2">
            <RatingStars value={review.ratingOverall} size="text-sm" />
            <span className="text-sm font-black">{review.ratingOverall.toFixed(1)}</span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#0b0b0a]/55">
          {MINI.map((m) => (<span key={m.key}>{m.label} {(review[m.key] as number).toFixed(1)}</span>))}
        </div>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#0b0b0a]/90">{review.content}</p>

        {review.tagList.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {review.tagList.map((t) => (<span key={t} className="border border-[#0b0b0a] px-2 py-0.5 text-xs font-medium">{t}</span>))}
          </div>
        )}

        {review.appends.length > 0 && (
          <div className="mt-3 space-y-2 border-l-2 border-[#0b0b0a] pl-3">
            {review.appends.map((a) => (
              <div key={a.id} className="text-sm">
                <span className="text-xs uppercase tracking-wide text-[#0b0b0a]/45">追评 · {fmtDate(a.createdAt)}</span>
                <p className="whitespace-pre-wrap text-[#0b0b0a]/80">{a.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-xs text-[#0b0b0a]/50">
          <div className="flex items-center gap-2">
            <ReactionButton reviewId={review.id} type="helpful" label="有用" count={review.helpfulCount} active={review.myReactions.includes("helpful")} loggedIn={loggedIn} />
            <ReactionButton reviewId={review.id} type="like" label="赞" count={review.likeCount} active={review.myReactions.includes("like")} loggedIn={loggedIn} />
            <span className="ml-1">{fmtDate(review.createdAt)}{edited ? "（已编辑）" : ""}</span>
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link href={`/reviews/${review.id}/edit`} className="border border-[#0b0b0a] px-2 py-0.5 font-bold uppercase tracking-wide hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">编辑</Link>
              <form action={deleteReview.bind(null, review.id)}>
                <button type="submit" className="border border-[#0b0b0a] px-2 py-0.5 font-bold uppercase tracking-wide hover:bg-[#0b0b0a] hover:text-[#e9e9e4]">删除</button>
              </form>
            </div>
          )}
        </div>

        {/* 评论区 */}
        <div className="mt-3 border-t-2 border-[#0b0b0a]/15 pt-3">
          {review.comments.length > 0 && (
            <ul className="mb-2 space-y-2">
              {review.comments.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-2 text-sm">
                  <p className="text-[#0b0b0a]/85">
                    <span className="font-bold">{c.user.nickname}</span>
                    <span className="mx-1 text-[#0b0b0a]/30">·</span>
                    <span className="whitespace-pre-wrap">{c.content}</span>
                  </p>
                  {currentUserId === c.userId && (
                    <form action={deleteComment.bind(null, c.id)}>
                      <button type="submit" className="shrink-0 text-xs text-[#0b0b0a]/40 hover:text-[#0b0b0a]">删除</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
          {loggedIn ? (
            <AddCommentForm action={addComment.bind(null, review.id)} />
          ) : (
            <Link href="/login" className="text-xs uppercase tracking-wide text-[#0b0b0a]/45 hover:text-[#0b0b0a]">登录后参与评论</Link>
          )}
        </div>
      </div>
    </Scrap>
  );
}
