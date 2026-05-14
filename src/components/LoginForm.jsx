import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "./Input";
import Button from "./Button";
import { API_ENDPOINTS, isApiError, requestJsonOrThrow } from "../api/client";

export default function LoginForm() {
  const navigate = useNavigate();
  // 입력값과 에러 문구를 상태로 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // async: API 응답을 기다려야 하므로 비동기 함수로 선언
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // 서버에 이메일/비밀번호를 JSON으로 전송
      // 공통 API 유틸로 요청해 엔드포인트/응답 처리를 통일한다.
      const { data } = await requestJsonOrThrow(API_ENDPOINTS.signIn, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        errorMessage: "이메일 또는 비밀번호가 올바르지 않습니다.",
      });

      // 로그인 성공: 인증 토큰과 사용자 정보를 localStorage에 저장
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", data.user.nickname); // 헤더에 표시할 닉네임
      localStorage.setItem("userId", String(data.user.id));
      localStorage.setItem("accessToken", data.accessToken); // API 요청 시 사용할 토큰
      localStorage.setItem("refreshToken", data.refreshToken); // 토큰 갱신 시 사용할 토큰
      setErrorMessage("");
      navigate("/feed", { replace: true });
    } catch (error) {
      // 네트워크 오류 등 fetch 자체가 실패한 경우
      if (isApiError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("서버와 통신할 수 없습니다. 다시 시도해 주세요.");
      }
    }
  };

  return (
    <>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <Button>로그인</Button>
      </form>
    </>
  );
}
