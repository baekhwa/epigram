import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./Button";
import Input from "./Input";
import PasswordInput from "./PasswordInput";
import { API_ENDPOINTS, isApiError, requestJsonOrThrow } from "../api/client";

export default function SignupForm() {
  const navigate = useNavigate();

  // 각 입력 필드 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");

  // 필드별 유효성 검사 에러 메시지
  const [errors, setErrors] = useState({});
  // API 요청 에러 메시지 (서버 응답 오류)
  const [apiError, setApiError] = useState("");
  // 제출 중 중복 클릭 방지
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모든 필드를 검사하고 에러 객체를 반환한다.
  const validate = () => {
    const next = {};

    if (!email.trim()) {
      next.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // 기본적인 이메일 형식 검사 (xxx@xxx.xxx)
      next.email = "올바른 이메일 형식이 아닙니다.";
    }

    if (!password) {
      next.password = "비밀번호를 입력해주세요.";
    } else if (password.length < 8) {
      next.password = "비밀번호는 8자 이상이어야 합니다.";
    }

    if (!passwordConfirm) {
      next.passwordConfirm = "비밀번호 확인을 입력해주세요.";
    } else if (password !== passwordConfirm) {
      next.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }

    if (!nickname.trim()) {
      next.nickname = "닉네임을 입력해주세요.";
    }

    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setApiError("");

    // 클라이언트 유효성 검사 먼저 실행
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    setIsSubmitting(true);

    try {
      // 회원가입 요청: 서버는 passwordConfirmation 필드명을 사용한다.
      await requestJsonOrThrow(API_ENDPOINTS.signUp, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          passwordConfirmation: passwordConfirm,
          nickname,
        }),
        errorMessage: "회원가입에 실패했습니다.",
      });

      // 가입 성공 시 홈으로 이동
      navigate("/", { replace: true });
    } catch (error) {
      if (isApiError(error)) {
        // 500 에러는 닉네임/이메일 중복으로 안내한다.
        if (error.status === 500) {
          setApiError("이미 사용 중인 닉네임 또는 이메일입니다.");
        } else {
          setApiError(error.message);
        }
      } else {
        setApiError("서버와 통신할 수 없습니다. 다시 시도해 주세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <Input
            id="email"
            label="이메일"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <div>
          <PasswordInput
            id="password"
            label="비밀번호"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <PasswordInput
            id="passwordConfirm"
            label="비밀번호 확인"
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
          />
          {errors.passwordConfirm && (
            <p className="mt-1 text-xs text-red-500">
              {errors.passwordConfirm}
            </p>
          )}
        </div>

        <div>
          <Input
            id="nickname"
            label="닉네임"
            placeholder="닉네임"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          {errors.nickname && (
            <p className="mt-1 text-xs text-red-500">{errors.nickname}</p>
          )}
        </div>

        {/* API 요청 에러 메시지 (서버 오류, 중복 등) */}
        {apiError && <p className="text-sm text-red-500">{apiError}</p>}

        <Button disabled={isSubmitting}>
          {isSubmitting ? "가입 중..." : "가입하기"}
        </Button>
      </form>
    </div>
  );
}
