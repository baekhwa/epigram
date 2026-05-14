import AnimationLine from "./AnimationLine";

// 애니메이션 라인의 총 개수
const LINE_COUNT = 37;
// 중앙 라인의 인덱스 (각 라인의 애니메이션 딜레이 계산에 사용)
const CENTER_INDEX = (LINE_COUNT - 1) / 2;
export default function Kervisual() {
  return (
    <>
      <div className="h-240" aria-labelledby="home-hero-title">
        <AnimationLine lineCount={LINE_COUNT} centerIndex={CENTER_INDEX} />
        <div className="font-['Iropke_Batang'] absolute top-80 left-[50%] translate-x-[-50%] text-center;">
          <h1
            id="home-hero-title"
            className="text-[40px]  mb-10 animation-title"
          >
            나만 갖고 있기엔 <br />
            아까운 글이 있지 않나요?
          </h1>
          <p className="text-xl text-gray-500 text-center">
            다른 사람들과 감정을 공유해보세요.
          </p>
        </div>
      </div>
    </>
  );
}
