import { useId, InputHTMLAttributes } from "react";

// Input 컴포넌트가 받을 수 있는 props의 타입을 정의합니다.
// InputHTMLAttributes를 상속하면 value, onChange, disabled 같은
// 기본 <input> 속성들을 그대로 사용할 수 있습니다.
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  wrapperClassName?: string;
}

export default function Input({
  type = "text",
  placeholder,
  className = "",
  label,
  id,
  labelClassName = "flex text-sm font-medium text-gray-700",
  // 위에서 따로 꺼내지 않은 나머지 input 속성들이 props에 모입니다.
  ...props
}: InputProps) {
  // id가 직접 전달되지 않았을 때를 대비해 React가 안정적인 고유 id를 만들어줍니다.
  const generatedId = useId();
  // 전달받은 id가 있으면 우선 사용하고, 없으면 generatedId를 사용합니다.
  const inputId = id || generatedId;

  return (
    <>
      {label && (
        // label의 htmlFor와 input의 id를 맞춰 클릭 시 input에 포커스되도록 연결합니다.
        <label htmlFor={inputId} className={labelClassName}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        className={className}
        // value, onChange, name 등 추가로 받은 input 속성들을 실제 input에 전달합니다.
        {...props}
      />
    </>
  );
}
