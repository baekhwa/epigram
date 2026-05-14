import epigram from "../assets/images/epigram.png";
import feed from "../assets/images/feed.png";

export default function Logo({ className = "" }) {
  return (
    <div className={`flex gap-4 items-center ${className}`}>
      <img src={feed} alt="Feed" className="w-9" />
      <img src={epigram} alt="epigram" className="h-6.5" />
    </div>
  );
}
