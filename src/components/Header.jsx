import { Link } from "react-router-dom";
import Logo from "./Logo";
import user from "../assets/images/user.png";

export default function Header({ isLoggedIn, hideLoginButton = false }) {
  // prop이 전달되면 우선 사용하고, 없으면 localStorage의 로그인 상태를 사용
  const resolvedIsLoggedIn =
    isLoggedIn ?? localStorage.getItem("isLoggedIn") === "true";
  // 저장된 사용자 이름이 없을 때를 대비한 기본값
  const userName = localStorage.getItem("userName") || "김코드";
  // 로그인 사용자에게만 피드 메뉴 노출
  const showFeedLink = resolvedIsLoggedIn;
  // 비로그인 상태이며 숨김 옵션이 아닐 때만 로그인 버튼 노출
  const showLoginButton = !resolvedIsLoggedIn && !hideLoginButton;

  return (
    <div className="w-full bg-white">
      <header className="w-full flex justify-between items-center m-auto max-w-480 h-20 bg-white border-b border-[#F2F2F2]">
        <nav
          className="flex gap-4 mx-30 w-full justify-between items-center"
          aria-label="Main navigation"
        >
          <div className="flex gap-9">
            <Link
              to="/"
              className="h-9 flex gap-4 items-center"
              aria-label="Home"
            >
              <Logo />
            </Link>
            {showFeedLink && (
              <Link to="/feed" className="flex items-center text-[16px]">
                <span>피드</span>
              </Link>
            )}
          </div>
          <div className="logo flex items-center gap-1.5">
            {/* 로그인 상태에 따라 우측 액션을 분기: 중첩된 삼항 연산자 구조 */}
            {resolvedIsLoggedIn ? (
              // 로그인한 사용자의 정보 표시 (예: 아이콘 + 이름)
              <>
                <img src={user} alt="User" className="h-6" />
                <span className="text-gray-600 text-xs">{userName}</span>
              </>
            ) : showLoginButton ? (
              // 비로그인 사용자의 기본 진입로
              <Link
                to="/login"
                className="rounded-full border border-[#dcdcdc] px-4 py-2 text-xs text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
              >
                로그인
              </Link>
            ) : null}
          </div>
        </nav>
      </header>
    </div>
  );
}
