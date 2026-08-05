import {
  Bookmark,
  Play,
  Star,
  Info,
} from "lucide-react";

import {
  getPoster,
  getRating,
  getTitle,
  getYear,
} from "../utils/media";

export default function MovieCard({
  item,
  onSelect,
  onToggleList,
  isSaved,
}) {
  const title = getTitle(item);
  const poster = getPoster(item);
  const year = getYear(item);
  const rating = getRating(item);
  const saved = isSaved(item);

  return (
    <article
      className="movie-card"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSelect(item);
        }
      }}
    >
      <div className="poster">

        {poster ? (
          <img
            src={poster}
            alt={`${title} poster`}
            loading="lazy"
          />
        ) : (
          <div className="poster-empty">
            No poster
          </div>
        )}

        <div className="poster-shade" />

        <div className="card-top">
          <span className="media-badge">
            {item.media_type === "tv"
              ? "TV"
              : "MOVIE"}
          </span>

          {rating && (
            <span className="card-rating">
              <Star
                size={10}
                fill="currentColor"
              />
              {rating}
            </span>
          )}
        </div>

        <div className="card-overlay">

          <button
            className="card-play"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            aria-label={`Open ${title}`}
          >
            <Play
              size={18}
              fill="currentColor"
            />
          </button>

          <button
            className={`card-list ${
              saved ? "saved" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleList(item);
            }}
            aria-label="Toggle My List"
          >
            <Bookmark
              size={16}
              fill={
                saved
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

        </div>

      </div>

      <div className="movie-info">

        <h3 title={title}>
          {title}
        </h3>

        <div className="movie-meta">

          {year && (
            <span>{year}</span>
          )}

          <span className="movie-type">
            {item.media_type === "tv"
              ? "Series"
              : "Movie"}
          </span>

        </div>

      </div>
    </article>
  );
}