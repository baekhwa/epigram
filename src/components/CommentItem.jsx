export default function CommentItem({ comment }) {
  return (
    <>
      {/* 댓글 하나 */}
      <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              <img
                src={comment.category}
                alt="카테고리 이미지"
                className="mr-2 h-4 w-4 rounded-full"
              />
            </span>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-gray-900">
                {comment.author}
              </span>
              <time className="text-gray-400">{comment.createdAt}</time>
            </div>
          </div>

          {comment.isMine && (
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <button type="button" className="transition hover:text-gray-700">
                수정
              </button>
              <button type="button" className="transition hover:text-red-500">
                삭제
              </button>
            </div>
          )}
        </div>

        <p className="text-sm leading-6 text-gray-700">{comment.body}</p>
      </article>
    </>
  );
}
