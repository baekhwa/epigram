import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import PageLayout from "../components/PageLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthorTypeGroup from "../components/AuthorTypeGroup";
import Textarea from "../components/Textarea";
import {
  API_ENDPOINTS,
  isAbortError,
  isApiError,
  isAuthStatus,
  requestJsonOrThrow,
} from "../api/client";

const inputClassName =
  "rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400";

function getTagsText(tags) {
  return (tags || [])
    .map((tag) => `#${tag.name || tag}`)
    .join(" ");
}

function getTagNames(tagsText) {
  return tagsText
    .split(/\s+/)
    .map((tag) => tag.trim().replace(/^#/, ""))
    .filter(Boolean);
}

function getAuthorByType(authorType, authorValue) {
  if (authorType === "unknown") return "알 수 없음";
  if (authorType === "anonymous") {
    return localStorage.getItem("userName") || "본인";
  }
  return authorValue.trim();
}

function getAuthorType(author) {
  if (author === "알 수 없음") return "unknown";
  if (author === localStorage.getItem("userName") || author === "본인") {
    return "anonymous";
  }
  return "known";
}

export default function Create() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [content, setContent] = useState("");
  const [authorType, setAuthorType] = useState("known");
  const [author, setAuthor] = useState("");
  const [referenceTitle, setReferenceTitle] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const goLogin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userId");
    navigate("/login", { state: { from: isEditMode ? `/edit/${id}` : "/create" } });
  };

  const getTokenOrLogin = () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인 후 이용할 수 있습니다.");
      goLogin();
      return "";
    }

    return token;
  };

  const handleAuthError = (error) => {
    if (isApiError(error) && isAuthStatus(error.status)) {
      alert("로그인 정보가 만료되었습니다. 다시 로그인해 주세요.");
      goLogin();
      return true;
    }

    return false;
  };

  useEffect(() => {
    if (!isEditMode) return;

    const controller = new AbortController();

    async function loadEpigram() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data } = await requestJsonOrThrow(
          `${API_ENDPOINTS.epigrams}/${id}`,
          {
            signal: controller.signal,
            errorMessage: "에피그램을 불러오지 못했습니다.",
          },
        );

        const nextAuthorType = getAuthorType(data.author);

        setContent(data.content || "");
        setAuthorType(nextAuthorType);
        setAuthor(nextAuthorType === "known" ? data.author || "" : "");
        setReferenceTitle(data.referenceTitle || "");
        setReferenceUrl(data.referenceUrl || "");
        setTags(getTagsText(data.tags));
      } catch (error) {
        if (isAbortError(error)) return;

        setErrorMessage(
          isApiError(error)
            ? error.message
            : "에피그램을 불러오는 중 오류가 발생했습니다.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadEpigram();

    return () => controller.abort();
  }, [id, isEditMode]);

  const handleAuthorTypeChange = (nextAuthorType) => {
    setAuthorType(nextAuthorType);

    if (nextAuthorType !== "known") {
      setAuthor("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = getTokenOrLogin();
    if (!token || isSubmitting) return;

    const nextContent = content.trim();
    const nextAuthor = getAuthorByType(authorType, author);

    if (!nextContent) {
      alert("내용을 입력해 주세요.");
      return;
    }

    if (!nextAuthor) {
      alert("저자를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        content: nextContent,
        author: nextAuthor,
        referenceTitle: referenceTitle.trim(),
        referenceUrl: referenceUrl.trim(),
        tags: getTagNames(tags),
      };

      const url = isEditMode
        ? `${API_ENDPOINTS.epigrams}/${id}`
        : API_ENDPOINTS.epigrams;

      const { data } = await requestJsonOrThrow(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        errorMessage: isEditMode
          ? "에피그램 수정에 실패했습니다."
          : "에피그램 작성에 실패했습니다.",
      });

      const savedEpigram = data?.epigram || data;
      navigate(`/view/${savedEpigram.id || id}`, { replace: true });
    } catch (error) {
      if (handleAuthError(error)) return;

      alert(
        isApiError(error)
          ? error.message
          : isEditMode
            ? "에피그램 수정 중 오류가 발생했습니다."
            : "에피그램 작성 중 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <PageLayout>
          <section className="mt-24 text-center text-gray-500">
            에피그램을 불러오는 중입니다...
          </section>
        </PageLayout>
      </>
    );
  }

  return (
    <>
      <Header />
      <section className="mx-auto mt-24 w-full max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {isEditMode ? "에피그램 수정하기" : "에피그램 만들기"}
        </h2>

        <PageLayout>
          <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
            {errorMessage && (
              <p className="text-left text-sm text-red-500">{errorMessage}</p>
            )}

            <Textarea
              id="content"
              label="내용"
              requiredMark
              placeholder="500자 이내로 입력해 주세요."
              maxLength={500}
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />

            <fieldset className="space-y-3 text-left">
              <legend className="text-sm font-medium text-gray-700">
                저자<span>*</span>
              </legend>
              <AuthorTypeGroup
                value={authorType}
                onChange={handleAuthorTypeChange}
              />
              <div className="pt-1">
                <Input
                  id="author"
                  name="author"
                  placeholder="저자 이름 입력"
                  autoComplete="off"
                  className={inputClassName}
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  disabled={authorType !== "known"}
                />
              </div>
            </fieldset>

            <Input
              id="source"
              label="출처"
              placeholder="출처 제목 입력"
              className={inputClassName}
              value={referenceTitle}
              onChange={(event) => setReferenceTitle(event.target.value)}
            />
            <Input
              id="url"
              placeholder="URL (ex. https://www.website.com)"
              className={inputClassName}
              value={referenceUrl}
              onChange={(event) => setReferenceUrl(event.target.value)}
            />
            <Input
              id="tags"
              label="태그"
              placeholder="태그 입력 (ex. #인생 #사랑)"
              className={inputClassName}
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
            <Button disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "수정 중..."
                  : "작성 중..."
                : isEditMode
                  ? "수정완료"
                  : "작성완료"}
            </Button>
          </form>
        </PageLayout>
      </section>
    </>
  );
}
