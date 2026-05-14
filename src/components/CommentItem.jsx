import { useState } from "react";

export default function CommentItem({
  comment,
  isDeleting = false,
  isSaving = false,
  onDelete,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.body);

  const startEdit = () => {
    setEditValue(comment.body);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditValue(comment.body);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const nextBody = editValue.trim();

    if (!nextBody || nextBody === comment.body) {
      setIsEditing(false);
      return;
    }

    const isSuccess = await onUpdate(comment.id, nextBody);

    if (isSuccess) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Escape") {
      cancelEdit();
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      saveEdit();
    }
  };

  return (
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

        {comment.isMine && !isEditing && (
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <button
              type="button"
              className="transition hover:text-gray-700 disabled:text-gray-300"
              onClick={startEdit}
              disabled={isDeleting}
            >
              수정
            </button>
            <button
              type="button"
              className="transition hover:text-red-500 disabled:text-gray-300"
              onClick={() => onDelete(comment.id)}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            className="min-h-24 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            maxLength={100}
            value={editValue}
            onChange={(event) => setEditValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSaving}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:border-gray-400 hover:text-gray-900 disabled:text-gray-300"
              onClick={cancelEdit}
              disabled={isSaving}
            >
              취소
            </button>
            <button
              type="button"
              className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:bg-gray-300"
              onClick={saveEdit}
              disabled={isSaving || !editValue.trim()}
            >
              {isSaving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-6 text-gray-700">{comment.body}</p>
      )}
    </article>
  );
}
