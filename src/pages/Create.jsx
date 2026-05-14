import { useState } from "react";
import Header from "../components/Header";
import PageLayout from "../components/PageLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthorTypeGroup from "../components/AuthorTypeGroup";
import Textarea from "../components/Textarea";

export default function Create() {
  // 저자 선택값(직접입력/알 수 없음/본인)을 관리
  const [authorType, setAuthorType] = useState("known");

  return (
    <>
      <Header />
      <section className="w-160 mx-auto mt-24 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          에피그램 만들기
        </h2>
        <PageLayout>
          <form className="flex w-full flex-col gap-4">
            <Textarea
              id="content"
              label="내용"
              requiredMark
              placeholder="500자 이내로 입력해주세요."
              maxLength={500}
            />
            <fieldset className="space-y-3 text-left">
              <legend className="text-sm font-medium text-gray-700">
                저자 <span>*</span>
              </legend>
              {/* 라디오 선택은 별도 컴포넌트로 분리 */}
              <AuthorTypeGroup value={authorType} onChange={setAuthorType} />
              <div className="pt-1">
                <Input
                  id="author"
                  name="author"
                  placeholder="저자 이름 입력"
                  autoComplete="off"
                  // 직접입력(known)일 때만 저자 이름을 입력할 수 있음
                  disabled={authorType !== "known"}
                />
              </div>
            </fieldset>

            <Input id="source" label="출처" placeholder="출처 제목 입력" />
            <Input id="url" placeholder="URL (ex. https://www.website.com)" />
            <Input
              id="tags"
              label="태그"
              placeholder="태그 입력 (ex. #인생 #사랑)"
            />
            <Button>작성완료</Button>
          </form>
        </PageLayout>
      </section>
    </>
  );
}
