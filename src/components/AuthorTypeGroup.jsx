// 저자 라디오 옵션 정의 (Create 페이지와 분리해 재사용 가능)
const authorTypeOptions = [
  { id: "authorType1", value: "known", label: "직접입력" },
  { id: "authorType2", value: "unknown", label: "알 수 없음" },
  { id: "authorType3", value: "anonymous", label: "본인" },
];

export default function AuthorTypeGroup({
  value,
  onChange,
  name = "authorType",
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
      {/* 부모(Create)에서 전달한 value/onChange로 선택 상태를 제어 */}
      {authorTypeOptions.map((option) => (
        <label
          key={option.id}
          htmlFor={option.id}
          className="flex items-center gap-2"
        >
          <input
            type="radio"
            id={option.id}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(event) => onChange(event.target.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
