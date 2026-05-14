import { Link } from "react-router-dom";
import ActionMemu from "./ActionMemu";

export default function ViewFeedItem({
  feedItem,
  onToggleLike,
  isLikeLoading,
  likeErrorMessage,
}) {
  return (
    // 피드 상세 페이지에서 보여지는 피드 아이템
    <section className="mx-auto mt-10 w-full max-w-4xl px-4 sm:px-6">
      <article className="rounded-4xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
        <ul
          aria-label="태그 목록"
          className="mb-6 flex flex-wrap gap-2 text-sm font-medium text-gray-500"
        >
          {feedItem.tags.map((tag) => (
            <li key={tag}>
              <span className="inline-flex rounded-full bg-gray-100 px-4 py-2">
                {tag}
              </span>
            </li>
          ))}
        </ul>
        <blockquote className="text-center">
          <h2 className="text-2xl font-semibold leading-10 text-gray-900 sm:text-3xl">
            {feedItem.content}
          </h2>
          <p className="mt-4 text-base text-gray-500">- {feedItem.author} -</p>
        </blockquote>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {/* 좋아요 상태(isLiked)와 요청 상태(isLikeLoading)를 버튼 UI에 반영 */}
          <button
            type="button"
            onClick={onToggleLike}
            disabled={isLikeLoading}
            aria-pressed={Boolean(feedItem.isLiked)}
            className={`rounded-full border px-6 py-3 text-sm font-medium transition ${
              feedItem.isLiked
                ? "border-[#2D394E] bg-[#2D394E] text-white"
                : "border-gray-200 text-gray-700 hover:border-gray-300 hover:text-gray-900"
            } ${isLikeLoading ? "cursor-not-allowed opacity-60" : ""}`}
          >
            좋아요 {feedItem.likeCount ?? 0}
          </button>
          {feedItem.referenceUrl ? (
            <Link
              to={feedItem.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:text-gray-900"
            >
              {feedItem.referenceTitle || "출처"}
            </Link>
          ) : null}
        </div>
        {/* 요청 실패 시 View에서 전달한 메시지를 표시 */}
        {likeErrorMessage && (
          <p className="mt-3 text-center text-sm text-red-500">
            {likeErrorMessage}
          </p>
        )}
        {/* 내 글일 때만 액션 메뉴 노출 */}
        {feedItem.isMine && <ActionMemu />}
      </article>
    </section>
  );
}
