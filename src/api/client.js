// 프로젝트에서 공통으로 사용하는 API 베이스/엔드포인트를 한곳에 모아 관리한다.
const API_BASE_URL = "https://fe-project-epigram-api.vercel.app";
const PROJECT_PATH = "/22-kim";
export const DEFAULT_TIMEOUT_MS = 15000;

export const API_ENDPOINTS = {
  epigrams: `${API_BASE_URL}${PROJECT_PATH}/epigrams`,
  signIn: `${API_BASE_URL}${PROJECT_PATH}/auth/signIn`,
  signUp: `${API_BASE_URL}${PROJECT_PATH}/auth/signUp`,
  // 댓글은 에피그램 id를 동적으로 받아서 생성되므로 함수로 제공한다.
  getComments: (epigramId) =>
    `${API_BASE_URL}${PROJECT_PATH}/epigrams/${epigramId}/comments`,
};
// https://fe-project-epigram-api.vercel.app/22-kim/epigrams/5908/comments?limit=10
// 모든 화면에서 같은 형태로 다루기 위한 공통 API 에러 타입
export class ApiError extends Error {
  constructor(message, { status = 0, code = "API_ERROR", data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

export function isApiError(error) {
  return error instanceof ApiError;
}

export function isAbortError(error) {
  return error instanceof Error && error.name === "AbortError";
}

export function isAuthStatus(status) {
  return status === 401 || status === 403;
}

function getDataMessage(data) {
  if (data && typeof data === "object" && typeof data.message === "string") {
    return data.message;
  }
  return "";
}

// 응답 파싱을 공통화해 각 화면에서 동일한 방식으로 JSON을 처리한다.
export async function requestJson(url, options = {}) {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, signal, ...fetchOptions } = options;

  const controller = new AbortController();
  let timeoutId = null;
  let didTimeout = false;

  const abortFromExternal = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abortFromExternal, { once: true });
    }
  }

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, timeoutMs);
  }

  let response;

  try {
    response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } catch (error) {
    if (didTimeout) {
      throw new ApiError("요청 시간이 초과되었습니다.", {
        code: "TIMEOUT",
      });
    }
    throw error;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (signal) {
      signal.removeEventListener("abort", abortFromExternal);
    }
  }

  // 일부 실패 응답도 JSON 바디를 가지므로 가능하면 함께 반환한다.
  let data = null;
  try {
    data = await response.json();
  } catch {
    // JSON 바디가 없는 응답은 null로 유지한다.
  }

  return {
    ok: response.ok,
    status: response.status,
    response,
    data,
  };
}

// 실패 응답을 ApiError로 변환해 화면 단의 에러 분기 코드를 단순화한다.
export async function requestJsonOrThrow(url, options = {}) {
  const { errorMessage, ...requestOptions } = options;
  const result = await requestJson(url, requestOptions);

  if (!result.ok) {
    throw new ApiError(
      errorMessage || getDataMessage(result.data) || "요청에 실패했습니다.",
      {
        status: result.status,
        code: "HTTP_ERROR",
        data: result.data,
      },
    );
  }

  return result;
}
