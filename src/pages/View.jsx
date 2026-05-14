import { useEffect, useState } from "react";
import Header from "../components/Header";
import PageLayout from "../components/PageLayout";
import ViewFeedItem from "../components/ViewFeedItem";
import Comments from "../components/Comments";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  API_ENDPOINTS,
  ApiError,
  isAbortError,
  isApiError,
  isAuthStatus,
  requestJson,
  requestJsonOrThrow,
} from "../api/client";

// API 상세 응답 키(content, author)를 그대로 사용하고 화면에서 필요한 값만 보강한다.
const mapEpigramToViewItem = (item) => ({
  id: item.id,
  content: item.content,
  author: item.author,
  tags: (item.tags || []).map((tag) => tag.name),
  // tags 값이 있으면 그 값을 쓰고, 없으면 [] 빈 배열을 기본값으로 사용한다.
  likeCount: item.likeCount ?? 0,
  isLiked: Boolean(item.isLiked),
  referenceTitle: item.referenceTitle || "출처",
  referenceUrl: item.referenceUrl,
  // 현재 로그인 사용자의 id를 저장해두었다면 내 글 여부를 계산할 수 있다.
  isMine: String(item.writerId) === localStorage.getItem("userId"),
});

export default function View() {
  // URL 파라미터(/view/:id)에서 상세 대상 id를 가져온다.
  const { id } = useParams();
  // 피드에서 클릭 이동 시 전달된 state를 읽는다.
  const location = useLocation();
  const navigate = useNavigate();
  // 첫 렌더에서는 전달된 state를 우선 사용해 즉시 화면을 그린다.
  const [feedItem, setFeedItem] = useState(location.state?.feedItem || null);
  // id가 있으면 로딩 상태로 시작한다.
  const [isLoading, setIsLoading] = useState(Boolean(id));
  // id가 없는 잘못된 접근은 초기 에러 문구를 세팅한다.
  const [errorMessage, setErrorMessage] = useState(
    id ? "" : "잘못된 접근입니다.",
  );
  // 좋아요 요청 중 중복 클릭을 막기 위한 상태
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  // 좋아요 요청 실패 시 버튼 아래에 노출할 메시지
  const [likeErrorMessage, setLikeErrorMessage] = useState("");
  // 에피그램 삭제 요청 중 중복 클릭을 막기 위한 상태
  const [isDeleting, setIsDeleting] = useState(false);

  // 인증 실패 시 토큰을 정리하고 로그인 화면으로 보낸다.
  const redirectToLogin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    navigate("/login", {
      replace: true,
      state: { from: location.pathname },
    });
  };

  useEffect(() => {
    // 상세 조회 요청은 id 변경/언마운트 시 취소한다.
    const controller = new AbortController();

    const fetchEpigramDetail = async () => {
      // id 변경 시마다 새 요청을 시작하면서 로딩/에러 상태를 초기화
      setIsLoading(true);
      setErrorMessage("");

      try {
        // 단건 조회: /epigrams/:id
        // 공통 요청 유틸 사용으로 응답 파싱 로직을 재사용한다.
        const { data } = await requestJsonOrThrow(
          `${API_ENDPOINTS.epigrams}/${id}`,
          {
            signal: controller.signal,
            errorMessage: "상세 피드를 불러오지 못했습니다.",
          },
        );

        // 서버 응답을 뷰 모델로 변환해 렌더링 상태에 반영
        setFeedItem(mapEpigramToViewItem(data));
      } catch (error) {
        // 취소된 요청은 에러 UI를 띄우지 않고 무시한다.
        if (isAbortError(error)) {
          return;
        }

        // 실패 시 상세 데이터 제거 + 사용자 안내 메시지 표시
        setFeedItem(null);
        if (isApiError(error)) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("상세 피드를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (!controller.signal.aborted) {
          // 성공/실패와 무관하게 로딩 종료
          setIsLoading(false);
        }
      }
    };

    // id가 없으면 API 호출을 생략한다.
    if (!id) {
      return;
    }

    fetchEpigramDetail();

    return () => {
      controller.abort();
    };
  }, [id]);

  const toggleLike = async () => {
    // 필수 데이터가 없거나 요청 중이면 추가 요청을 막는다.
    if (!id || !feedItem || isLikeLoading) {
      return;
    }

    const prevLiked = Boolean(feedItem.isLiked);
    const nextLiked = !prevLiked;
    const prevCount = feedItem.likeCount ?? 0;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    // 버튼 반응성을 위해 먼저 화면을 갱신하고, 실패하면 롤백한다.
    setFeedItem((prev) =>
      prev
        ? {
            ...prev,
            isLiked: nextLiked,
            likeCount: nextCount,
          }
        : prev,
    );
    setIsLikeLoading(true);
    setLikeErrorMessage("");

    try {
      const token = localStorage.getItem("accessToken");
      // 좋아요 API는 인증이 필요하므로 토큰이 없으면 즉시 실패 처리한다.
      if (!token) {
        throw new ApiError("좋아요는 로그인 후 이용할 수 있습니다.", {
          status: 401,
          code: "LOGIN_REQUIRED",
        });
      }

      await requestJsonOrThrow(`${API_ENDPOINTS.epigrams}/${id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        errorMessage: "좋아요 요청에 실패했습니다.",
      });

      // 토글 성공 후 서버의 최신 좋아요 상태를 다시 받아와 화면을 동기화한다.
      const { response: syncedResponse, data: syncedData } = await requestJson(
        `${API_ENDPOINTS.epigrams}/${id}`,
      );
      if (syncedResponse.ok) {
        setFeedItem(mapEpigramToViewItem(syncedData));
      }
    } catch (error) {
      // 요청 실패 시 낙관적 업데이트를 되돌린다.
      setFeedItem((prev) =>
        prev
          ? {
              ...prev,
              isLiked: prevLiked,
              likeCount: prevCount,
            }
          : prev,
      );

      if (isApiError(error) && error.code === "LOGIN_REQUIRED") {
        setLikeErrorMessage(error.message);
        redirectToLogin();
      } else if (isApiError(error) && isAuthStatus(error.status)) {
        setLikeErrorMessage(
          "로그인 정보가 만료되었습니다. 다시 로그인해 주세요.",
        );
        redirectToLogin();
      } else if (isApiError(error)) {
        setLikeErrorMessage(error.message);
      } else {
        setLikeErrorMessage("좋아요 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLikeLoading(false);
    }
  };

  const deleteEpigram = async () => {
    if (!id || isDeleting) {
      return;
    }

    const isConfirmed = window.confirm("에피그램을 삭제할까요?");
    if (!isConfirmed) {
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("삭제는 로그인 후 이용할 수 있습니다.");
      redirectToLogin();
      return;
    }

    setIsDeleting(true);

    try {
      await requestJsonOrThrow(`${API_ENDPOINTS.epigrams}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        errorMessage: "에피그램 삭제에 실패했습니다.",
      });

      navigate("/feed", { replace: true });
    } catch (error) {
      if (isApiError(error) && isAuthStatus(error.status)) {
        alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
        redirectToLogin();
      } else if (isApiError(error)) {
        alert(error.message);
      } else {
        alert("에피그램 삭제 중 오류가 발생했습니다.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // 상세 데이터 요청 중에는 로딩 UI를 먼저 노출
  if (isLoading) {
    return (
      <>
        <Header />
        <PageLayout>
          <section className="mt-24 text-center text-gray-500">
            불러오는 중...
          </section>
        </PageLayout>
      </>
    );
  }

  // 데이터가 없으면 안내 화면(에러/없는 게시물)을 노출
  if (!feedItem) {
    return (
      <>
        <Header />
        <PageLayout>
          <section className="mt-24 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              요청한 피드를 찾을 수 없어요.
            </h2>
            <p className="mt-3 text-gray-500">
              {errorMessage ||
                "삭제되었거나 잘못된 경로로 접근했을 수 있습니다."}
            </p>
            <Link
              to="/feed"
              className="mt-6 inline-flex rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:text-gray-900"
            >
              피드로 돌아가기
            </Link>
          </section>
        </PageLayout>
      </>
    );
  }

  // 정상 조회된 상세 데이터 렌더링
  return (
    <>
      <Header />
      <PageLayout className="gap-0">
        <ViewFeedItem
          feedItem={feedItem}
          onToggleLike={toggleLike}
          onDelete={deleteEpigram}
          isLikeLoading={isLikeLoading}
          isDeleting={isDeleting}
          likeErrorMessage={likeErrorMessage}
        />
        <Comments epigramId={id} />
      </PageLayout>
    </>
  );
}
