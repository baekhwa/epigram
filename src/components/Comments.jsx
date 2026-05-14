import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  API_ENDPOINTS,
  isAbortError,
  isApiError,
  isAuthStatus,
  requestJsonOrThrow,
} from "../api/client";
import CommentItem from "./CommentItem";
import image from "/category-01.jpg";

// API 응답 모양이 배열, { comments: [] }, { list: [] } 중 무엇이든
// 화면에서는 항상 배열로 다루기 위한 함수입니다.
function getCommentList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.comments)) return data.comments;
  if (Array.isArray(data?.list)) return data.list;
  return [];
}

// 서버에서 받은 작성 시간을 "방금 전", "3분 전" 같은 글자로 바꿉니다.
function getTimeText(createdAt) {
  if (!createdAt) return "방금 전";

  const date = new Date(createdAt);
  const diffSeconds = Math.floor((new Date() - date) / 1000);

  if (Number.isNaN(date.getTime())) return "방금 전";
  if (diffSeconds < 60) return "방금 전";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}분 전`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}시간 전`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}일 전`;

  return date.toLocaleDateString("ko-KR");
}

// API 댓글 데이터를 CommentItem 컴포넌트가 쓰기 쉬운 모양으로 바꿉니다.
function makeCommentItem(comment, options = {}) {
  const myUserId = localStorage.getItem("userId");

  // 서버 응답마다 작성자 id 이름이 다를 수 있어서 여러 후보를 확인합니다.
  const authorId =
    comment.author?.id ??
    comment.writer?.id ??
    comment.user?.id ??
    comment.authorId ??
    comment.writerId ??
    comment.userId;

  return {
    id: comment.id,
    category: image,
    author:
      comment.author?.nickname ||
      comment.writer?.nickname ||
      comment.user?.nickname ||
      comment.author?.name ||
      comment.writer?.name ||
      comment.user?.name ||
      comment.authorName ||
      localStorage.getItem("userName") ||
      "익명",
    createdAt: getTimeText(comment.createdAt),
    isMine: options.isMine || comment.isMine || String(authorId) === myUserId,
    body: comment.content || comment.body || "",
  };
}

export default function Comments({ epigramId }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 댓글 목록
  const [comments, setComments] = useState([]);
  // 새 댓글 입력값
  const [inputValue, setInputValue] = useState("");
  // 댓글 목록을 불러오는 중인지
  const [isLoading, setIsLoading] = useState(false);
  // 새 댓글을 등록하는 중인지
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 현재 수정 중인 댓글 id. null이면 수정 중인 댓글이 없습니다.
  const [editingCommentId, setEditingCommentId] = useState(null);
  // 현재 삭제 중인 댓글 id. null이면 삭제 중인 댓글이 없습니다.
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  // 댓글 목록 조회 실패 메시지
  const [errorMessage, setErrorMessage] = useState("");

  // 로그인 정보가 없거나 만료되었을 때 로그인 화면으로 보냅니다.
  const goLogin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");

    navigate("/login", {
      state: { from: location.pathname },
    });
  };

  // 댓글 작성/수정/삭제는 로그인이 필요하므로 토큰을 먼저 확인합니다.
  const getTokenOrLogin = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인 후 이용할 수 있습니다.");
      goLogin();
      return "";
    }

    return token;
  };

  // API가 401/403을 주면 인증 문제로 보고 로그인 화면으로 보냅니다.
  const handleAuthError = (error) => {
    if (isApiError(error) && isAuthStatus(error.status)) {
      alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
      goLogin();
      return true;
    }

    return false;
  };

  // epigramId가 바뀔 때마다 해당 에피그램의 댓글 목록을 다시 불러옵니다.
  useEffect(() => {
    if (!epigramId) return;

    const controller = new AbortController();

    async function loadComments() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data } = await requestJsonOrThrow(
          `${API_ENDPOINTS.getComments(epigramId)}?limit=6`,
          {
            signal: controller.signal,
            errorMessage: "댓글을 불러오지 못했습니다.",
          },
        );

        // 서버 댓글 배열을 화면용 댓글 배열로 변환해서 저장합니다.
        setComments(getCommentList(data).map(makeCommentItem));
      } catch (error) {
        // 컴포넌트가 사라지거나 epigramId가 바뀌어서 취소된 요청은 무시합니다.
        if (isAbortError(error)) return;

        setErrorMessage(
          isApiError(error)
            ? error.message
            : "댓글을 불러오는 중 오류가 발생했습니다.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadComments();

    // 컴포넌트가 사라질 때 진행 중인 댓글 조회 요청을 취소합니다.
    return () => controller.abort();
  }, [epigramId]);

  // 새 댓글 등록: form submit 또는 Enter 입력 시 실행됩니다.
  const handleSubmit = async (event) => {
    event.preventDefault();

    const content = inputValue.trim();
    if (!content || isSubmitting) return;

    const token = getTokenOrLogin();
    if (!token) return;

    setIsSubmitting(true);

    try {
      const { data } = await requestJsonOrThrow(API_ENDPOINTS.comments, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          epigramId: Number(epigramId),
          isPrivate: false,
          content,
        }),
        errorMessage: "댓글 작성에 실패했습니다.",
      });

      // 등록 성공 후 새 댓글을 목록 맨 앞에 추가합니다.
      const savedComment = data?.comment || data;
      setComments((prevComments) => [
        makeCommentItem(savedComment, { isMine: true }),
        ...prevComments,
      ]);
      setInputValue("");
    } catch (error) {
      if (handleAuthError(error)) return;

      alert(
        isApiError(error)
          ? error.message
          : "댓글 작성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 댓글 수정: CommentItem에서 저장 버튼을 눌렀을 때 호출됩니다.
  const handleUpdateComment = async (commentId, nextBody) => {
    const content = nextBody.trim();
    if (!content || editingCommentId) return false;

    const token = getTokenOrLogin();
    if (!token) return false;

    setEditingCommentId(commentId);

    try {
      const { data } = await requestJsonOrThrow(
        API_ENDPOINTS.comment(commentId),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
          errorMessage: "댓글 수정에 실패했습니다.",
        },
      );

      const updatedComment = data?.comment || data;

      // 수정된 댓글 id와 같은 항목만 새 내용으로 바꿉니다.
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                ...makeCommentItem(updatedComment, { isMine: true }),
                body: content,
              }
            : comment,
        ),
      );

      return true;
    } catch (error) {
      if (handleAuthError(error)) return false;

      alert(
        isApiError(error)
          ? error.message
          : "댓글 수정 중 오류가 발생했습니다.",
      );
      return false;
    } finally {
      setEditingCommentId(null);
    }
  };

  // 댓글 삭제: 확인창을 거친 뒤 DELETE 요청을 보냅니다.
  const handleDeleteComment = async (commentId) => {
    if (deletingCommentId) return;

    const isConfirmed = window.confirm("댓글을 삭제할까요?");
    if (!isConfirmed) return;

    const token = getTokenOrLogin();
    if (!token) return;

    setDeletingCommentId(commentId);

    try {
      await requestJsonOrThrow(API_ENDPOINTS.comment(commentId), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        errorMessage: "댓글 삭제에 실패했습니다.",
      });

      // 삭제된 댓글 id를 제외한 나머지만 목록에 남깁니다.
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId),
      );
    } catch (error) {
      if (handleAuthError(error)) return;

      alert(
        isApiError(error)
          ? error.message
          : "댓글 삭제 중 오류가 발생했습니다.",
      );
    } finally {
      setDeletingCommentId(null);
    }
  };

  // textarea에서 Enter는 등록, Shift+Enter는 줄바꿈으로 사용합니다.
  const handleKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter" && !event.shiftKey) {
      handleSubmit(event);
    }
  };

  return (
    <section className="mx-auto mt-10 mb-24 w-full max-w-4xl px-4 sm:px-6">
      <header className="mb-5 border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-900">
          댓글 <span className="text-gray-400">({comments.length})</span>
        </h3>

        <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
          <textarea
            className="min-h-24 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="100자 이내로 입력해 주세요."
            maxLength={100}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:bg-gray-300"
            disabled={isSubmitting || !inputValue.trim()}
          >
            등록
          </button>
        </form>
      </header>

      {isLoading && (
        <div className="py-8 text-center text-gray-500">
          댓글을 불러오는 중입니다...
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {!isLoading && comments.length > 0 && (
        <ul className="space-y-4" aria-label="댓글 목록">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem
                comment={comment}
                isDeleting={deletingCommentId === comment.id}
                isSaving={editingCommentId === comment.id}
                onDelete={handleDeleteComment}
                onUpdate={handleUpdateComment}
              />
            </li>
          ))}
        </ul>
      )}

      {!isLoading && comments.length === 0 && !errorMessage && (
        <div className="py-8 text-center text-gray-500">
          첫 번째 댓글을 남겨보세요.
        </div>
      )}
    </section>
  );
}
