import { useState } from "react";

export default function ActionMemu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative mt-10 flex justify-end gap-4">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((prev) => !prev)}
      >
        <span>수정하기/삭제하기 메뉴</span>
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
          >
            수정하기
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full px-4 py-3 text-left text-sm text-red-500 transition hover:bg-red-50"
          >
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}
