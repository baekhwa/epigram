import "./Kervisual.css";

export default function AnimationLine({ lineCount, centerIndex }) {
  return (
    <div className="animation__line bg-white" aria-hidden="true">
      {Array.from({ length: lineCount }).map((_, i) => (
        <span
          key={i}
          className="animation__line--item"
          style={{
            animationDelay: `${Math.abs(i - centerIndex) * 0.08}s, 0s`,
          }}
        />
      ))}
    </div>
  );
}
