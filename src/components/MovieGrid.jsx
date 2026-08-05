import MovieCard from "./MovieCard";
import {
  LoaderCircle,
  SearchX,
} from "lucide-react";

export default function MovieGrid({
  items,
  loading,
  error,
  onSelect,
  onToggleList,
  isSaved,
}) {
  if (loading) {
    return (
      <div className="movie-grid">
        {Array.from({ length: 12 }).map(
          (_, index) => (
            <div
              className="skeleton-card"
              key={index}
            >
              <div className="skeleton-poster" />
              <div className="skeleton-line" />
              <div className="skeleton-small" />
            </div>
          )
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-box error-state">
        <SearchX size={30} />

        <strong>
          Could not load this section
        </strong>

        <p>{error}</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="state-box">
        <SearchX size={30} />

        <strong>No titles found</strong>

        <p>
          Try another search or choose a different
          section.
        </p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {items.map((item) => (
        <MovieCard
          key={`${item.media_type}-${item.id}`}
          item={item}
          onSelect={onSelect}
          onToggleList={onToggleList}
          isSaved={isSaved}
        />
      ))}
    </div>
  );
}