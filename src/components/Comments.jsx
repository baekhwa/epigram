import { useEffect, useState } from "react";
import CommentItem from "./CommentItem";
import image from "/category-01.jpg";
import {
  API_ENDPOINTS,
  isAbortError,
  isApiError,
  isAuthStatus,
  requestJsonOrThrow,
} from "../api/client";
import { useLocation, useNavigate } from "react-router-dom";

// API 응답의 댓글 데이터를 UI 컴포넌트가 필요한 형식으로 변환한다.
const mapCommentToItem = (comment, userId) => ({
  id: comment.id,
  category: image, // API에서 카테고리 이미지가 없으면 기본값 사용
  author: comment.author?.name || comment.authorName || "알 수 없음",
  createdAt: formatTime(comment.createdAt),
  // 현재 로그인 사용자와 댓글 작성자가 같으면 내 댓글로 표시
  isMine: String(comment.authorId) === userId,
  body: comment.body || comment.content || "",
});

function extractComments(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.list)) return data.list;
  return [];
}

// ISO 8601 형식의 타임스탐프를 상대 시간(예: "1시간 전")으로 변환한다.
function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // 초 단위

    if (diff < 60) return "방금 전";
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

    // 일주일 이상은 날짜 표시
    return date.toLocaleDateString("ko-KR");
  } catch {
    return "알 수 없음";
  }
}

export default function Comments({ epigramId }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 댓글 목록과 입력값을 컴포넌트 상태로 관리
  const [comments, setComments] = useState([]);
  const [inputValue, setInputValue] = useState("");
  // 댓글 조회 로딩 상태
  const [isLoading, setIsLoading] = useState(Boolean(epigramId));
  // 댓글 조회 에러 메시지
  const [errorMessage, setErrorMessage] = useState("");
  // 댓글 작성 중 로딩 상태 (중복 제출 방지)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 목록을 API에서 조회한다. epigramId 변경 시마다 새로 조회한다.
  useEffect(() => {
    if (!epigramId) return;

    const controller = new AbortController();

    const fetchComments = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        // 댓글 목록 조회: GET /epigrams/:id/comments?limit=6
        const { data } = await requestJsonOrThrow(
          `${API_ENDPOINTS.getComments(epigramId)}?limit=6`,
          {
            signal: controller.signal,
            errorMessage: "댓글을 불러오지 못했습니다.",
          },
        );

        // API 응답을 UI 모델로 변환해 상태에 반영
        const userId = localStorage.getItem("userId");
        const mappedComments = extractComments(data).map((comment) =>
          mapCommentToItem(comment, userId),
        );
        setComments(mappedComments);
      } catch (error) {
        // 취소된 요청은 에러 UI를 띄우지 않는다.
        if (isAbortError(error)) {
          return;
        }

        if (isApiError(error)) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("댓글을 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchComments();

    // 언마운트/epigramId 변경 시 요청 취소
    return () => controller.abort();
  }, [epigramId]);

  // 댓글 작성 요청을 API로 전송한다.
  const addComment = async () => {
    const nextBody = inputValue.trim();

    if (!nextBody) {
      return;
    }

    // 이미 제출 중인 경우 중복 제출 방지
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("댓글 작성은 로그인 후 이용할 수 있습니다.");
        navigate("/login", {
          state: { from: location.pathname },
        });
        return;
      }

      // 댓글 작성: POST /epigrams/:id/comments
      const { data: responseData } = await requestJsonOrThrow(
        `https://fe-project-epigram-api.vercel.app/22-kim/comments`,

        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgwOSwidGVhbUlkIjoiMjIta2ltIiwic2NvcGUiOiJhY2Nlc3MiLCJpYXQiOjE3Nzg3NDE3NzYsImV4cCI6MTc3ODc0MzU3NiwiaXNzIjoic3AtZXBpZ3JhbSJ9.mL49ilVQeyV9fcFhyaQG8FfEQ9apPC10WjGSc3sCGak`,
          },
          body: JSON.stringify({
            epigramId: epigramId,
            isPrivate: false,
            content: nextBody,
            // 필요시 추가 필드 (예: parentCommentId 등)
          }),
          errorMessage: "댓글 작성에 실패했습니다.",
        },
      );

      // 낙관적 업데이트: 방금 작성한 댓글을 즉시 목록에 추가
      const userId = localStorage.getItem("userId");
      const savedComment = responseData?.comment || responseData;
      const newComment = mapCommentToItem(savedComment, userId);
      setComments((prev) => [newComment, ...prev]);
      setInputValue("");
    } catch (error) {
      if (isApiError(error) && isAuthStatus(error.status)) {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userId");
        navigate("/login", {
          state: { from: location.pathname },
        });
      } else if (isApiError(error)) {
        alert(error.message);
      } else {
        alert("댓글 작성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaKeyDown = (event) => {
    // 한글 조합(IME) 중 Enter 입력은 제출로 처리하지 않음
    if (event.nativeEvent.isComposing) {
      return;
    }

    // Shift+Enter는 줄바꿈, Enter는 댓글 등록
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      addComment();
    }
  };

  return (
    <section className="mx-auto mt-10 mb-24 w-full max-w-4xl px-4 sm:px-6">
      <header className="mb-5 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="w-full">
          <h3 className="text-xl font-semibold text-gray-900">
            댓글 <span className="text-gray-400">({comments.length})</span>
          </h3>
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            <img
              src={image}
              alt="카테고리 이미지"
              className="mr-2 h-4 w-4 rounded-full"
            />
          </span>
          <textarea
            className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="100자 이내로 입력해주세요."
            maxLength={100}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            disabled={isSubmitting}
          />
        </div>
      </header>

      {/* 댓글 조회 중 로딩 상태 */}
      {isLoading && (
        <div className="text-center py-8 text-gray-500">
          댓글을 불러오는 중입니다...
        </div>
      )}

      {/* 댓글 조회 실패 시 에러 메시지 */}
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* 댓글 목록 렌더링 */}
      {!isLoading && comments.length > 0 && (
        <ul className="space-y-4" aria-label="댓글 목록">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} />
            </li>
          ))}
        </ul>
      )}

      {/* 댓글이 없는 경우 안내 메시지 */}
      {!isLoading && comments.length === 0 && !errorMessage && (
        <div className="text-center py-8 text-gray-500">
          첫 번째 댓글을 달아보세요.
        </div>
      )}
    </section>
  );
}
