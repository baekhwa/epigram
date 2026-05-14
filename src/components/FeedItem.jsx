import { Link } from "react-router-dom";

export default function FeedItem({ id, content, author, tags }) {
  const feedItemForView = { id, content, author, tags };

  return (
    // 피드 아이템 하나
    <li>
      <article>
        <Link
          to={`/view/${id}`}
          state={{ feedItem: feedItemForView }}
          className="block"
        >
          <blockquote className="flex h-64.75 p-4 bg-white shadow-[0_3px_12px_0_rgba(0,0,0,0.04)] rounded-2xl font-['Iropke_Batang']">
            <p className="flex-1">{content}</p>
            <footer className="flex items-end"> - {author} -</footer>
          </blockquote>

          <ul aria-label="Tags" className="flex justify-end gap-4 mt-2">
            {/* index key 대신 id+tag 조합으로 key 안정성을 높인다. */}
            {tags.map((tag) => (
              <li key={`${id}-${tag}`}>
                <span>{tag}</span>
              </li>
            ))}
          </ul>
        </Link>
      </article>
    </li>
  );
}
