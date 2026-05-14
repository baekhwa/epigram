import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import FeedItem from "../components/FeedItem";
import { Link } from "react-router-dom";
import {
  API_ENDPOINTS,
  isAbortError,
  isApiError,
  requestJsonOrThrow,
} from "../api/client";
// API 응답 키(content, author)를 그대로 사용하고 tags만 문자열 배열로 정리한다.
// API 응답 데이터를 UI 전용 데이터 형태로 정리하는 변환 함수
const mapEpigramToFeedItem = (item) => ({
  id: item.id,
  content: item.content,
  author: item.author,
  tags: (item.tags || []).map((tag) => tag.name),
});

export default function Feed() {
  // 화면에 렌더링할 누적 피드 목록
  const [epigrams, setEpigrams] = useState([]);
  // 서버가 내려주는 다음 페이지 기준값(null이면 마지막 페이지)
  const [nextCursor, setNextCursor] = useState(null);
  // 서버 전체 개수(더보기 버튼 노출 여부 계산에 사용)
  const [totalCount, setTotalCount] = useState(0);
  // 중복 요청 방지를 위한 로딩 상태
  const [isLoading, setIsLoading] = useState(false);
  // API 실패 시 사용자에게 보여줄 에러 메시지
  const [errorMessage, setErrorMessage] = useState("");
  // 새 요청 시작 시 이전 요청을 취소하기 위한 컨트롤러 보관소
  const requestControllerRef = useRef(null);

  // cursor가 null이면 첫 페이지, 값이 있으면 다음 페이지를 조회한다.
  const fetchEpigrams = useCallback(async (cursor) => {
    // 중복 클릭/페이지 전환 시 이전 요청을 취소해 경합을 막는다.
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    requestControllerRef.current = controller;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // limit=6으로 고정해 한 번에 6개씩 받아온다.
      const params = new URLSearchParams({ limit: "6" });

      if (cursor !== null) {
        // 커서 기반 페이지네이션: 마지막 항목 이후부터 조회
        params.set("cursor", String(cursor));
      }

      // 공통 API 유틸을 사용해 엔드포인트/응답 파싱 규칙을 통일한다.
      const { data } = await requestJsonOrThrow(
        `${API_ENDPOINTS.epigrams}?${params.toString()}`,
        {
          signal: controller.signal,
          errorMessage: "피드를 불러오지 못했습니다.",
        },
      );

      // API 원본을 화면 전용 형태로 매핑
      const mappedItems = (data.list || []).map(mapEpigramToFeedItem);

      // 첫 로딩은 교체, 더보기는 기존 목록 뒤에 이어붙인다.
      setEpigrams((prev) =>
        cursor === null ? mappedItems : [...prev, ...mappedItems],
      );
      // 다음 페이지 여부를 위해 nextCursor를 저장
      setNextCursor(data.nextCursor ?? null);
      // 총 개수를 저장해 "더보기" 노출을 제어
      setTotalCount(data.totalCount ?? mappedItems.length);
    } catch (error) {
      // 취소된 요청은 사용자 오류 메시지 없이 종료한다.
      if (isAbortError(error)) {
        return;
      }

      if (isApiError(error)) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("피드를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      if (!controller.signal.aborted) {
        // 성공/실패와 관계없이 로딩 종료
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // 초기 진입 시 비동기 큐에서 첫 페이지를 조회해 effect 동기 setState 경고를 피한다.
    const timeoutId = window.setTimeout(() => {
      fetchEpigrams(null);
    }, 0);

    // 컴포넌트 언마운트 시 진행 중인 네트워크 요청을 정리한다.
    return () => {
      window.clearTimeout(timeoutId);
      requestControllerRef.current?.abort();
    };
  }, [fetchEpigrams]);

  // 다음 커서가 있고, 현재 목록이 총 개수보다 적을 때만 더보기 버튼을 노출한다.
  const hasMoreItems = nextCursor !== null && epigrams.length < totalCount;

  const handleLoadMore = () => {
    // 로딩 중이 아닐 때만 다음 페이지 요청
    if (!isLoading && nextCursor !== null) {
      fetchEpigrams(nextCursor);
    }
  };

  return (
    <>
      <Header />
      {/* 피드 아이템 여러 개 */}

      {/* 모바일~데스크톱까지 자연스럽게 대응하도록 최대 폭/패딩을 반응형으로 조정 */}
      <section
        className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="feed-title"
      >
        <h1
          id="feed-title"
          className="pt-10 pb-6 text-2xl font-semibold sm:pt-16 sm:pb-10"
        >
          피드
        </h1>
        {errorMessage && (
          <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
        )}
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {epigrams.map((item) => (
            <FeedItem key={item.id} {...item} />
          ))}
        </ul>
        {hasMoreItems && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="py-3 mt-10 border border-[#dcdcdc] rounded-full px-10"
            >
              {isLoading ? "불러오는 중..." : "에피그램 더 보기"}
            </button>
          </div>
        )}
        {/* 모바일에서는 문서 흐름 안에 두고, 큰 화면에서는 우측에 고정 배치한다. */}
        <div className="mt-8 flex justify-end xl:mt-0 xl:block">
          <Link
            to="/create"
            className="inline-flex rounded-full border border-[#2D394E] bg-[#2D394E] px-8 py-3 text-white xl:absolute xl:bottom-0 xl:-right-52"
          >
            에피그램 만들기
          </Link>
        </div>
      </section>
    </>
  );
}
