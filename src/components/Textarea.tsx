import { TextareaHTMLAttributes, useId } from "react";

// 기본 textarea 속성에 label 관련 옵션을 확장한 공통 컴포넌트 props
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  requiredMark?: boolean;
  labelClassName?: string;
}

export default function Textarea({
  id,
  label,
  requiredMark = false,
  className = "",
  labelClassName = "flex text-sm font-medium text-gray-700",
  ...props
}: TextareaProps) {
  // id가 전달되지 않은 경우에도 label과 textarea 연결을 위해 고유 id를 생성
  const generatedId = useId();
  const textareaId = id || generatedId;

  return (
    <>
      {label && (
        // label이 있을 때만 렌더링하고 htmlFor로 textarea와 연결
        <label htmlFor={textareaId} className={labelClassName}>
          {label}
          {requiredMark && <span> *</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        // className을 직접 넘기면 우선 적용, 없으면 기본 스타일 사용
        className={
          className ||
          "h-40 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        }
        {...props}
      />
    </>
  );
}
