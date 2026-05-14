import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ActionMemu({ epigramId, isDeleting = false, onDelete }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleEditClick = () => {
    setIsMenuOpen(false);
    navigate(`/edit/${epigramId}`);
  };

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    onDelete();
  };

  return (
    <div className="relative mt-10 flex justify-end">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-label="수정하기/삭제하기 메뉴 열기"
        className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
          isMenuOpen
            ? "border-gray-400 bg-gray-100 text-gray-900"
            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900"
        }`}
        onClick={() => setIsMenuOpen((prev) => !prev)}
        disabled={isDeleting}
      >
        <span className="sr-only">수정하기/삭제하기 메뉴</span>
        <span className="flex flex-col gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute top-12 right-0 w-36 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-3 text-left text-sm text-gray-700 transition hover:bg-gray-50"
            onClick={handleEditClick}
          >
            수정하기
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50 disabled:text-gray-300"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? "삭제 중..." : "삭제하기"}
          </button>
        </div>
      )}
    </div>
  );
}
